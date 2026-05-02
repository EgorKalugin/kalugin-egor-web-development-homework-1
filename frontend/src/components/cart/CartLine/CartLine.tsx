import { Link } from 'react-router-dom'
import type { CartItem } from '@/types/order'
import type { Product } from '@/types/product'
import { formatPrice } from '@/utils/format'
import { useCart } from '@/context/CartContext'
import styles from './CartLine.module.css'

interface Props {
  item: CartItem
  product: Product
}

export function CartLine({ item, product }: Props) {
  const { setQuantity, removeItem } = useCart()

  return (
    <div className={styles.line}>
      <Link to={`/catalog/${product.id}`} className={styles.thumb} aria-hidden>
        💡
      </Link>
      <div className={styles.body}>
        <Link to={`/catalog/${product.id}`} className={styles.name}>
          {product.name}
        </Link>
        <div className={styles.meta}>
          {product.baseType} · {product.wattage} Вт · артикул {product.sku}
        </div>
      </div>
      <div className={styles.qty}>
        <button
          type="button"
          onClick={() => setQuantity(product.id, item.quantity - 1)}
          aria-label="Уменьшить"
        >−</button>
        <span>{item.quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity(product.id, item.quantity + 1)}
          aria-label="Увеличить"
        >+</button>
      </div>
      <div className={styles.total}>
        {formatPrice(product.price * item.quantity)}
      </div>
      <button
        type="button"
        className={styles.remove}
        onClick={() => removeItem(product.id)}
        aria-label="Удалить из корзины"
      >×</button>
    </div>
  )
}
