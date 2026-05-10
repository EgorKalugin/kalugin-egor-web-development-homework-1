export interface Category {
  id: number
  name: string
  description?: string
}

export interface Product {
  id: number
  sku: string
  name: string
  description: string
  categoryId: number
  price: number
  stockQuantity: number
  imageUrl?: string
  wattage?: number
  voltage?: number
  baseType?: string
  colorTemp?: number
  lifespanHours?: number
}

export type Sort = 'price_asc' | 'price_desc' | 'name_asc'
