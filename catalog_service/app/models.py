from sqlalchemy import (
    Boolean, Column, ForeignKey, Integer, Numeric, String, Text, TIMESTAMP,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    image_url = Column(String(500))
    wattage = Column(Numeric(6, 1))
    voltage = Column(Integer)
    base_type = Column(String(20))
    color_temp = Column(Integer)
    lifespan_hours = Column(Integer)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    category = relationship("Category", back_populates="products")
    images = relationship(
        "ProductImage", back_populates="product", order_by="ProductImage.sort_order"
    )


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    url = Column(String(500), nullable=False)
    sort_order = Column(Integer, nullable=False, default=0)

    product = relationship("Product", back_populates="images")
