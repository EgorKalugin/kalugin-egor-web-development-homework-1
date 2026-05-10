import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { loadProducts } from '@/store/productsSlice'
import { ProductGrid } from '@/components/product/ProductGrid/ProductGrid'
import {
  ProductFilters,
  wattageMatches,
  type FilterState,
} from '@/components/product/ProductFilters/ProductFilters'
import type { Sort } from '@/types/product'
import styles from './CatalogPage.module.css'

const SORT_LABELS: Record<Sort, string> = {
  name_asc: 'по названию',
  price_asc: 'цена: по возрастанию',
  price_desc: 'цена: по убыванию',
}

const emptyFilters = (min: number, max: number): FilterState => ({
  categoryIds: [],
  baseTypes: [],
  wattageBuckets: [],
  priceMin: min,
  priceMax: max,
})

export default function CatalogPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.products.items)
  const status = useAppSelector((s) => s.products.itemsStatus)
  const error = useAppSelector((s) => s.products.itemsError)
  const categories = useAppSelector((s) => s.products.categories)

  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()

  const [sort, setSort] = useState<Sort>('name_asc')

  useEffect(() => {
    dispatch(
      loadProducts({
        limit: 100,
        search: query || undefined,
        sort,
      }),
    )
  }, [dispatch, query, sort])

  const priceBounds = useMemo(() => {
    if (items.length === 0) return { min: 0, max: 1000 }
    const prices = items.map((p) => p.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [items])

  const [filters, setFilters] = useState<FilterState>(() => emptyFilters(0, 1000))

  // Reset bounds when items change and current bounds are out of range.
  useEffect(() => {
    setFilters((prev) => {
      const min = prev.priceMin <= priceBounds.min ? priceBounds.min : prev.priceMin
      const max = prev.priceMax >= priceBounds.max ? priceBounds.max : prev.priceMax
      if (min !== prev.priceMin || max !== prev.priceMax) {
        return { ...prev, priceMin: min, priceMax: max }
      }
      return prev
    })
  }, [priceBounds.min, priceBounds.max])

  const visible = useMemo(() => {
    return items.filter((p) => {
      if (filters.categoryIds.length && !filters.categoryIds.includes(p.categoryId)) {
        return false
      }
      if (filters.baseTypes.length && (!p.baseType || !filters.baseTypes.includes(p.baseType))) {
        return false
      }
      if (
        filters.wattageBuckets.length &&
        (p.wattage === undefined ||
          !filters.wattageBuckets.some((b) => wattageMatches(p.wattage!, b)))
      ) {
        return false
      }
      if (p.price < filters.priceMin || p.price > filters.priceMax) {
        return false
      }
      return true
    })
  }, [items, filters])

  return (
    <div className={`container ${styles.layout}`}>
      <ProductFilters
        state={filters}
        bounds={priceBounds}
        categories={categories}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters(priceBounds.min, priceBounds.max))}
      />

      <section className={styles.main}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>
              Лампочки{' '}
              <span className={styles.count}>
                ({visible.length} из {items.length})
              </span>
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
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Сортировка товаров"
            >
              {(Object.keys(SORT_LABELS) as Sort[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
        </header>

        {status === 'loading' && <p className={styles.note}>Загружаем товары…</p>}
        {status === 'failed' && (
          <p className={styles.error}>Не удалось загрузить товары: {error}</p>
        )}
        {status !== 'loading' && status !== 'failed' && (
          <ProductGrid products={visible} />
        )}
      </section>
    </div>
  )
}
