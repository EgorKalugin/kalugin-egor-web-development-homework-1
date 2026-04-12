# Database Schema: Catalog Service

## Overview

Stores product catalog data for the light bulb factory store (20 SKUs).

---

## Tables

### `categories`

| Column        | Type         | Constraints            | Description                  |
|---------------|--------------|------------------------|------------------------------|
| id            | SERIAL       | PRIMARY KEY            | Category identifier          |
| name          | VARCHAR(100) | NOT NULL, UNIQUE       | Category name                |
| description   | TEXT         |                        | Category description         |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()| Creation timestamp           |

**Sample categories:** LED, Halogen, Fluorescent, Incandescent, Smart

---

### `products`

| Column         | Type           | Constraints                       | Description                            |
|----------------|----------------|-----------------------------------|----------------------------------------|
| id             | SERIAL         | PRIMARY KEY                       | Product identifier                     |
| sku            | VARCHAR(50)    | NOT NULL, UNIQUE                  | Stock keeping unit                     |
| name           | VARCHAR(200)   | NOT NULL                          | Product name                           |
| description    | TEXT           |                                   | Full product description               |
| category_id    | INT            | NOT NULL, FK → categories(id)     | Category reference                     |
| price          | NUMERIC(10,2)  | NOT NULL, CHECK (price >= 0)      | Retail price (RUB)                     |
| stock_quantity | INT            | NOT NULL, DEFAULT 0, CHECK (≥ 0)  | Units in stock                         |
| image_url      | VARCHAR(500)   |                                   | Primary product image URL              |
| wattage        | NUMERIC(6,1)   |                                   | Power consumption (W)                  |
| voltage        | INT            |                                   | Operating voltage (V)                  |
| base_type      | VARCHAR(20)    |                                   | Lamp base type (E27, E14, GU10, etc.)  |
| color_temp     | INT            |                                   | Color temperature (K)                  |
| lifespan_hours | INT            |                                   | Rated lifespan (hours)                 |
| is_active      | BOOLEAN        | NOT NULL, DEFAULT TRUE            | Whether product is listed              |
| created_at     | TIMESTAMPTZ    | NOT NULL, DEFAULT NOW()           | Creation timestamp                     |
| updated_at     | TIMESTAMPTZ    | NOT NULL, DEFAULT NOW()           | Last update timestamp                  |

---

### `product_images`

| Column      | Type         | Constraints                   | Description              |
|-------------|--------------|-------------------------------|--------------------------|
| id          | SERIAL       | PRIMARY KEY                   | Image identifier         |
| product_id  | INT          | NOT NULL, FK → products(id)   | Product reference        |
| url         | VARCHAR(500) | NOT NULL                      | Image URL                |
| sort_order  | INT          | NOT NULL, DEFAULT 0           | Display order            |

---

## Indexes

```sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_product_images_product ON product_images(product_id);
```

## ER Diagram (text)

```
categories (1) ──< products (1) ──< product_images
```
