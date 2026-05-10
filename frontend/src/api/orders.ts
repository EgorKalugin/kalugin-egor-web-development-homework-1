import { ordersApi } from './client'
import type {
  CheckoutRequest,
  OrderDto,
  UpdateOrderStatusRequest,
} from './types'

export const createOrderRequest = (data: CheckoutRequest): Promise<OrderDto> =>
  ordersApi.post<OrderDto>('/api/v1/orders', data)

export const fetchOrder = (id: number, signal?: AbortSignal): Promise<OrderDto> =>
  ordersApi.get<OrderDto>(`/api/v1/orders/${id}`, undefined, signal)

export const updateOrderStatus = (
  id: number,
  data: UpdateOrderStatusRequest,
): Promise<OrderDto> =>
  ordersApi.patch<OrderDto>(`/api/v1/orders/${id}/status`, data)
