import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import { findProduct } from '@/data/products'
import { categoryNameBySlug } from '@/data/categories'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/utils/format'
import styles from './ProductPage.module.css'

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>()
  const id = Number(productId)
  const product = Number.isFinite(id) ? findProduct(id) : undefined
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)

  if (!product) {
    return (
      <div className={`container ${styles.notFound}`}>
        <h1>Товар не найден</h1>
        <p>Возможно, его сняли с продажи. Загляните в каталог.</p>
        <Link to="/catalog" className={styles.backLink}>← В каталог</Link>
      </div>
    )
  }

  const outOfStock = product.stockQuantity <= 0

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
            {product.badge && (
              <span className={styles.badge}>
                <Badge kind={product.badge} />
              </span>
            )}
          </div>
        </div>

        <div className={styles.info}>
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.sku}>Артикул: {product.sku}</div>
          <p className={styles.description}>{product.description}</p>

          <dl className={styles.specs}>
            <dt>Категория</dt><dd>{categoryNameBySlug(product.categorySlug)}</dd>
            <dt>Цоколь</dt><dd>{product.baseType}</dd>
            <dt>Мощность</dt><dd>{product.wattage} Вт</dd>
            <dt>Напряжение</dt><dd>{product.voltage} В</dd>
            {product.colorTemp && (<><dt>Цветовая температура</dt><dd>{product.colorTemp} K</dd></>)}
            {product.lifespanHours && (<><dt>Срок службы</dt><dd>{product.lifespanHours.toLocaleString('ru-RU')} ч</dd></>)}
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
              onClick={() => addItem(product.id, qty)}
              disabled={outOfStock}
            >
              {outOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
