import { Link } from 'react-router-dom'
import { products } from '@/data/products'
import { ProductGrid } from '@/components/product/ProductGrid/ProductGrid'
import { Button } from '@/components/ui/Button'
import styles from './HomePage.module.css'

export default function HomePage() {
  const popular = products.filter((p) => p.badge === 'hit').slice(0, 4)
  const fresh = products.filter((p) => p.badge === 'new').slice(0, 4)

  return (
    <div className={`container ${styles.wrap}`}>
      <section className={styles.banner}>
        <div className={styles.bannerText}>
          <span className={styles.bannerEyebrow}>Завод лампочек · Прямые поставки</span>
          <h1 className={styles.bannerTitle}>
            Лампочки на любой случай — от классики до умного света
          </h1>
          <p className={styles.bannerCopy}>
            20 моделей в наличии: LED, галогенные, люминесцентные, накаливания и
            умные RGB-лампы с управлением через приложение.
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
        <Promo title="20 SKU в наличии" text="Отгрузка в день заказа" icon="📦" />
      </section>

      <section>
        <SectionHead title="Популярные товары" linkTo="/catalog" />
        <ProductGrid products={popular} />
      </section>

      {fresh.length > 0 && (
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
