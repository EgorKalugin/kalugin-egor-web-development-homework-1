// Types mirror the JSON shapes returned by catalog_service and order_service.

export interface CategoryDto {
  id: number
  name: string
  description?: string | null
}

export interface ProductImageDto {
  id: number
  url: string
  sort_order: number
}

export interface ProductListItemDto {
  id: number
  sku: string
  name: string
  description?: string | null
  category_id: number
  price: string | number
  stock_quantity: number
  image_url?: string | null
  wattage?: string | number | null
  voltage?: number | null
  base_type?: string | null
  color_temp?: number | null
  lifespan_hours?: number | null
}

export interface ProductDetailDto extends ProductListItemDto {
  category: CategoryDto
  images: ProductImageDto[]
}

export interface PaginationDto {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ProductListResponseDto {
  data: ProductListItemDto[]
  pagination: PaginationDto
}

export interface CartItemDto {
  id: number
  product_id: number
  product_name: string
  price: string | number
  quantity: number
  subtotal: string | number
}

export interface CartResponseDto {
  id: number | null
  items: CartItemDto[]
  total: string | number
}

export interface AddCartItemRequest {
  product_id: number
  quantity?: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface OrderItemDto {
  product_name: string
  product_sku: string
  quantity: number
  price_per_unit: string | number
  total_price: string | number
}

export interface StatusHistoryDto {
  status: string
  note?: string | null
  changed_at: string
}

export interface OrderDto {
  id: number
  status: string
  total_amount: string | number
  shipping_name: string
  shipping_phone: string
  shipping_email: string
  shipping_address: string
  comment?: string | null
  items: OrderItemDto[]
  status_history: StatusHistoryDto[]
  created_at: string
}

export interface CheckoutRequest {
  shipping_name: string
  shipping_phone: string
  shipping_email: string
  shipping_address: string
  comment?: string
}

export interface UpdateOrderStatusRequest {
  status: string
  note?: string
}

export interface ApiErrorBody {
  error?: string
  available?: number
  unavailable?: number[]
  [key: string]: unknown
}
