import type { Category } from '@/types/product'

export const categories: Category[] = [
  { slug: 'led', name: 'LED', description: 'Светодиодные лампы — самый энергоэффективный выбор' },
  { slug: 'halogen', name: 'Галогенные', description: 'Тёплый свет, мгновенное включение' },
  { slug: 'fluorescent', name: 'Люминесцентные', description: 'Большой световой поток при низкой мощности' },
  { slug: 'incandescent', name: 'Накаливания', description: 'Классические лампы с тёплым спектром' },
  { slug: 'smart', name: 'Умные', description: 'Управление через приложение, RGB и сценарии' },
]

export const categoryNameBySlug = (slug: Category['slug']): string =>
  categories.find((c) => c.slug === slug)?.name ?? slug
