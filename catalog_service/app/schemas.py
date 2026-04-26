from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str] = None


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    sort_order: int


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    description: Optional[str] = None
    category_id: int
    price: Decimal
    stock_quantity: int
    image_url: Optional[str] = None
    wattage: Optional[Decimal] = None
    voltage: Optional[int] = None
    base_type: Optional[str] = None
    color_temp: Optional[int] = None
    lifespan_hours: Optional[int] = None


class ProductDetail(ProductListItem):
    category: CategoryResponse
    images: List[ProductImageResponse] = []


class Pagination(BaseModel):
    page: int
    limit: int
    total: int
    pages: int


class ProductListResponse(BaseModel):
    data: List[ProductListItem]
    pagination: Pagination


class ProductCreate(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category_id: int
    price: Decimal
    stock_quantity: int = 0
    image_url: Optional[str] = None
    wattage: Optional[Decimal] = None
    voltage: Optional[int] = None
    base_type: Optional[str] = None
    color_temp: Optional[int] = None
    lifespan_hours: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    wattage: Optional[Decimal] = None
    voltage: Optional[int] = None
    base_type: Optional[str] = None
    color_temp: Optional[int] = None
    lifespan_hours: Optional[int] = None
    is_active: Optional[bool] = None


class ProductCreatedResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
