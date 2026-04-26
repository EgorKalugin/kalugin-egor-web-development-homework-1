from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    price: Decimal
    quantity: int
    subtotal: Decimal


class CartResponse(BaseModel):
    id: Optional[int] = None
    items: List[CartItemResponse] = []
    total: Decimal = Decimal("0.00")


class AddCartItemRequest(BaseModel):
    product_id: int
    quantity: int = 1

    model_config = ConfigDict(json_schema_extra={"example": {"product_id": 5, "quantity": 2}})


class UpdateCartItemRequest(BaseModel):
    quantity: int


class CartItemCreatedResponse(BaseModel):
    cart_item_id: int
    product_id: int
    quantity: int


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_name: str
    product_sku: str
    quantity: int
    price_per_unit: Decimal
    total_price: Decimal


class StatusHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: str
    note: Optional[str] = None
    changed_at: datetime


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    total_amount: Decimal
    shipping_name: str
    shipping_phone: str
    shipping_email: str
    shipping_address: str
    comment: Optional[str] = None
    items: List[OrderItemResponse]
    status_history: List[StatusHistoryResponse]
    created_at: datetime


class OrderSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    total_amount: Decimal
    shipping_name: str
    created_at: datetime


class Pagination(BaseModel):
    page: int
    limit: int
    total: int
    pages: int


class OrderListResponse(BaseModel):
    data: List[OrderSummaryResponse]
    pagination: Pagination


class CheckoutRequest(BaseModel):
    shipping_name: str
    shipping_phone: str
    shipping_email: str
    shipping_address: str
    comment: Optional[str] = None


class UpdateOrderStatusRequest(BaseModel):
    status: str
    note: Optional[str] = None
