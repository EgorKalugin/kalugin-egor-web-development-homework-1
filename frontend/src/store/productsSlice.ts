import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ApiError } from '@/api/client'
import { mapCategory, mapProduct } from '@/api/mappers'
import {
  fetchCategories as fetchCategoriesApi,
  fetchProductById as fetchProductByIdApi,
  fetchProducts as fetchProductsApi,
  type ListProductsParams,
} from '@/api/products'
import type { Category, Product, Sort } from '@/types/product'

interface ProductsState {
  items: Product[]
  itemsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  itemsError: string | null
  total: number

  byId: Record<number, Product>
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  detailError: string | null
  detailId: number | null

  categories: Category[]
  categoriesStatus: 'idle' | 'loading' | 'succeeded' | 'failed'

  search: string
  sort: Sort
}

const initialState: ProductsState = {
  items: [],
  itemsStatus: 'idle',
  itemsError: null,
  total: 0,

  byId: {},
  detailStatus: 'idle',
  detailError: null,
  detailId: null,

  categories: [],
  categoriesStatus: 'idle',

  search: '',
  sort: 'name_asc',
}

const errorMessage = (e: unknown, fallback: string): string => {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return fallback
}

export const loadProducts = createAsyncThunk(
  'products/load',
  async (params: ListProductsParams | undefined, { rejectWithValue, signal }) => {
    try {
      const resp = await fetchProductsApi(
        { limit: 100, ...params },
        signal,
      )
      return {
        items: resp.data.map(mapProduct),
        total: resp.pagination.total,
      }
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Не удалось загрузить товары'))
    }
  },
)

export const loadProductById = createAsyncThunk(
  'products/loadOne',
  async (id: number, { rejectWithValue, signal }) => {
    try {
      const dto = await fetchProductByIdApi(id, signal)
      return mapProduct(dto)
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Товар не найден'))
    }
  },
)

export const loadCategories = createAsyncThunk(
  'products/loadCategories',
  async (_: void, { rejectWithValue, signal }) => {
    try {
      const dtos = await fetchCategoriesApi(signal)
      return dtos.map(mapCategory)
    } catch (e) {
      return rejectWithValue(errorMessage(e, 'Не удалось загрузить категории'))
    }
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    setSort(state, action: PayloadAction<Sort>) {
      state.sort = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.itemsStatus = 'loading'
        state.itemsError = null
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.itemsStatus = 'succeeded'
        state.items = action.payload.items
        state.total = action.payload.total
        for (const p of action.payload.items) {
          state.byId[p.id] = p
        }
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.itemsStatus = 'failed'
        state.itemsError = (action.payload as string) ?? 'Ошибка загрузки'
      })

      .addCase(loadProductById.pending, (state, action) => {
        state.detailStatus = 'loading'
        state.detailError = null
        state.detailId = action.meta.arg
      })
      .addCase(loadProductById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.byId[action.payload.id] = action.payload
        state.detailId = action.payload.id
      })
      .addCase(loadProductById.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = (action.payload as string) ?? 'Ошибка загрузки'
      })

      .addCase(loadCategories.pending, (state) => {
        state.categoriesStatus = 'loading'
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded'
        state.categories = action.payload
      })
      .addCase(loadCategories.rejected, (state) => {
        state.categoriesStatus = 'failed'
      })
  },
})

export const { setSearch, setSort } = productsSlice.actions
export default productsSlice.reducer
