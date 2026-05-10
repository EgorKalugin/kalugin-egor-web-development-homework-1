import { Link } from 'react-router-dom'
import type { CartItem } from '@/types/order'
import { useAppDispatch, useAppSelector } from '@/store'
import { removeFromCart, updateCartItemQty } from '@/store/cartSlice'
import { formatPrice } from '@/utils/format'
import styles from './CartLine.module.css'

interface Props {
  item: CartItem
}

export function CartLine({ item }: Props) {
  const dispatch = useAppDispatch()
  const mutating = useAppSelector((s) => s.cart.mutating)

  return (
    <div className={styles.line}>
      <Link to={`/catalog/${item.productId}`} className={styles.thumb} aria-hidden>
        💡
      </Link>
      <div className={styles.body}>
        <Link to={`/catalog/${item.productId}`} className={styles.name}>
          {item.productName}
        </Link>
        <div className={styles.meta}>{formatPrice(item.price)} за шт.</div>
      </div>
      <div className={styles.qty}>
        <button
          type="button"
          onClick={() =>
            dispatch(updateCartItemQty({ itemId: item.id, quantity: item.quantity - 1 }))
          }
          aria-label="Уменьшить"
          disabled={mutating}
        >−</button>
        <span>{item.quantity}</span>
        <button
          type="button"
          onClick={() =>
            dispatch(updateCartItemQty({ itemId: item.id, quantity: item.quantity + 1 }))
          }
          aria-label="Увеличить"
          disabled={mutating}
        >+</button>
      </div>
      <div className={styles.total}>{formatPrice(item.subtotal)}</div>
      <button
        type="button"
        className={styles.remove}
        onClick={() => dispatch(removeFromCart(item.id))}
        aria-label="Удалить из корзины"
        disabled={mutating}
      >×</button>
    </div>
  )
}
