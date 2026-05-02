import { useState } from 'react'
import type { ShippingInfo } from '@/types/order'
import { Button } from '@/components/ui/Button'
import styles from './CheckoutForm.module.css'

interface Props {
  onSubmit: (shipping: ShippingInfo) => void
  submitting?: boolean
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+\d][\d\s\-()]{6,}$/

type FormState = ShippingInfo
type FormErrors = Partial<Record<keyof FormState, string>>

const INITIAL: FormState = {
  name: '',
  phone: '',
  email: '',
  address: '',
  comment: '',
}

export function CheckoutForm({ onSubmit, submitting = false }: Props) {
  const [values, setValues] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (values.name.trim().length < 2) e.name = 'Укажите имя получателя'
    if (!PHONE_RE.test(values.phone.trim())) e.phone = 'Введите телефон в формате +7 999 123-45-67'
    if (!EMAIL_RE.test(values.email.trim())) e.email = 'Некорректный email'
    if (values.address.trim().length < 5) e.address = 'Укажите адрес доставки'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      onSubmit({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
        comment: values.comment?.trim() || undefined,
      })
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>Доставка и контакты</h2>

      <Field label="Имя получателя" error={errors.name}>
        <input
          type="text"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Иван Иванов"
          autoComplete="name"
        />
      </Field>

      <div className={styles.row}>
        <Field label="Телефон" error={errors.phone}>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+7 999 123-45-67"
            autoComplete="tel"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={values.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="ivan@example.com"
            autoComplete="email"
          />
        </Field>
      </div>

      <Field label="Адрес доставки" error={errors.address}>
        <input
          type="text"
          value={values.address}
          onChange={(e) => update('address', e.target.value)}
          placeholder="Москва, ул. Ленина, д. 1, кв. 10"
          autoComplete="street-address"
        />
      </Field>

      <Field label="Комментарий к заказу (необязательно)">
        <textarea
          rows={3}
          value={values.comment}
          onChange={(e) => update('comment', e.target.value)}
          placeholder="Например: позвонить за 30 минут до доставки"
        />
      </Field>

      <Button type="submit" size="lg" fullWidth disabled={submitting}>
        {submitting ? 'Оформляем...' : 'Подтвердить заказ'}
      </Button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.control} ${error ? styles.controlInvalid : ''}`}>
        {children}
      </span>
      {error && <span className={styles.error}>{error}</span>}
    </label>
  )
}
