from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .. import catalog_client
from ..database import get_db
from ..models import Cart, CartItem
from ..schemas import (
    AddCartItemRequest,
    CartItemCreatedResponse,
    CartItemResponse,
    CartResponse,
    UpdateCartItemRequest,
)

router = APIRouter(prefix="/api/v1/cart", tags=["Cart"])


def get_session_id(
    x_session_id: Optional[str] = Header(None, alias="X-Session-ID"),
    session_id: Optional[str] = Cookie(None),
) -> Optional[str]:
    return x_session_id or session_id


async def get_cart_by_session(
    session_id: str, db: AsyncSession
) -> Optional[Cart]:
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items))
        .where(Cart.session_id == session_id)
    )
    return result.scalar_one_or_none()


async def get_or_create_cart(session_id: str, db: AsyncSession) -> Cart:
    cart = await get_cart_by_session(session_id, db)
    if not cart:
        cart = Cart(session_id=session_id)
        db.add(cart)
        await db.commit()
        # Re-fetch with selectinload to avoid lazy-load in async context
        result = await db.execute(
            select(Cart).options(selectinload(Cart.items)).where(Cart.session_id == session_id)
        )
        cart = result.scalar_one()
    return cart


async def build_cart_response(cart: Cart) -> CartResponse:
    """Enrich cart items with product data from catalog service."""
    enriched: list[CartItemResponse] = []
    total = Decimal("0.00")

    for item in cart.items:
        product = await catalog_client.get_product(item.product_id)
        if product is None:
            # Product no longer exists — skip silently
            continue
        price = Decimal(str(product["price"]))
        subtotal = price * item.quantity
        total += subtotal
        enriched.append(
            CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=product["name"],
                price=price,
                quantity=item.quantity,
                subtotal=subtotal,
            )
        )

    return CartResponse(id=cart.id, items=enriched, total=total)


@router.get("", response_model=CartResponse)
async def get_cart(
    session_id: Optional[str] = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    if not session_id:
        return CartResponse()

    cart = await get_cart_by_session(session_id, db)
    if not cart:
        return CartResponse()

    return await build_cart_response(cart)


@router.post("/items", response_model=CartItemCreatedResponse)
async def add_item(
    data: AddCartItemRequest,
    response: Response,
    session_id: Optional[str] = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    if not session_id:
        raise HTTPException(
            status_code=400, detail="X-Session-ID header or session_id cookie is required"
        )

    # Validate product in catalog
    product = await catalog_client.get_product(data.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    cart = await get_or_create_cart(session_id, db)

    # Check if item already in cart
    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == data.product_id,
        )
    )
    existing = result.scalar_one_or_none()
    current_in_cart = existing.quantity if existing else 0
    new_quantity = current_in_cart + data.quantity

    if new_quantity > product["stock_quantity"]:
        available = max(product["stock_quantity"] - current_in_cart, 0)
        raise HTTPException(
            status_code=400,
            detail={"error": "Insufficient stock", "available": available},
        )

    if existing:
        existing.quantity = new_quantity
        await db.commit()
        await db.refresh(existing)
        item = existing
    else:
        item = CartItem(
            cart_id=cart.id, product_id=data.product_id, quantity=new_quantity
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)

    response.set_cookie(key="session_id", value=session_id, httponly=True, samesite="lax")

    return CartItemCreatedResponse(
        cart_item_id=item.id,
        product_id=item.product_id,
        quantity=item.quantity,
    )


@router.patch("/items/{item_id}", response_model=CartItemCreatedResponse)
async def update_item(
    item_id: int,
    data: UpdateCartItemRequest,
    session_id: Optional[str] = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    if not session_id:
        raise HTTPException(
            status_code=400, detail="X-Session-ID header or session_id cookie is required"
        )

    result = await db.execute(
        select(CartItem)
        .join(Cart)
        .where(CartItem.id == item_id, Cart.session_id == session_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # Validate stock
    product = await catalog_client.get_product(item.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if data.quantity > product["stock_quantity"]:
        raise HTTPException(
            status_code=400,
            detail={"error": "Insufficient stock", "available": product["stock_quantity"]},
        )

    item.quantity = data.quantity
    await db.commit()
    await db.refresh(item)

    return CartItemCreatedResponse(
        cart_item_id=item.id,
        product_id=item.product_id,
        quantity=item.quantity,
    )


@router.delete("/items/{item_id}", status_code=204)
async def remove_item(
    item_id: int,
    session_id: Optional[str] = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    if not session_id:
        raise HTTPException(
            status_code=400, detail="X-Session-ID header or session_id cookie is required"
        )

    result = await db.execute(
        select(CartItem)
        .join(Cart)
        .where(CartItem.id == item_id, Cart.session_id == session_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.delete(item)
    await db.commit()


@router.delete("", status_code=204)
async def clear_cart(
    session_id: Optional[str] = Depends(get_session_id),
    db: AsyncSession = Depends(get_db),
):
    if not session_id:
        raise HTTPException(
            status_code=400, detail="X-Session-ID header or session_id cookie is required"
        )

    result = await db.execute(select(Cart).where(Cart.session_id == session_id))
    cart = result.scalar_one_or_none()
    if not cart:
        return

    await db.execute(delete(CartItem).where(CartItem.cart_id == cart.id))
    await db.commit()
