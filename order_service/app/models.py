import enum

from sqlalchemy import (
    Column, Enum, ForeignKey, Integer, Numeric, String, Text, TIMESTAMP, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class OrderStatus(str, enum.Enum):
    new = "new"
    confirmed = "confirmed"
    processing = "processing"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


# Valid status transitions
VALID_TRANSITIONS: dict[OrderStatus, list[OrderStatus]] = {
    OrderStatus.new: [OrderStatus.confirmed, OrderStatus.cancelled],
    OrderStatus.confirmed: [OrderStatus.processing, OrderStatus.cancelled],
    OrderStatus.processing: [OrderStatus.shipped, OrderStatus.cancelled],
    OrderStatus.shipped: [OrderStatus.delivered],
    OrderStatus.delivered: [],
    OrderStatus.cancelled: [],
}


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    session_id = Column(String(64), index=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (UniqueConstraint("cart_id", "product_id"),)

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False, index=True)
    product_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    added_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    cart = relationship("Cart", back_populates="items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    status = Column(
        Enum(OrderStatus, name="order_status"),
        nullable=False,
        default=OrderStatus.new,
        index=True,
    )
    total_amount = Column(Numeric(12, 2), nullable=False)
    shipping_name = Column(String(200), nullable=False)
    shipping_phone = Column(String(20), nullable=False)
    shipping_email = Column(String(200), nullable=False)
    shipping_address = Column(Text, nullable=False)
    comment = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    items = relationship("OrderItem", back_populates="order")
    status_history = relationship(
        "OrderStatusHistory",
        back_populates="order",
        order_by="OrderStatusHistory.changed_at",
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(Integer, nullable=False)
    product_name = Column(String(200), nullable=False)
    product_sku = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_per_unit = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(12, 2), nullable=False)

    order = relationship("Order", back_populates="items")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    status = Column(Enum(OrderStatus, name="order_status"), nullable=False)
    changed_by = Column(Integer)
    note = Column(Text)
    changed_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    order = relationship("Order", back_populates="status_history")
