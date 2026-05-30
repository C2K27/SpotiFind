import { memo, useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import styles from './BookmarkButton.module.css'

interface BookmarkButtonProps {
  saved: boolean
  onToggle: () => void
  label?: string
}

function BookmarkButtonComponent({ saved, onToggle, label }: BookmarkButtonProps) {
  const [animating, setAnimating] = useState(false)
  const [ripple, setRipple] = useState(false)
  const prevSaved = useRef(saved)

  useEffect(() => {
    if (saved && !prevSaved.current) {
      setAnimating(true)
      setRipple(true)
      const t1 = window.setTimeout(() => setAnimating(false), 220)
      const t2 = window.setTimeout(() => setRipple(false), 450)
      prevSaved.current = saved
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
    prevSaved.current = saved
  }, [saved])

  const ariaLabel = saved
    ? label ?? 'Remove bookmark'
    : label ?? 'Bookmark track'

  return (
    <button
      type="button"
      className={cn(
        styles.bookmark,
        saved && styles.saved,
        animating && styles.animating,
      )}
      onClick={onToggle}
      aria-label={ariaLabel}
      aria-pressed={saved}
    >
      <span className={cn(styles.ripple, ripple && styles.rippleActive)} />
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  )
}

export const BookmarkButton = memo(BookmarkButtonComponent)
