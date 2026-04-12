# Database Schema: Admin Panel Service

## Overview

Manages admin users, roles, and audit logs for the back-office panel.

---

## Tables

### `admin_users`

| Column        | Type         | Constraints              | Description                        |
|---------------|--------------|--------------------------|------------------------------------|
| id            | SERIAL       | PRIMARY KEY              | Admin user identifier              |
| username      | VARCHAR(50)  | NOT NULL, UNIQUE         | Login username                     |
| email         | VARCHAR(200) | NOT NULL, UNIQUE         | Email address                      |
| password_hash | VARCHAR(255) | NOT NULL                 | Bcrypt password hash               |
| role          | admin_role   | NOT NULL, DEFAULT 'manager' | Role (see enum)                 |
| is_active     | BOOLEAN      | NOT NULL, DEFAULT TRUE   | Whether account is enabled         |
| created_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()  | Account creation timestamp         |
| updated_at    | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()  | Last update timestamp              |
| last_login_at | TIMESTAMPTZ  |                          | Last successful login timestamp    |

**Enum `admin_role`:** `super_admin`, `manager`, `warehouse`

| Role          | Permissions                                              |
|---------------|----------------------------------------------------------|
| super_admin   | Full access: manage admins, products, orders, settings   |
| manager       | Manage products and orders                               |
| warehouse     | View products, update stock quantities                   |

---

### `admin_sessions`

| Column      | Type         | Constraints                       | Description                  |
|-------------|--------------|-----------------------------------|------------------------------|
| id          | SERIAL       | PRIMARY KEY                       | Session identifier           |
| admin_id    | INT          | NOT NULL, FK → admin_users(id)    | Admin user reference         |
| token_hash  | VARCHAR(255) | NOT NULL, UNIQUE                  | Hashed session token         |
| ip_address  | VARCHAR(45)  |                                   | Client IP address            |
| user_agent  | TEXT         |                                   | Client user-agent            |
| expires_at  | TIMESTAMPTZ  | NOT NULL                          | Session expiry timestamp     |
| created_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()           | Session creation timestamp   |

---

### `audit_logs`

| Column      | Type         | Constraints                       | Description                          |
|-------------|--------------|-----------------------------------|--------------------------------------|
| id          | SERIAL       | PRIMARY KEY                       | Log entry identifier                 |
| admin_id    | INT          | NOT NULL, FK → admin_users(id)    | Admin who performed the action       |
| action      | VARCHAR(100) | NOT NULL                          | Action performed (e.g. UPDATE_PRODUCT) |
| entity_type | VARCHAR(50)  | NOT NULL                          | Affected entity type (product, order, admin) |
| entity_id   | INT          |                                   | Affected entity ID                   |
| old_value   | JSONB        |                                   | Snapshot before change               |
| new_value   | JSONB        |                                   | Snapshot after change                |
| created_at  | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()           | When action occurred                 |

---

## Indexes

```sql
CREATE INDEX idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

## ER Diagram (text)

```
admin_users (1) ──< admin_sessions
admin_users (1) ──< audit_logs
```
