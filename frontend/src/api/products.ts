import { catalogApi } from './client'
import type {
  CategoryDto,
  ProductDetailDto,
  ProductListResponseDto,
} from './types'

export interface ListProductsParams {
  categoryId?: number
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'name_asc'
  page?: number
  limit?: number
}

export const fetchCategories = (signal?: AbortSignal): Promise<CategoryDto[]> =>
  catalogApi.get<CategoryDto[]>('/api/v1/categories', undefined, signal)

export const fetchProducts = (
  params: ListProductsParams = {},
  signal?: AbortSignal,
): Promise<ProductListResponseDto> =>
  catalogApi.get<ProductListResponseDto>(
    '/api/v1/products',
    {
      category_id: params.categoryId,
      search: params.search,
      sort: params.sort,
      page: params.page,
      limit: params.limit,
    },
    signal,
  )

export const fetchProductById = (
  id: number,
  signal?: AbortSignal,
): Promise<ProductDetailDto> =>
  catalogApi.get<ProductDetailDto>(`/api/v1/products/${id}`, undefined, signal)
