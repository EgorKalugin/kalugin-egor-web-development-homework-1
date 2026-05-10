import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { loadCart } from '@/store/cartSlice'
import { placeOrder, resetCreateStatus } from '@/store/ordersSlice'
import { CartSummary } from '@/components/cart/CartSummary/CartSummary'
import { CheckoutForm } from '@/components/order/CheckoutForm/CheckoutForm'
import { formatPrice } from '@/utils/format'
import type { ShippingInfo } from '@/types/order'
import styles from './CheckoutPage.module.css'

export default function CheckoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const items = useAppSelector((s) => s.cart.items)
  const total = useAppSelector((s) => s.cart.total)
  const cartStatus = useAppSelector((s) => s.cart.status)

  const createStatus = useAppSelector((s) => s.orders.createStatus)
  const createError = useAppSelector((s) => s.orders.createError)
  const lastCreatedOrderId = useAppSelector((s) => s.orders.lastCreatedOrderId)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    dispatch(resetCreateStatus())
  }, [dispatch])

  useEffect(() => {
    if (cartStatus === 'succeeded' && items.length === 0 && createStatus !== 'succeeded') {
      navigate('/cart', { replace: true })
    }
  }, [cartStatus, items.length, createStatus, navigate])

  useEffect(() => {
    if (createStatus === 'succeeded' && lastCreatedOrderId !== null) {
      // Refresh cart (now empty after checkout)
      dispatch(loadCart())
      navigate(`/orders/${lastCreatedOrderId}/confirmation`, { replace: true })
    }
  }, [createStatus, lastCreatedOrderId, dispatch, navigate])

  if (items.length === 0) {
    return null
  }

  const handleSubmit = (shipping: ShippingInfo) => {
    dispatch(placeOrder(shipping))
  }

  return (
    <div className={`container ${styles.layout}`}>
      <div className={styles.left}>
        <h1 className={styles.title}>Оформление заказа</h1>

        <section className={styles.itemsCard} aria-label="Состав заказа">
          <h2 className={styles.subtitle}>В вашем заказе</h2>
          <ul className={styles.items}>
            {items.map((it) => (
              <li key={it.id} className={styles.item}>
                <span className={styles.itemName}>
                  {it.productName} <span className={styles.itemQty}>× {it.quantity}</span>
                </span>
                <span>{formatPrice(it.subtotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        {createError && <p className={styles.error}>{createError}</p>}

        <CheckoutForm
          onSubmit={handleSubmit}
          submitting={createStatus === 'loading'}
        />
      </div>

      <CartSummary itemCount={itemCount} subtotal={total} />
    </div>
  )
}
