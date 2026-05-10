import { useEffect } from 'react'
import { useAppDispatch } from '@/store'
import { loadCart } from '@/store/cartSlice'
import { loadCategories } from '@/store/productsSlice'

export function CartBootstrap() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(loadCart())
    dispatch(loadCategories())
  }, [dispatch])

  return null
}
