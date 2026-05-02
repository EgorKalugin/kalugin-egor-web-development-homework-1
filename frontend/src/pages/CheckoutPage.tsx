import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useOrders } from '@/context/OrdersContext'
import { findProduct } from '@/data/products'
import { CartSummary } from '@/components/cart/CartSummary/CartSummary'
import { CheckoutForm } from '@/components/order/CheckoutForm/CheckoutForm'
import { formatPrice } from '@/utils/format'
import styles from './CheckoutPage.module.css'

export default function CheckoutPage() {
  const { items, subtotal, itemCount, clear } = useCart()
  const { createOrder } = useOrders()
  const navigate = useNavigate()

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [items.length, navigate])

  if (items.length === 0) {
    return null
  }

  const handleSubmit = (shipping: Parameters<typeof createOrder>[1]) => {
    const order = createOrder(items, shipping)
    clear()
    navigate(`/orders/${order.id}/confirmation`, { replace: true })
  }

  return (
    <div className={`container ${styles.layout}`}>
      <div className={styles.left}>
        <h1 className={styles.title}>Оформление заказа</h1>

        <section className={styles.itemsCard} aria-label="Состав заказа">
          <h2 className={styles.subtitle}>В вашем заказе</h2>
          <ul className={styles.items}>
            {items.map((it) => {
              const p = findProduct(it.productId)
              if (!p) return null
              return (
                <li key={it.productId} className={styles.item}>
                  <span className={styles.itemName}>
                    {p.name} <span className={styles.itemQty}>× {it.quantity}</span>
                  </span>
                  <span>{formatPrice(p.price * it.quantity)}</span>
                </li>
              )
            })}
          </ul>
        </section>

        <CheckoutForm onSubmit={handleSubmit} />
      </div>

      <CartSummary itemCount={itemCount} subtotal={subtotal} />
    </div>
  )
}
