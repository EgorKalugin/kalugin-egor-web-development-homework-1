import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ApiError } from '@/api/client'
import { mapOrder } from '@/api/mappers'
import {
  createOrderRequest,
  fetchOrder as fetchOrderApi,
  updateOrderStatus as updateOrderStatusApi,
} from '@/api/orders'
import type { Order, ShippingInfo } from '@/types/order'

interface OrdersState {
  byId: Record<number, Order>
  lastCreatedOrderId: number | null
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  createError: string | null
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  detailError: string | null
}

const initialState: OrdersState = {
  byId: {},
  lastCreatedOrderId: null,
  createStatus: 'idle',
  createError: null,
  detailStatus: 'idle',
  detailError: null,
}

const errorMessage = (e: unknown, fallback: string): string => {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return fallback
}

export const placeOrder = createAsyncThunk(
  'orders/create',
  async (shipping: ShippingInfo, { rejectWithValue }) => {
    try {
      const dto = await createOrderRequest({
        shipping_name: shipping.name,
        shipping_phone: shipping.phone,
        shipping_email: shipping.email,
        shipping_address: shipping.address,
        comment: shipping.comment,
      })
      return mapOrder(dto)
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Не удалось оформить заказ'))
    }
  },
)

export const loadOrder = createAsyncThunk(
  'orders/load',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      const dto = await fetchOrderApi(id, signal)
      return mapOrder(dto)
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Заказ не найден'))
    }
  },
)

export const advanceOrderStatus = createAsyncThunk(
  'orders/advance',
  async (
    { id, status, note }: { id: number; status: string; note?: string },
    { rejectWithValue },
  ) => {
    try {
      const dto = await updateOrderStatusApi(id, { status, note })
      return mapOrder(dto)
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Не удалось изменить статус'))
    }
  },
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCreateStatus(state) {
      state.createStatus = 'idle'
      state.createError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.createStatus = 'loading'
        state.createError = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.byId[action.payload.id] = action.payload
        state.lastCreatedOrderId = action.payload.id
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = (action.payload as string) ?? 'Ошибка оформления'
      })

      .addCase(loadOrder.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = null
      })
      .addCase(loadOrder.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.byId[action.payload.id] = action.payload
      })
      .addCase(loadOrder.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = (action.payload as string) ?? 'Ошибка загрузки'
      })

      .addCase(advanceOrderStatus.fulfilled, (state, action) => {
        state.byId[action.payload.id] = action.payload
      })
  },
})

export const { resetCreateStatus } = ordersSlice.actions
export default ordersSlice.reducer
