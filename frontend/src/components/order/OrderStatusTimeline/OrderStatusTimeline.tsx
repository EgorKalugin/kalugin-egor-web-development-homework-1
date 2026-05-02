import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from '@/types/order'
import { formatDateTime } from '@/utils/format'
import styles from './OrderStatusTimeline.module.css'

export function OrderStatusTimeline({ order }: { order: Order }) {
  const reachedIndex = ORDER_STATUS_FLOW.indexOf(order.status)
  const cancelled = order.status === 'cancelled'

  if (cancelled) {
    return (
      <div className={`${styles.cancelled}`}>
        Заказ отменён.
      </div>
    )
  }

  const eventByStatus = new Map<OrderStatus, string>()
  for (const ev of order.statusHistory) {
    eventByStatus.set(ev.status, ev.changedAt)
  }

  return (
    <ol className={styles.timeline}>
      {ORDER_STATUS_FLOW.map((status, idx) => {
        const reached = idx <= reachedIndex
        const current = idx === reachedIndex
        const at = eventByStatus.get(status)
        return (
          <li
            key={status}
            className={`${styles.step} ${reached ? styles.reached : ''} ${
              current ? styles.current : ''
            }`}
          >
            <span className={styles.dot} aria-hidden />
            <div className={styles.labels}>
              <span className={styles.label}>{ORDER_STATUS_LABELS[status]}</span>
              {at && <span className={styles.time}>{formatDateTime(at)}</span>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
