import { NavLink, Link } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const navClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <Link to="/words" className={styles.logo}>
          WordVault
        </Link>
        <div className={styles.navLinks}>
          <NavLink to="/words" className={navClass}>
            单词库
          </NavLink>
          <NavLink to="/practice" className={navClass}>
            自由练习
          </NavLink>
          <NavLink to="/cards" className={navClass}>
            卡片池
          </NavLink>
          <NavLink to="/dashboard" className={navClass}>
            仪表盘
          </NavLink>
        </div>
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
