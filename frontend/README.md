# Лампочки — Frontend (HW-3)

Пользовательская часть интернет-магазина завода лампочек на **React 18 + TypeScript + Vite + React Router DOM**. Бэкенд не используется — данные mock-овые.

## Требования

- Node.js 18+ (рекомендуется 20+)
- npm 9+

## Запуск

```bash
cd frontend
npm install
npm run dev
```

Откроется на http://localhost:5173.

### Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер с HMR |
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
| `/orders/:orderId` | Отслеживание заказа (timeline + симуляция статусов) |
| любой другой | 404 |

## Структура

```
src/
├── main.tsx                # точка входа
├── router.tsx              # createBrowserRouter
├── styles/                 # theme.css, reset.css
├── types/                  # Product, Order, OrderStatus
├── data/                   # mock-категории и 20 SKU
├── context/                # CartContext (localStorage), OrdersContext
├── components/
│   ├── layout/             # Header, Footer, RootLayout
│   ├── product/            # ProductCard, ProductGrid, ProductFilters
│   ├── cart/               # CartLine, CartSummary
│   ├── order/              # CheckoutForm, OrderStatusTimeline
│   └── ui/                 # Button, Badge
├── pages/                  # HomePage, CatalogPage, ProductPage, ...
└── utils/                  # format helpers
```

## Особенности реализации

- Корзина переживает перезагрузку страницы (хранится в `localStorage`).
- Заказы хранятся в памяти текущей сессии (на трекинге это ожидаемо — без бэкенда).
- На странице трекинга можно симулировать переходы статусов: `new → confirmed → processing → shipped → delivered`.
- Дизайн выровнен с прототипом каталога в Figma (`fileKey z5Aj1EXAJ6XkwSQfP5AwrM`): сетка карточек 236×280, бейджи Хит/Новинка/Скидка, фильтры по типу лампы / мощности / цоколю / цене.
