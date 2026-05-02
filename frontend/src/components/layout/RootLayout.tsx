import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header } from './Header/Header'
import { Footer } from './Footer/Footer'
import styles from './RootLayout.module.css'

export function RootLayout() {
  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
