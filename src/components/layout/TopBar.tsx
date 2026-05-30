import { memo } from 'react'
import type { NavPage, RecognitionState } from '../../types/track'
import styles from './TopBar.module.css'

interface TopBarProps {
  state: RecognitionState
  page: NavPage
  onOpenMenu: () => void
}

const PAGE_TITLES: Record<NavPage, string> = {
  identify: 'Identify',
  history: 'History',
}

function TopBarComponent({ state, page, onOpenMenu }: TopBarProps) {
  const listening = state === 'listening' || state === 'processing'

  return (
    <header className={styles.bar}>
      <div className={styles.leading}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <span className={styles.brand}>SpotiFind</span>
          <span className={styles.sep} aria-hidden>
            /
          </span>
          <strong>{PAGE_TITLES[page]}</strong>
        </nav>
      </div>
      {listening && page === 'identify' && (
        <span className={styles.live} role="status">
          <span className={styles.dot} aria-hidden />
          Listening
        </span>
      )}
    </header>
  )
}

export const TopBar = memo(TopBarComponent)
