import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { advanceOrderStatus, loadOrder } from '@/store/ordersSlice'
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@/types/order'
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline/OrderStatusTimeline'
import { Button } from '@/components/ui/Button'
import { formatDateTime, formatPrice } from '@/utils/format'
import styles from './OrderTrackingPage.module.css'

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const id = Number(orderId)
  const dispatch = useAppDispatch()
  const order = useAppSelector((s) =>
    Number.isFinite(id) ? s.orders.byId[id] : undefined,
  )
  const status = useAppSelector((s) => s.orders.detailStatus)
  const error = useAppSelector((s) => s.orders.detailError)

  useEffect(() => {
    if (Number.isFinite(id)) {
      dispatch(loadOrder(id))
    }
  }, [dispatch, id])

  if (status === 'loading' && !order) {
    return <div className={`container ${styles.missing}`}>Загружаем заказ…</div>
  }

  if (!order) {
    return (
      <div className={`container ${styles.missing}`}>
        <h1>Заказ не найден</h1>
        <p>{error ?? 'Возможно, ссылка устарела.'}</p>
        <Link to="/catalog">
          <Button>В каталог</Button>
        </Link>
      </div>
    )
  }

  const idx = ORDER_STATUS_FLOW.indexOf(order.status)
  const isFinal =
    order.status === 'delivered' ||
    order.status === 'cancelled' ||
    idx === ORDER_STATUS_FLOW.length - 1

  const nextStatus: OrderStatus | null =
    idx >= 0 && idx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[idx + 1] : null

  return (
    <div className={`container ${styles.wrap}`}>
      <header className={styles.head}>
        <div>
          <Link to="/catalog" className={styles.back}>← В каталог</Link>
          <h1 className={styles.title}>Заказ #{order.id}</h1>
          <p className={styles.meta}>
            Оформлен {formatDateTime(order.createdAt)} ·{' '}
            <strong>{ORDER_STATUS_LABELS[order.status]}</strong>
          </p>
        </div>
        <div className={styles.totalBlock}>
          <div className={styles.totalLabel}>Итого</div>
          <div className={styles.total}>{formatPrice(order.totalAmount)}</div>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Статус заказа</h2>
        <OrderStatusTimeline order={order} />
        {!isFinal && nextStatus && (
          <div className={styles.simulate}>
            <Button
              variant="secondary"
              onClick={() =>
                dispatch(advanceOrderStatus({ id: order.id, status: nextStatus }))
              }
            >
              Симулировать следующий статус →
            </Button>
            <span className={styles.simulateNote}>
              Демонстрация смены статуса (PATCH /orders/:id/status)
            </span>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>История</h2>
        <ul className={styles.history}>
          {[...order.statusHistory].reverse().map((event, idx) => (
            <li key={idx} className={styles.historyItem}>
              <span className={styles.historyStatus}>
                {ORDER_STATUS_LABELS[event.status]}
              </span>
              <span className={styles.historyTime}>
                {formatDateTime(event.changedAt)}
              </span>
              {event.note && <span className={styles.historyNote}>{event.note}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Состав</h2>
        <ul className={styles.items}>
          {order.items.map((item, idx) => (
            <li key={idx} className={styles.item}>
              <span>
                {item.productName}{' '}
                <span className={styles.muted}>× {item.quantity}</span>
              </span>
              <span>{formatPrice(item.totalPrice)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
