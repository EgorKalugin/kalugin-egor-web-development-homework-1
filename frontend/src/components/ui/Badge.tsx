import type { ProductBadge } from '@/types/product'
import styles from './Badge.module.css'

const LABELS: Record<ProductBadge, string> = {
  hit: 'Хит',
  new: 'Новинка',
  sale: 'Скидка',
}

export function Badge({ kind }: { kind: ProductBadge }) {
  return <span className={`${styles.badge} ${styles[kind]}`}>{LABELS[kind]}</span>
}
