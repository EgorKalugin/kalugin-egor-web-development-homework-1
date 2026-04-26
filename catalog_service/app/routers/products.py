import math
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models import Category, Product
from ..schemas import (
    ProductCreate,
    ProductCreatedResponse,
    ProductDetail,
    ProductListItem,
    ProductListResponse,
    ProductUpdate,
    Pagination,
)

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
async def list_products(
    category_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    sort: Optional[str] = Query(None, pattern="^(price_asc|price_desc|name_asc)$"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).where(Product.is_active == True)

    if category_id is not None:
        query = query.where(Product.category_id == category_id)
    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
                Product.sku.ilike(pattern),
            )
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    else:
        query = query.order_by(Product.name.asc())

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()

    pages = math.ceil(total / limit) if total > 0 else 1

    return ProductListResponse(
        data=products,
        pagination=Pagination(page=page, limit=limit, total=total, pages=pages),
    )


@router.get("/{product_id}", response_model=ProductDetail)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.category), selectinload(Product.images))
        .where(Product.id == product_id, Product.is_active == True)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductCreatedResponse, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Product).where(Product.sku == data.sku))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="SKU already exists")

    cat = await db.execute(select(Category).where(Category.id == data.category_id))
    if not cat.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Category not found")

    product = Product(**data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductListItem)
async def update_product(
    product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in data.model_dump(exclude_none=True).items():
        setattr(product, key, value)
    product.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_active = False
    product.updated_at = datetime.now(timezone.utc)
    await db.commit()
