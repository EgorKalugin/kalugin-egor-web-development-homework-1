import { Link, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  const error = useRouteError() as
    | { status?: number; statusText?: string; message?: string }
    | undefined

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.text}>
        {error?.statusText ?? error?.message ?? 'Запрошенный адрес не существует.'}
      </p>
      <div className={styles.actions}>
        <Link to="/">
          <Button>На главную</Button>
        </Link>
        <Link to="/catalog">
          <Button variant="secondary">В каталог</Button>
        </Link>
      </div>
    </div>
  )
}
