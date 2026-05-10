import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid/ProductGrid'
import { Button } from '@/components/ui/Button'
import { useAppDispatch, useAppSelector } from '@/store'
import { loadProducts } from '@/store/productsSlice'
import styles from './HomePage.module.css'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.products.items)
  const status = useAppSelector((s) => s.products.itemsStatus)
  const error = useAppSelector((s) => s.products.itemsError)

  useEffect(() => {
    dispatch(loadProducts({ limit: 100, sort: 'name_asc' }))
  }, [dispatch])

  // Highest stock = popular; newest (highest id) = fresh
  const popular = [...items]
    .sort((a, b) => b.stockQuantity - a.stockQuantity)
    .slice(0, 4)
  const fresh = [...items].sort((a, b) => b.id - a.id).slice(0, 4)

  return (
    <div className={`container ${styles.wrap}`}>
      <section className={styles.banner}>
        <div className={styles.bannerText}>
          <span className={styles.bannerEyebrow}>Завод лампочек · Прямые поставки</span>
          <h1 className={styles.bannerTitle}>
            Лампочки на любой случай — от классики до умного света
          </h1>
          <p className={styles.bannerCopy}>
            LED, галогенные, люминесцентные, накаливания и умные RGB-лампы с
            управлением через приложение.
          </p>
          <div className={styles.bannerCta}>
            <Link to="/catalog">
              <Button size="lg">В каталог</Button>
            </Link>
            <Link to="/catalog?q=led">
              <Button size="lg" variant="secondary">Только LED</Button>
            </Link>
          </div>
        </div>
        <div className={styles.bannerArt} aria-hidden>
          <span>💡</span>
        </div>
      </section>

      <section className={styles.promos}>
        <Promo title="Бесплатная доставка" text="При заказе от 1 000 ₽" icon="🚚" />
        <Promo title="Гарантия качества" text="2 года на всю продукцию" icon="🛡" />
        <Promo title="Быстрая отгрузка" text="В день оформления заказа" icon="📦" />
      </section>

      {status === 'loading' && <p className={styles.statusNote}>Загружаем товары…</p>}
      {status === 'failed' && (
        <p className={styles.statusError}>Ошибка загрузки: {error}</p>
      )}

      {status === 'succeeded' && popular.length > 0 && (
        <section>
          <SectionHead title="Популярные товары" linkTo="/catalog" />
          <ProductGrid products={popular} />
        </section>
      )}

      {status === 'succeeded' && fresh.length > 0 && (
        <section>
          <SectionHead title="Новинки" linkTo="/catalog" />
          <ProductGrid products={fresh} />
        </section>
      )}
    </div>
  )
}

function Promo({
  title,
  text,
  icon,
}: {
  title: string
  text: string
  icon: string
}) {
  return (
    <article className={styles.promo}>
      <span className={styles.promoIcon} aria-hidden>{icon}</span>
      <div>
        <div className={styles.promoTitle}>{title}</div>
        <div className={styles.promoText}>{text}</div>
      </div>
    </article>
  )
}

function SectionHead({ title, linkTo }: { title: string; linkTo: string }) {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <Link to={linkTo} className={styles.sectionLink}>
        Все товары →
      </Link>
    </div>
  )
}
