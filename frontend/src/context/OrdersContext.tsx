import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  ShippingInfo,
} from '@/types/order'
import { ORDER_STATUS_FLOW } from '@/types/order'
import { findProduct } from '@/data/products'

interface OrdersContextValue {
  orders: Order[]
  createOrder: (cart: CartItem[], shipping: ShippingInfo) => Order
  getOrder: (id: number) => Order | undefined
  advanceStatus: (id: number) => Order | undefined
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

const generateOrderId = (): number =>
  1000 + Math.floor(Math.random() * 90_000)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  const createOrder = useCallback(
    (cart: CartItem[], shipping: ShippingInfo): Order => {
      const items: OrderItem[] = cart
        .map((entry) => {
          const product = findProduct(entry.productId)
          if (!product) return null
          return {
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            quantity: entry.quantity,
            pricePerUnit: product.price,
            totalPrice: product.price * entry.quantity,
          }
        })
        .filter((i): i is OrderItem => i !== null)

      const totalAmount = items.reduce((sum, i) => sum + i.totalPrice, 0)
      const now = new Date().toISOString()
      const order: Order = {
        id: generateOrderId(),
        status: 'new',
        totalAmount,
        items,
        shipping,
        createdAt: now,
        statusHistory: [{ status: 'new', changedAt: now }],
      }
      setOrders((prev) => [...prev, order])
      return order
    },
    [],
  )

  const getOrder = useCallback(
    (id: number) => orders.find((o) => o.id === id),
    [orders],
  )

  const advanceStatus = useCallback((id: number): Order | undefined => {
    let updated: Order | undefined
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const idx = ORDER_STATUS_FLOW.indexOf(o.status)
        if (idx < 0 || idx >= ORDER_STATUS_FLOW.length - 1) {
          updated = o
          return o
        }
        const next: OrderStatus = ORDER_STATUS_FLOW[idx + 1]
        const event = { status: next, changedAt: new Date().toISOString() }
        updated = {
          ...o,
          status: next,
          statusHistory: [...o.statusHistory, event],
        }
        return updated
      }),
    )
    return updated
  }, [])

  const value = useMemo<OrdersContextValue>(
    () => ({ orders, createOrder, getOrder, advanceStatus }),
    [orders, createOrder, getOrder, advanceStatus],
  )

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  )
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider')
  return ctx
}
