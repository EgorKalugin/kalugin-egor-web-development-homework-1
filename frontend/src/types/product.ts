export type BaseType = 'E14' | 'E27' | 'GU10' | 'GU5.3'

export type CategorySlug =
  | 'led'
  | 'halogen'
  | 'fluorescent'
  | 'incandescent'
  | 'smart'

export type ProductBadge = 'hit' | 'new' | 'sale'

export interface Category {
  slug: CategorySlug
  name: string
  description?: string
}

export interface Product {
  id: number
  sku: string
  name: string
  description: string
  categorySlug: CategorySlug
  price: number
  stockQuantity: number
  imageUrl?: string
  wattage: number
  voltage: number
  baseType: BaseType
  colorTemp?: number
  lifespanHours?: number
  badge?: ProductBadge
}
