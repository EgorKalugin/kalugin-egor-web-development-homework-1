const ruble = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

export const formatPrice = (value: number): string => ruble.format(value)

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export const formatDateTime = (iso: string): string =>
  dateFormatter.format(new Date(iso))
