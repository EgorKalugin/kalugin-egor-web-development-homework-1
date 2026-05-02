import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { findProduct } from '@/data/products'
import { CartLine } from '@/components/cart/CartLine/CartLine'
import { CartSummary } from '@/components/cart/CartSummary/CartSummary'
import { Button } from '@/components/ui/Button'
import styles from './CartPage.module.css'

export default function CartPage() {
  const { items, subtotal, itemCount, clear } = useCart()
  const navigate = useNavigate()

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
          <button type="button" className={styles.clear} onClick={clear}>
            Очистить
          </button>
        </header>
        <div className={styles.list}>
          {items.map((item) => {
            const product = findProduct(item.productId)
            if (!product) return null
            return <CartLine key={item.productId} item={item} product={product} />
          })}
        </div>
      </section>

      <CartSummary
        itemCount={itemCount}
        subtotal={subtotal}
        cta={
          <Button size="lg" fullWidth onClick={() => navigate('/checkout')}>
            Оформить заказ
          </Button>
        }
      />
    </div>
  )
}
