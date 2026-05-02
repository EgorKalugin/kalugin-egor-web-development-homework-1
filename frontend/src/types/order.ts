export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface CartItem {
  productId: number
  quantity: number
}

export interface OrderItem {
  productId: number
  productName: string
  productSku: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
}

export interface ShippingInfo {
  name: string
  phone: string
  email: string
  address: string
  comment?: string
}

export interface OrderStatusEvent {
  status: OrderStatus
  changedAt: string
  note?: string
}

export interface Order {
  id: number
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  shipping: ShippingInfo
  createdAt: string
  statusHistory: OrderStatusEvent[]
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Принят',
  confirmed: 'Подтверждён',
  processing: 'Собирается',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'new',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
]
