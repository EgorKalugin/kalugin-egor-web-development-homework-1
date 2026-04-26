import math
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .. import catalog_client
from ..database import get_db
from ..models import Order, OrderItem, OrderStatus, OrderStatusHistory, VALID_TRANSITIONS
from ..routers.cart import get_session_id, get_cart_by_session
from ..schemas import (
    CheckoutRequest,
    OrderListResponse,
    OrderResponse,
    OrderSummaryResponse,
    Pagination,
    UpdateOrderStatusRequest,
)

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    data: CheckoutRequest,
    session_id: Optional[str] = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    if not session_id:
        raise HTTPException(status_code=400, detail={"error": "Cart not found"})

    cart = await get_cart_by_session(session_id, db)
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail={"error": "Cart is empty"})

    # Fetch all product details and check stock
    products: dict[int, dict] = {}
    unavailable: list[int] = []

    for item in cart.items:
        product = await catalog_client.get_product(item.product_id)
        if product is None or product["stock_quantity"] < item.quantity:
            unavailable.append(item.product_id)
        else:
            products[item.product_id] = product

    if unavailable:
        raise HTTPException(
            status_code=409,
            detail={"error": "Some items are no longer available", "unavailable": unavailable},
        )

    # Calculate total
    total = sum(
        Decimal(str(products[item.product_id]["price"])) * item.quantity
        for item in cart.items
    )

    # Create order
    order = Order(
        status=OrderStatus.new,
        total_amount=total,
        shipping_name=data.shipping_name,
        shipping_phone=data.shipping_phone,
        shipping_email=data.shipping_email,
        shipping_address=data.shipping_address,
        comment=data.comment,
    )
    db.add(order)
    await db.flush()  # populate order.id

    # Create order items (price snapshots)
    for item in cart.items:
        product = products[item.product_id]
        price = Decimal(str(product["price"]))
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                product_name=product["name"],
                product_sku=product["sku"],
                quantity=item.quantity,
                price_per_unit=price,
                total_price=price * item.quantity,
            )
        )

    # Initial status history entry
    db.add(OrderStatusHistory(order_id=order.id, status=OrderStatus.new))

    await db.commit()

    # Decrement stock in catalog service (best-effort)
    for item in cart.items:
        product = products[item.product_id]
        new_stock = product["stock_quantity"] - item.quantity
        try:
            await catalog_client.update_product_stock(item.product_id, new_stock)
        except Exception as exc:
            print(f"[WARN] Failed to decrement stock for product {item.product_id}: {exc}")

    # Clear cart items
    cart_items = list(cart.items)
    for ci in cart_items:
        await db.delete(ci)
    await db.commit()

    # Reload with relationships for response
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.status_history))
        .where(Order.id == order.id)
    )
    return result.scalar_one()


@router.get("", response_model=OrderListResponse)
async def list_orders(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order)
    if status:
        try:
            status_enum = OrderStatus(status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")
        query = query.where(Order.status == status_enum)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()

    pages = math.ceil(total / limit) if total > 0 else 1

    return OrderListResponse(
        data=orders,
        pagination=Pagination(page=page, limit=limit, total=total, pages=pages),
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.status_history))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    data: UpdateOrderStatusRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        new_status = OrderStatus(data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status: {data.status}")

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.status_history))
        .where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    current_status = OrderStatus(order.status)
    allowed = VALID_TRANSITIONS.get(current_status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition: {current_status.value} → {new_status.value}",
        )

    order.status = new_status
    order.updated_at = datetime.now(timezone.utc)

    db.add(OrderStatusHistory(order_id=order.id, status=new_status, note=data.note))
    await db.commit()

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.status_history))
        .where(Order.id == order_id)
        .execution_options(populate_existing=True)
    )
    return result.scalar_one()
