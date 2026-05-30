import { memo } from 'react'
import { SpotiFindMark } from '../brand/SpotiFindMark'
import { cn } from '../../lib/cn'
import type { NavPage } from '../../types/track'
import styles from './Sidebar.module.css'

interface SidebarProps {
  active: NavPage
  onNavigate: (id: NavPage) => void
  drawerOpen: boolean
  onCloseDrawer: () => void
}

const NAV: { id: NavPage; label: string; icon: string }[] = [
  { id: 'identify', label: 'Identify', icon: 'M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z' },
  {
    id: 'history',
    label: 'History',
    icon: 'M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-2.05-4.95L16 11h5V3h-4z',
  },
]

function NavIcon({ path }: { path: string }) {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  )
}

function SidebarComponent({
  active,
  onNavigate,
  drawerOpen,
  onCloseDrawer,
}: SidebarProps) {
  const handleNav = (id: NavPage) => {
    onNavigate(id)
    onCloseDrawer()
  }

  return (
    <>
      <button
        type="button"
        className={cn(styles.backdrop, drawerOpen && styles.backdropVisible)}
        aria-label="Close menu"
        tabIndex={drawerOpen ? 0 : -1}
        onClick={onCloseDrawer}
      />

      <aside
        className={cn(styles.sidebar, drawerOpen && styles.sidebarOpen)}
        aria-label="SpotiFind navigation"
      >
        <a href="#main" className={styles.logo} onClick={onCloseDrawer}>
          <span className={styles.logoMark} aria-hidden>
            <SpotiFindMark className={styles.logoIcon} />
          </span>
          <span>
            <span className={styles.logoText}>SpotiFind</span>
            <span className={styles.logoSub}>Find any song</span>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                styles.navItem,
                active === item.id && styles.navItemActive,
              )}
              onClick={() => handleNav(item.id)}
              aria-current={active === item.id ? 'page' : undefined}
            >
              <NavIcon path={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <nav className={styles.mobileNav} aria-label="Primary mobile">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              styles.mobileNavItem,
              active === item.id && styles.mobileNavItemActive,
            )}
            onClick={() => onNavigate(item.id)}
            aria-current={active === item.id ? 'page' : undefined}
          >
            <NavIcon path={item.icon} />
            <span className={styles.mobileNavLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

export const Sidebar = memo(SidebarComponent)
