import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store'
import styles from './Header.module.css'

export function Header() {
  const itemCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0),
  )
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : '/catalog')
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>💡</span>
          <span className={styles.logoText}>Лампочки</span>
        </Link>

        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Главная
          </NavLink>
          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Каталог
          </NavLink>
        </nav>

        <form className={styles.search} onSubmit={submit} role="search">
          <span className={styles.searchIcon} aria-hidden>🔍</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск лампочек..."
            className={styles.searchInput}
            aria-label="Поиск товаров"
          />
        </form>

        <Link to="/cart" className={styles.cartButton} aria-label="Корзина">
          <span aria-hidden>🛒</span>
          <span>Корзина</span>
          {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
        </Link>
      </div>
    </header>
  )
}
