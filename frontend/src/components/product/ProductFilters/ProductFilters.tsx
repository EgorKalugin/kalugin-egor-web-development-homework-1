import type { Category } from '@/types/product'
import { Button } from '@/components/ui/Button'
import styles from './ProductFilters.module.css'

export interface FilterState {
  categoryIds: number[]
  baseTypes: string[]
  wattageBuckets: WattageBucket[]
  priceMin: number
  priceMax: number
}

export type WattageBucket = 'le10' | '10to20' | '20to40' | 'gt40'

export const WATTAGE_OPTIONS: { value: WattageBucket; label: string }[] = [
  { value: 'le10', label: 'До 10 Вт' },
  { value: '10to20', label: '10–20 Вт' },
  { value: '20to40', label: '20–40 Вт' },
  { value: 'gt40', label: '40+ Вт' },
]

const BASE_TYPES = ['E14', 'E27', 'GU10', 'GU5.3']

export function wattageMatches(w: number, bucket: WattageBucket): boolean {
  switch (bucket) {
    case 'le10':
      return w <= 10
    case '10to20':
      return w > 10 && w <= 20
    case '20to40':
      return w > 20 && w <= 40
    case 'gt40':
      return w > 40
  }
}

interface Props {
  state: FilterState
  bounds: { min: number; max: number }
  categories: Category[]
  onChange: (next: FilterState) => void
  onReset: () => void
}

export function ProductFilters({ state, bounds, categories, onChange, onReset }: Props) {
  const toggle = <T,>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]

  return (
    <aside className={styles.filters} aria-label="Фильтры товаров">
      <div className={styles.head}>
        <h2 className={styles.title}>Фильтры</h2>
        <button className={styles.reset} onClick={onReset} type="button">
          Сбросить
        </button>
      </div>

      <FilterGroup title="Тип лампы">
        {categories.map((c) => (
          <Checkbox
            key={c.id}
            label={c.name}
            checked={state.categoryIds.includes(c.id)}
            onChange={() =>
              onChange({
                ...state,
                categoryIds: toggle(state.categoryIds, c.id),
              })
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Мощность (Вт)">
        {WATTAGE_OPTIONS.map((w) => (
          <Checkbox
            key={w.value}
            label={w.label}
            checked={state.wattageBuckets.includes(w.value)}
            onChange={() =>
              onChange({
                ...state,
                wattageBuckets: toggle(state.wattageBuckets, w.value),
              })
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Цоколь">
        {BASE_TYPES.map((b) => (
          <Checkbox
            key={b}
            label={b}
            checked={state.baseTypes.includes(b)}
            onChange={() =>
              onChange({ ...state, baseTypes: toggle(state.baseTypes, b) })
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Цена (₽)">
        <div className={styles.priceRow}>
          <input
            type="number"
            inputMode="numeric"
            min={bounds.min}
            max={state.priceMax}
            value={state.priceMin}
            onChange={(e) =>
              onChange({
                ...state,
                priceMin: Math.max(bounds.min, Number(e.target.value) || 0),
              })
            }
            className={styles.priceInput}
            aria-label="Цена от"
          />
          <span className={styles.priceDash}>—</span>
          <input
            type="number"
            inputMode="numeric"
            min={state.priceMin}
            max={bounds.max}
            value={state.priceMax}
            onChange={(e) =>
              onChange({
                ...state,
                priceMax: Math.min(bounds.max, Number(e.target.value) || 0),
              })
            }
            className={styles.priceInput}
            aria-label="Цена до"
          />
        </div>
        <div className={styles.priceHint}>
          от {bounds.min} ₽ до {bounds.max} ₽
        </div>
      </FilterGroup>

      <Button variant="secondary" size="sm" fullWidth onClick={onReset} type="button">
        Сбросить все
      </Button>
    </aside>
  )
}

function FilterGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.group}>
      <div className={styles.groupTitle}>{title}</div>
      <div className={styles.groupBody}>{children}</div>
    </div>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className={styles.row}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={styles.checkbox}
      />
      <span>{label}</span>
    </label>
  )
}
