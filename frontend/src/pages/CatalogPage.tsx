import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { products } from '@/data/products'
import { ProductGrid } from '@/components/product/ProductGrid/ProductGrid'
import {
  ProductFilters,
  wattageMatches,
  type FilterState,
} from '@/components/product/ProductFilters/ProductFilters'
import styles from './CatalogPage.module.css'

const PRICES = products.map((p) => p.price)
const PRICE_BOUNDS = {
  min: Math.min(...PRICES),
  max: Math.max(...PRICES),
}

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  baseTypes: [],
  wattageBuckets: [],
  priceMin: PRICE_BOUNDS.min,
  priceMax: PRICE_BOUNDS.max,
}

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'new'

const SORT_LABELS: Record<SortKey, string> = {
  popular: 'популярные',
  'price-asc': 'цена: по возрастанию',
  'price-desc': 'цена: по убыванию',
  new: 'новинки',
}

export default function CatalogPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortKey>('popular')
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()

  const visible = useMemo(() => {
    const filtered = products.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.categorySlug)) {
        return false
      }
      if (filters.baseTypes.length && !filters.baseTypes.includes(p.baseType)) {
        return false
      }
      if (
        filters.wattageBuckets.length &&
        !filters.wattageBuckets.some((b) => wattageMatches(p.wattage, b))
      ) {
        return false
      }
      if (p.price < filters.priceMin || p.price > filters.priceMax) {
        return false
      }
      if (query && !p.name.toLowerCase().includes(query) && !p.sku.toLowerCase().includes(query)) {
        return false
      }
      return true
    })

    const sorted = [...filtered]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'new':
        sorted.sort((a, b) => Number(b.badge === 'new') - Number(a.badge === 'new'))
        break
      case 'popular':
      default:
        sorted.sort((a, b) => Number(b.badge === 'hit') - Number(a.badge === 'hit'))
    }
    return sorted
  }, [filters, sort, query])

  return (
    <div className={`container ${styles.layout}`}>
      <ProductFilters
        state={filters}
        bounds={PRICE_BOUNDS}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <section className={styles.main}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>
              Лампочки <span className={styles.count}>({visible.length} из {products.length})</span>
            </h1>
            {query && (
              <p className={styles.queryNote}>
                По запросу: <strong>{query}</strong>
              </p>
            )}
          </div>
          <label className={styles.sort}>
            <span>Сортировка:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Сортировка товаров"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </header>

        <ProductGrid products={visible} />
      </section>
    </div>
  )
}
