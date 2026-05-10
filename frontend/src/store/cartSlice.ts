import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ApiError } from '@/api/client'
import {
  addCartItem as addCartItemApi,
  clearCartRequest,
  fetchCart as fetchCartApi,
  removeCartItem as removeCartItemApi,
  updateCartItem as updateCartItemApi,
} from '@/api/cart'
import { mapCart } from '@/api/mappers'
import type { Cart } from '@/types/order'

interface CartState extends Cart {
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  mutating: boolean
  error: string | null
  lastMessage: string | null
}

const initialState: CartState = {
  id: null,
  items: [],
  total: 0,
  status: 'idle',
  mutating: false,
  error: null,
  lastMessage: null,
}

const errorMessage = (e: unknown, fallback: string): string => {
  if (e instanceof ApiError) {
    if (typeof e.body === 'object' && e.body && 'available' in e.body) {
      return `${e.message}. Доступно: ${(e.body as { available?: number }).available ?? 0}`
    }
    return e.message
  }
  if (e instanceof Error) return e.message
  return fallback
}

export const loadCart = createAsyncThunk(
  'cart/load',
  async (_: void, { rejectWithValue, signal }) => {
    try {
      const dto = await fetchCartApi(signal)
      return mapCart(dto)
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Не удалось загрузить корзину'))
    }
  },
)

export const addToCart = createAsyncThunk(
  'cart/add',
  async (
    { productId, quantity = 1 }: { productId: number; quantity?: number },
    { rejectWithValue },
  ) => {
    try {
      await addCartItemApi({ product_id: productId, quantity })
      const dto = await fetchCartApi()
      return mapCart(dto)
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Не удалось добавить товар'))
    }
  },
)

export const updateCartItemQty = createAsyncThunk(
  'cart/update',
  async (
    { itemId, quantity }: { itemId: number; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      if (quantity <= 0) {
        await removeCartItemApi(itemId)
      } else {
        await updateCartItemApi(itemId, { quantity })
      }
      const dto = await fetchCartApi()
      return mapCart(dto)
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Не удалось обновить количество'))
    }
  },
)

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (itemId: number, { rejectWithValue }) => {
    try {
      await removeCartItemApi(itemId)
      const dto = await fetchCartApi()
      return mapCart(dto)
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Не удалось удалить товар'))
    }
  },
)

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_: void, { rejectWithValue }) => {
    try {
      await clearCartRequest()
      return { id: null, items: [], total: 0 } as Cart
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Не удалось очистить корзину'))
    }
  },
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearLocal(state) {
      state.items = []
      state.total = 0
      state.id = null
      state.error = null
      state.lastMessage = null
    },
    dismissError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const applyCart = (state: CartState, cart: Cart) => {
      state.id = cart.id
      state.items = cart.items
      state.total = cart.total
    }

    builder
      .addCase(loadCart.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.status = 'succeeded'
        applyCart(state, action.payload)
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.status = 'failed'
        state.error = (action.payload as string) ?? 'Ошибка корзины'
      })

      .addCase(addToCart.pending, (state) => {
        state.mutating = true
        state.error = null
        state.lastMessage = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.mutating = false
        state.lastMessage = 'Товар добавлен в корзину'
        applyCart(state, action.payload)
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.mutating = false
        state.error = (action.payload as string) ?? 'Ошибка добавления'
      })

      .addCase(updateCartItemQty.pending, (state) => {
        state.mutating = true
        state.error = null
      })
      .addCase(updateCartItemQty.fulfilled, (state, action) => {
        state.mutating = false
        applyCart(state, action.payload)
      })
      .addCase(updateCartItemQty.rejected, (state, action) => {
        state.mutating = false
        state.error = (action.payload as string) ?? 'Ошибка'
      })

      .addCase(removeFromCart.pending, (state) => {
        state.mutating = true
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.mutating = false
        applyCart(state, action.payload)
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.mutating = false
        state.error = (action.payload as string) ?? 'Ошибка'
      })

      .addCase(clearCart.pending, (state) => {
        state.mutating = true
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.mutating = false
        applyCart(state, action.payload)
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.mutating = false
        state.error = (action.payload as string) ?? 'Ошибка'
      })
  },
})

export const { clearLocal, dismissError } = cartSlice.actions
export default cartSlice.reducer
