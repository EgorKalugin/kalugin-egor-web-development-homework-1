import { Link } from 'react-router-dom'
import type { Product } from '@/types/product'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/utils/format'
import styles from './ProductCard.module.css'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const outOfStock = product.stockQuantity <= 0

  return (
    <article className={styles.card}>
      <Link to={`/catalog/${product.id}`} className={styles.imageLink}>
        <div className={styles.image}>
          <span className={styles.imageEmoji} aria-hidden>💡</span>
          {product.badge && (
            <span className={styles.badge}>
              <Badge kind={product.badge} />
            </span>
          )}
        </div>
      </Link>
      <div className={styles.body}>
        <Link to={`/catalog/${product.id}`} className={styles.name}>
          {product.name}
        </Link>
        <div className={styles.meta}>
          {product.baseType} · {product.wattage} Вт
        </div>
        <div className={styles.price}>{formatPrice(product.price)}</div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => addItem(product.id)}
          disabled={outOfStock}
        >
          {outOfStock ? 'Нет в наличии' : 'В корзину'}
        </Button>
      </div>
    </article>
  )
}
