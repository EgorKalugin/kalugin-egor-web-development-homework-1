# Database Schema: Order Service

## Overview

Manages shopping carts, orders, order items, and order status history.

---

## Tables

### `carts`

| Column     | Type        | Constraints             | Description           |
|------------|-------------|-------------------------|-----------------------|
| id         | SERIAL      | PRIMARY KEY             | Cart identifier       |
| user_id    | INT         |                         | User (NULL = guest)   |
| session_id | VARCHAR(64) |                         | Session token (guest) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp    |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Constraint:** At least one of `user_id` or `session_id` must be set.

---

### `cart_items`

| Column     | Type          | Constraints                    | Description                   |
|------------|---------------|--------------------------------|-------------------------------|
| id         | SERIAL        | PRIMARY KEY                    | Cart item identifier          |
| cart_id    | INT           | NOT NULL, FK → carts(id)       | Cart reference                |
| product_id | INT           | NOT NULL                       | Product ID (from catalog svc) |
| quantity   | INT           | NOT NULL, CHECK (quantity > 0) | Quantity in cart              |
| added_at   | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()        | When item was added           |

**Constraint:** UNIQUE (cart_id, product_id)

---

### `orders`

| Column           | Type           | Constraints               | Description                         |
|------------------|----------------|---------------------------|-------------------------------------|
| id               | SERIAL         | PRIMARY KEY               | Order identifier                    |
| user_id          | INT            |                           | User (NULL = guest checkout)        |
| status           | order_status   | NOT NULL, DEFAULT 'new'   | Current order status (see enum)     |
| total_amount     | NUMERIC(12,2)  | NOT NULL                  | Total order amount (RUB)            |
| shipping_name    | VARCHAR(200)   | NOT NULL                  | Recipient full name                 |
| shipping_phone   | VARCHAR(20)    | NOT NULL                  | Recipient phone number              |
| shipping_email   | VARCHAR(200)   | NOT NULL                  | Recipient email                     |
| shipping_address | TEXT           | NOT NULL                  | Delivery address                    |
| comment          | TEXT           |                           | Customer comment                    |
| created_at       | TIMESTAMPTZ    | NOT NULL, DEFAULT NOW()   | Order placement timestamp           |
| updated_at       | TIMESTAMPTZ    | NOT NULL, DEFAULT NOW()   | Last update timestamp               |

**Enum `order_status`:** `new`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

---

### `order_items`

| Column          | Type           | Constraints                   | Description                        |
|-----------------|----------------|-------------------------------|------------------------------------|
| id              | SERIAL         | PRIMARY KEY                   | Order item identifier              |
| order_id        | INT            | NOT NULL, FK → orders(id)     | Order reference                    |
| product_id      | INT            | NOT NULL                      | Product ID (from catalog svc)      |
| product_name    | VARCHAR(200)   | NOT NULL                      | Product name snapshot              |
| product_sku     | VARCHAR(50)    | NOT NULL                      | Product SKU snapshot               |
| quantity        | INT            | NOT NULL, CHECK (quantity > 0)| Quantity ordered                   |
| price_per_unit  | NUMERIC(10,2)  | NOT NULL                      | Price per unit at time of order    |
| total_price     | NUMERIC(12,2)  | NOT NULL                      | quantity × price_per_unit          |

---

### `order_status_history`

| Column     | Type         | Constraints               | Description                    |
|------------|--------------|---------------------------|--------------------------------|
| id         | SERIAL       | PRIMARY KEY               | History record identifier      |
| order_id   | INT          | NOT NULL, FK → orders(id) | Order reference                |
| status     | order_status | NOT NULL                  | Status value at this point     |
| changed_by | INT          |                           | Admin user who changed status  |
| note       | TEXT         |                           | Optional note                  |
| changed_at | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()   | When status changed            |

---

## Indexes

```sql
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
```

## ER Diagram (text)

```
carts (1) ──< cart_items

orders (1) ──< order_items
orders (1) ──< order_status_history
```
