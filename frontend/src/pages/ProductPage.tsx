import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/store'
import { addToCart } from '@/store/cartSlice'
import { loadProductById } from '@/store/productsSlice'
import { formatPrice } from '@/utils/format'
import styles from './ProductPage.module.css'

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const id = Number(productId)
  const dispatch = useAppDispatch()
  const product = useAppSelector((s) =>
    Number.isFinite(id) ? s.products.byId[id] : undefined,
  )
  const status = useAppSelector((s) => s.products.detailStatus)
  const error = useAppSelector((s) => s.products.detailError)
  const categories = useAppSelector((s) => s.products.categories)
  const cartMutating = useAppSelector((s) => s.cart.mutating)
  const cartError = useAppSelector((s) => s.cart.error)
  const cartMessage = useAppSelector((s) => s.cart.lastMessage)

  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (Number.isFinite(id)) {
      dispatch(loadProductById(id))
    }
  }, [dispatch, id])

  if (status === 'loading' && !product) {
    return <div className={`container ${styles.notFound}`}>Загружаем товар…</div>
  }

  if (!product) {
    return (
      <div className={`container ${styles.notFound}`}>
        <h1>Товар не найден</h1>
        <p>{error ?? 'Возможно, его сняли с продажи. Загляните в каталог.'}</p>
        <Link to="/catalog" className={styles.backLink}>← В каталог</Link>
      </div>
    )
  }

  const outOfStock = product.stockQuantity <= 0
  const categoryName =
    categories.find((c) => c.id === product.categoryId)?.name ?? '—'

  return (
    <div className={`container ${styles.wrap}`}>
      <nav className={styles.breadcrumbs} aria-label="Навигация">
        <Link to="/">Главная</Link> /{' '}
        <Link to="/catalog">Каталог</Link> /{' '}
        <span>{product.name}</span>
      </nav>

      <div className={styles.grid}>
        <div className={styles.gallery}>
          <div className={styles.image}>
            <span className={styles.imageEmoji} aria-hidden>💡</span>
          </div>
        </div>

        <div className={styles.info}>
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.sku}>Артикул: {product.sku}</div>
          <p className={styles.description}>{product.description}</p>

          <dl className={styles.specs}>
            <dt>Категория</dt><dd>{categoryName}</dd>
            {product.baseType && (<><dt>Цоколь</dt><dd>{product.baseType}</dd></>)}
            {product.wattage !== undefined && (<><dt>Мощность</dt><dd>{product.wattage} Вт</dd></>)}
            {product.voltage !== undefined && (<><dt>Напряжение</dt><dd>{product.voltage} В</dd></>)}
            {product.colorTemp !== undefined && (<><dt>Цветовая температура</dt><dd>{product.colorTemp} K</dd></>)}
            {product.lifespanHours !== undefined && (<><dt>Срок службы</dt><dd>{product.lifespanHours.toLocaleString('ru-RU')} ч</dd></>)}
            <dt>В наличии</dt>
            <dd>{outOfStock ? 'Нет' : `${product.stockQuantity} шт.`}</dd>
          </dl>

          <div className={styles.purchase}>
            <div className={styles.price}>{formatPrice(product.price)}</div>
            <div className={styles.qty}>
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Уменьшить количество"
              >−</button>
              <span aria-live="polite">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stockQuantity || 99, q + 1))}
                aria-label="Увеличить количество"
                disabled={qty >= (product.stockQuantity || 99)}
              >+</button>
            </div>
            <Button
              size="lg"
              onClick={() => dispatch(addToCart({ productId: product.id, quantity: qty }))}
              disabled={outOfStock || cartMutating}
            >
              {outOfStock
                ? 'Нет в наличии'
                : cartMutating
                  ? 'Добавляем…'
                  : 'Добавить в корзину'}
            </Button>
          </div>

          {cartError && <p className={styles.error}>{cartError}</p>}
          {cartMessage && !cartError && (
            <p className={styles.success}>{cartMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
