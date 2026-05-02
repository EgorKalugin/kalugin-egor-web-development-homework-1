import styles from './Footer.module.css'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div>
          <div className={styles.brand}>💡 Лампочки</div>
          <p className={styles.copy}>
            Интернет-магазин завода лампочек. © {year}
          </p>
        </div>
        <div className={styles.links}>
          <a href="#">О компании</a>
          <a href="#">Доставка и оплата</a>
          <a href="#">Контакты</a>
        </div>
      </div>
    </footer>
  )
}
