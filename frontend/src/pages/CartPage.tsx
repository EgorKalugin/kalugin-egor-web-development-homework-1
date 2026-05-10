import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { clearCart } from '@/store/cartSlice'
import { CartLine } from '@/components/cart/CartLine/CartLine'
import { CartSummary } from '@/components/cart/CartSummary/CartSummary'
import { Button } from '@/components/ui/Button'
import styles from './CartPage.module.css'

export default function CartPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const items = useAppSelector((s) => s.cart.items)
  const total = useAppSelector((s) => s.cart.total)
  const status = useAppSelector((s) => s.cart.status)
  const error = useAppSelector((s) => s.cart.error)
  const mutating = useAppSelector((s) => s.cart.mutating)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  if (status === 'loading' && items.length === 0) {
    return (
      <div className={`container ${styles.empty}`}>
        <h1 className={styles.title}>Загружаем корзину…</h1>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={`container ${styles.empty}`}>
        <h1 className={styles.title}>Корзина пуста</h1>
        <p className={styles.subtitle}>
          Добавьте товары из каталога, чтобы оформить заказ.
        </p>
        <Link to="/catalog">
          <Button size="lg">Перейти в каталог</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={`container ${styles.layout}`}>
      <section className={styles.lines}>
        <header className={styles.head}>
          <h1 className={styles.title}>Корзина</h1>
          <button
            type="button"
            className={styles.clear}
            onClick={() => dispatch(clearCart())}
            disabled={mutating}
          >
            Очистить
          </button>
        </header>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.list}>
          {items.map((item) => (
            <CartLine key={item.id} item={item} />
          ))}
        </div>
      </section>

      <CartSummary
        itemCount={itemCount}
        subtotal={total}
        cta={
          <Button size="lg" fullWidth onClick={() => navigate('/checkout')}>
            Оформить заказ
          </Button>
        }
      />
    </div>
  )
}
