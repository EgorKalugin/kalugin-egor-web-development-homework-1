import { formatPrice } from '@/utils/format'
import styles from './CartSummary.module.css'

interface Props {
  itemCount: number
  subtotal: number
  shipping?: number
  cta?: React.ReactNode
}

export function CartSummary({ itemCount, subtotal, shipping = 0, cta }: Props) {
  const total = subtotal + shipping
  return (
    <aside className={styles.summary} aria-label="Итог заказа">
      <h2 className={styles.title}>Ваш заказ</h2>
      <Row label={`Товары (${itemCount} шт.)`} value={formatPrice(subtotal)} />
      <Row
        label="Доставка"
        value={shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}
      />
      <hr className={styles.divider} />
      <Row label="Итого" value={formatPrice(total)} strong />
      {cta && <div className={styles.cta}>{cta}</div>}
    </aside>
  )
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className={`${styles.row} ${strong ? styles.rowStrong : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
