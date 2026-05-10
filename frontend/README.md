# Лампочки — Frontend (HW-4)

Пользовательская часть интернет-магазина завода лампочек: **React 18 + TypeScript + Vite + React Router + Redux Toolkit**.
Все данные приходят из микросервисов `catalog_service` (порт 3001) и `order_service` (порт 3002) по HTTP с использованием `fetch`.

## Требования

- Node.js 18+ (рекомендуется 20+)
- npm 9+
- Запущенные backend-сервисы (см. корневой `docker-compose.yml`)

## Запуск

### В docker compose (всё в контейнерах)

```bash
# из корня репозитория
docker compose up -d --build
```

После старта:
- frontend — http://localhost:5173
- catalog_service — http://localhost:3001
- order_service — http://localhost:3002

URL бэкендов вшиваются в бандл на этапе сборки. Переопределить можно через переменные окружения для compose:

```bash
VITE_CATALOG_URL=http://example.com:3001 \
VITE_ORDERS_URL=http://example.com:3002 \
docker compose up -d --build frontend
```

### Локально (vite dev-сервер)

```bash
# 1. Поднять backend (из корня репозитория)
docker compose up -d catalog_db orders_db catalog_service order_service

# 2. Поднять frontend
cd frontend
npm install
npm run dev
```

Frontend по умолчанию ходит на `http://localhost:3001` (catalog) и `http://localhost:3002` (orders).
Эти URL можно переопределить через `.env`:

```env
VITE_CATALOG_URL=http://localhost:3001
VITE_ORDERS_URL=http://localhost:3002
```

### Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер с HMR на порту 5173 |
| `npm run build` | production-сборка в `dist/` |
| `npm run preview` | локальный просмотр собранного бандла |
| `npm run typecheck` | проверка TypeScript без сборки |

## Маршруты

| Путь | Страница |
|---|---|
| `/` | Главная (баннер, акции, популярные товары, новинки) |
| `/catalog` | Каталог с фильтрами (тип, мощность, цоколь, цена) и сортировкой |
| `/catalog/:productId` | Карточка товара |
| `/cart` | Корзина |
| `/checkout` | Оформление заказа |
| `/orders/:orderId/confirmation` | Подтверждение заказа |
| `/orders/:orderId` | Отслеживание заказа (timeline + смена статуса) |
| любой другой | 404 |

## Архитектура

```
src/
├── main.tsx                # точка входа: Provider<store> + RouterProvider + CartBootstrap
├── router.tsx              # createBrowserRouter
├── store/                  # Redux Toolkit
│   ├── index.ts            # configureStore + типизированные хуки
│   ├── productsSlice.ts    # каталог + категории + детальная карточка
│   ├── cartSlice.ts        # корзина (load/add/update/remove/clear через thunks)
│   └── ordersSlice.ts      # создание/чтение/смена статуса заказов
├── api/                    # клиентский слой поверх fetch
│   ├── client.ts           # fetch-обёртка, X-Session-ID, ApiError
│   ├── products.ts         # GET /api/v1/products[/{id}], /api/v1/categories
│   ├── cart.ts             # CRUD корзины
│   ├── orders.ts           # POST /api/v1/orders, GET, PATCH /status
│   ├── mappers.ts          # DTO → domain (snake_case → camelCase)
│   └── types.ts            # DTO-типы (как у бэкенда)
├── types/                  # доменные типы (Product, Cart, Order, ...)
├── components/
│   ├── CartBootstrap.tsx   # на старте: loadCart() + loadCategories()
│   ├── layout/             # Header (counter из Redux), Footer, RootLayout
│   ├── product/            # ProductCard, ProductGrid, ProductFilters
│   ├── cart/               # CartLine, CartSummary
│   ├── order/              # CheckoutForm, OrderStatusTimeline
│   └── ui/                 # Button
├── pages/                  # HomePage, CatalogPage, ProductPage, ...
└── utils/                  # format helpers
```

## Управление состоянием

Redux Toolkit — единственный источник правды для:

- **products** — текущий список товаров (с фильтрами/сортировкой/поиском), категории, детальная карточка, статусы загрузки.
- **cart** — серверная корзина (`id`, `items[]`, `total`), флаги `mutating` / `error`.
- **orders** — `byId`, `lastCreatedOrderId`, статусы создания/загрузки.

Все мутации идут через `createAsyncThunk` → `fetch` → reducer. UI читает данные через типизированный `useAppSelector`.

## Сессия пользователя

`getSessionId()` (см. `api/client.ts`) генерирует UUID при первом вызове и сохраняет в `localStorage` (`lampochki.sessionId`). Этот id отправляется в заголовке `X-Session-ID` во все запросы к `order_service` — по нему сервер находит/создаёт корзину пользователя.
