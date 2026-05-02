import type { Product } from '@/types/product'
import { ProductCard } from '../ProductCard/ProductCard'
import styles from './ProductGrid.module.css'

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        Ничего не найдено. Попробуйте сбросить фильтры или изменить запрос.
      </div>
    )
  }
  return (
    <div className={styles.grid}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
