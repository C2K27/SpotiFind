import { memo, useMemo } from 'react'
import { useSpotiFindStore } from '../../stores/useSpotiFindStore'
import { HistoryItem } from './HistoryItem'
import styles from './RecentStrip.module.css'

const RECENT_LIMIT = 3

function RecentStripComponent() {
  const getHistory = useSpotiFindStore((s) => s.getHistory)
  const storedHistory = useSpotiFindStore((s) => s.storedHistory)
  const savedEntryIds = useSpotiFindStore((s) => s.savedEntryIds)
  const toggleBookmark = useSpotiFindStore((s) => s.toggleBookmark)
  const setPage = useSpotiFindStore((s) => s.setPage)

  const recent = useMemo(
    () => getHistory().slice(0, RECENT_LIMIT),
    [storedHistory, getHistory],
  )

  if (recent.length === 0) return null

  return (
    <section className={styles.strip} aria-labelledby="recent-heading">
      <div className={styles.header}>
        <h2 id="recent-heading" className={styles.title}>
          Recent
        </h2>
        <button
          type="button"
          className={styles.link}
          onClick={() => setPage('history')}
        >
          View all
        </button>
      </div>
      <ul className={styles.list} role="list">
        {recent.map((entry) => (
          <HistoryItem
            key={entry.id}
            entry={entry}
            saved={savedEntryIds.includes(entry.id)}
            onToggleBookmark={() => toggleBookmark(entry.id)}
          />
        ))}
      </ul>
    </section>
  )
}

export const RecentStrip = memo(RecentStripComponent)
