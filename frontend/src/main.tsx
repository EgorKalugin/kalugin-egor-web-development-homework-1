import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { CartProvider } from './context/CartContext'
import { OrdersProvider } from './context/OrdersContext'
import './styles/reset.css'
import './styles/theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OrdersProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </OrdersProvider>
  </StrictMode>,
)
