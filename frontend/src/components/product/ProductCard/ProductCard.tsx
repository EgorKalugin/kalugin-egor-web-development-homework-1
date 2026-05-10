import { Link } from 'react-router-dom'
import type { Product } from '@/types/product'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/store'
import { addToCart } from '@/store/cartSlice'
import { formatPrice } from '@/utils/format'
import styles from './ProductCard.module.css'

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch()
  const mutating = useAppSelector((s) => s.cart.mutating)
  const outOfStock = product.stockQuantity <= 0

  return (
    <article className={styles.card}>
      <Link to={`/catalog/${product.id}`} className={styles.imageLink}>
        <div className={styles.image}>
          <span className={styles.imageEmoji} aria-hidden>💡</span>
        </div>
      </Link>
      <div className={styles.body}>
        <Link to={`/catalog/${product.id}`} className={styles.name}>
          {product.name}
        </Link>
        <div className={styles.meta}>
          {product.baseType ?? '—'}{product.wattage ? ` · ${product.wattage} Вт` : ''}
        </div>
        <div className={styles.price}>{formatPrice(product.price)}</div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => dispatch(addToCart({ productId: product.id }))}
          disabled={outOfStock || mutating}
        >
          {outOfStock ? 'Нет в наличии' : 'В корзину'}
        </Button>
      </div>
    </article>
  )
}
