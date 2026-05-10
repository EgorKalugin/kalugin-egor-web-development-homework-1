import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { loadOrder } from '@/store/ordersSlice'
import { ORDER_STATUS_LABELS } from '@/types/order'
import { Button } from '@/components/ui/Button'
import { formatDateTime, formatPrice } from '@/utils/format'
import styles from './OrderConfirmationPage.module.css'

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const id = Number(orderId)
  const dispatch = useAppDispatch()
  const order = useAppSelector((s) =>
    Number.isFinite(id) ? s.orders.byId[id] : undefined,
  )
  const status = useAppSelector((s) => s.orders.detailStatus)
  const error = useAppSelector((s) => s.orders.detailError)

  useEffect(() => {
    if (Number.isFinite(id) && !order) {
      dispatch(loadOrder(id))
    }
  }, [dispatch, id, order])

  if (status === 'loading' && !order) {
    return <div className={`container ${styles.missing}`}>Загружаем заказ…</div>
  }

  if (!order) {
    return (
      <div className={`container ${styles.missing}`}>
        <h1>Заказ не найден</h1>
        <p>{error ?? 'Возможно, заказ был оформлен в другой сессии.'}</p>
        <Link to="/catalog">
          <Button>Перейти в каталог</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.success}>
        <div className={styles.successIcon} aria-hidden>✓</div>
        <h1 className={styles.successTitle}>Заказ принят</h1>
        <p className={styles.successText}>
          Спасибо! Мы отправили подтверждение на <strong>{order.shipping.email}</strong>
          {' '}и скоро свяжемся с вами по телефону <strong>{order.shipping.phone}</strong>.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.row}>
          <div>
            <div className={styles.muted}>Номер заказа</div>
            <div className={styles.orderId}>#{order.id}</div>
          </div>
          <div>
            <div className={styles.muted}>Оформлен</div>
            <div>{formatDateTime(order.createdAt)}</div>
          </div>
          <div>
            <div className={styles.muted}>Статус</div>
            <div>{ORDER_STATUS_LABELS[order.status]}</div>
          </div>
          <div>
            <div className={styles.muted}>Сумма</div>
            <div className={styles.total}>{formatPrice(order.totalAmount)}</div>
          </div>
        </div>

        <h2 className={styles.subtitle}>Состав заказа</h2>
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

        <h2 className={styles.subtitle}>Доставка</h2>
        <dl className={styles.shipping}>
          <dt>Получатель</dt><dd>{order.shipping.name}</dd>
          <dt>Телефон</dt><dd>{order.shipping.phone}</dd>
          <dt>Адрес</dt><dd>{order.shipping.address}</dd>
          {order.shipping.comment && (
            <>
              <dt>Комментарий</dt>
              <dd>{order.shipping.comment}</dd>
            </>
          )}
        </dl>

        <div className={styles.actions}>
          <Link to={`/orders/${order.id}`}>
            <Button>Отследить заказ</Button>
          </Link>
          <Link to="/catalog">
            <Button variant="secondary">Продолжить покупки</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
