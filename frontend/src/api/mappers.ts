import type { Cart, CartItem, Order, OrderItem, OrderStatus, OrderStatusEvent } from '@/types/order'
import type { Category, Product } from '@/types/product'
import type {
  CartItemDto,
  CartResponseDto,
  CategoryDto,
  OrderDto,
  OrderItemDto,
  ProductDetailDto,
  ProductListItemDto,
  StatusHistoryDto,
} from './types'

const num = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return v
  const parsed = Number(v)
  return Number.isFinite(parsed) ? parsed : 0
}

const optNum = (v: string | number | null | undefined): number | undefined => {
  if (v === null || v === undefined) return undefined
  if (typeof v === 'number') return v
  const parsed = Number(v)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const mapCategory = (c: CategoryDto): Category => ({
  id: c.id,
  name: c.name,
  description: c.description ?? undefined,
})

export const mapProduct = (p: ProductListItemDto | ProductDetailDto): Product => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  description: p.description ?? '',
  categoryId: p.category_id,
  price: num(p.price),
  stockQuantity: p.stock_quantity,
  imageUrl: p.image_url ?? undefined,
  wattage: optNum(p.wattage),
  voltage: p.voltage ?? undefined,
  baseType: p.base_type ?? undefined,
  colorTemp: p.color_temp ?? undefined,
  lifespanHours: p.lifespan_hours ?? undefined,
})

export const mapCartItem = (i: CartItemDto): CartItem => ({
  id: i.id,
  productId: i.product_id,
  productName: i.product_name,
  price: num(i.price),
  quantity: i.quantity,
  subtotal: num(i.subtotal),
})

export const mapCart = (c: CartResponseDto): Cart => ({
  id: c.id,
  items: c.items.map(mapCartItem),
  total: num(c.total),
})

export const mapOrderItem = (i: OrderItemDto): OrderItem => ({
  productName: i.product_name,
  productSku: i.product_sku,
  quantity: i.quantity,
  pricePerUnit: num(i.price_per_unit),
  totalPrice: num(i.total_price),
})

export const mapStatusHistory = (h: StatusHistoryDto): OrderStatusEvent => ({
  status: h.status as OrderStatus,
  changedAt: h.changed_at,
  note: h.note ?? undefined,
})

export const mapOrder = (o: OrderDto): Order => ({
  id: o.id,
  status: o.status as OrderStatus,
  totalAmount: num(o.total_amount),
  items: o.items.map(mapOrderItem),
  shipping: {
    name: o.shipping_name,
    phone: o.shipping_phone,
    email: o.shipping_email,
    address: o.shipping_address,
    comment: o.comment ?? undefined,
  },
  comment: o.comment ?? undefined,
  createdAt: o.created_at,
  statusHistory: o.status_history.map(mapStatusHistory),
})
