import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { CartItem } from '@/types/order'
import { findProduct } from '@/data/products'

const STORAGE_KEY = 'lampochki.cart.v1'

type CartState = CartItem[]

type CartAction =
  | { type: 'ADD'; productId: number; quantity?: number }
  | { type: 'REMOVE'; productId: number }
  | { type: 'SET_QTY'; productId: number; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartState }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD': {
      const qty = action.quantity ?? 1
      const existing = state.find((i) => i.productId === action.productId)
      if (existing) {
        return state.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: i.quantity + qty }
            : i,
        )
      }
      return [...state, { productId: action.productId, quantity: qty }]
    }
    case 'REMOVE':
      return state.filter((i) => i.productId !== action.productId)
    case 'SET_QTY':
      if (action.quantity <= 0) {
        return state.filter((i) => i.productId !== action.productId)
      }
      return state.map((i) =>
        i.productId === action.productId
          ? { ...i, quantity: action.quantity }
          : i,
      )
    case 'CLEAR':
      return []
    case 'HYDRATE':
      return action.items
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (productId: number, quantity?: number) => void
  removeItem: (productId: number) => void
  setQuantity: (productId: number, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const loadInitial = (): CartState => {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is CartItem =>
        typeof i?.productId === 'number' && typeof i?.quantity === 'number',
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, [], loadInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore quota errors
    }
  }, [items])

  const addItem = useCallback((productId: number, quantity?: number) => {
    dispatch({ type: 'ADD', productId, quantity })
  }, [])
  const removeItem = useCallback((productId: number) => {
    dispatch({ type: 'REMOVE', productId })
  }, [])
  const setQuantity = useCallback((productId: number, quantity: number) => {
    dispatch({ type: 'SET_QTY', productId, quantity })
  }, [])
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )
  const subtotal = useMemo(
    () =>
      items.reduce((sum, i) => {
        const product = findProduct(i.productId)
        return product ? sum + product.price * i.quantity : sum
      }, 0),
    [items],
  )

  const value = useMemo<CartContextValue>(
    () => ({ items, itemCount, subtotal, addItem, removeItem, setQuantity, clear }),
    [items, itemCount, subtotal, addItem, removeItem, setQuantity, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
