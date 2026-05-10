import { ordersApi } from './client'
import type {
  AddCartItemRequest,
  CartResponseDto,
  UpdateCartItemRequest,
} from './types'

export const fetchCart = (signal?: AbortSignal): Promise<CartResponseDto> =>
  ordersApi.get<CartResponseDto>('/api/v1/cart', undefined, signal)

export const addCartItem = (data: AddCartItemRequest) =>
  ordersApi.post<{ cart_item_id: number; product_id: number; quantity: number }>(
    '/api/v1/cart/items',
    data,
  )

export const updateCartItem = (itemId: number, data: UpdateCartItemRequest) =>
  ordersApi.patch<{ cart_item_id: number; product_id: number; quantity: number }>(
    `/api/v1/cart/items/${itemId}`,
    data,
  )

export const removeCartItem = (itemId: number) =>
  ordersApi.delete<null>(`/api/v1/cart/items/${itemId}`)

export const clearCartRequest = () => ordersApi.delete<null>('/api/v1/cart')
