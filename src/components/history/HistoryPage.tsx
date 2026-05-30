import { memo, useMemo, useState } from 'react'
import { filterHistory } from '../../lib/historyUtils'
import { useSpotiFindStore } from '../../stores/useSpotiFindStore'
import { Button } from '../ui/Button'
import { ConfirmModal } from '../ui/ConfirmModal'
import { HistoryCard } from './HistoryCard'
import { HistoryFilters, useFilterCounts } from './HistoryFilters'
import styles from './HistoryPage.module.css'

function HistoryPageComponent() {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const storedHistory = useSpotiFindStore((s) => s.storedHistory)
  const savedEntryIds = useSpotiFindStore((s) => s.savedEntryIds)
  const removingEntryIds = useSpotiFindStore((s) => s.removingEntryIds)
  const historyFilter = useSpotiFindStore((s) => s.historyFilter)
  const setHistoryFilter = useSpotiFindStore((s) => s.setHistoryFilter)
  const toggleBookmark = useSpotiFindStore((s) => s.toggleBookmark)
  const requestDeleteEntry = useSpotiFindStore((s) => s.requestDeleteEntry)
  const clearAllHistory = useSpotiFindStore((s) => s.clearAllHistory)
  const setPage = useSpotiFindStore((s) => s.setPage)
  const getHistory = useSpotiFindStore((s) => s.getHistory)

  const allEntries = useMemo(() => getHistory(), [storedHistory, getHistory])

  const counts = useFilterCounts(
    allEntries.length,
    allEntries.filter((e) => e.source === 'mic').length,
    allEntries.filter((e) => e.source === 'system').length,
    allEntries.filter((e) => savedEntryIds.includes(e.id)).length,
  )

  const filtered = useMemo(
    () => filterHistory(allEntries, historyFilter, savedEntryIds),
    [allEntries, historyFilter, savedEntryIds],
  )

  const isEmpty = allEntries.length === 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>History</h1>
          <p className={styles.sub}>Songs you identified with SpotiFind.</p>
        </div>
        {!isEmpty && (
          <div className={styles.headerActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
            >
              Clear history
            </Button>
          </div>
        )}
      </header>

      {isEmpty ? (
        <div className={styles.emptyFull} role="status">
          <p className={styles.emptyTitle}>No identifications yet</p>
          <p className={styles.emptyText}>
            When you identify a song, it will show up here with the time and
            source you used.
          </p>
          <Button variant="primary" size="sm" onClick={() => setPage('identify')}>
            Identify a song
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.filtersWrap}>
            <HistoryFilters
              active={historyFilter}
              counts={counts}
              onChange={setHistoryFilter}
            />
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty} role="status">
              <p>
                {historyFilter === 'saved'
                  ? 'No saved tracks yet. Bookmark a match to see it here.'
                  : 'No matches for this filter.'}
              </p>
              {historyFilter === 'saved' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setHistoryFilter('all')}
                >
                  Show all
                </Button>
              )}
            </div>
          ) : (
            <ul className={styles.grid} role="list">
              {filtered.map((entry) => (
                <li
                  key={entry.id}
                  className={
                    removingEntryIds.includes(entry.id)
                      ? styles.removing
                      : undefined
                  }
                >
                  <HistoryCard
                    entry={entry}
                    saved={savedEntryIds.includes(entry.id)}
                    onToggleBookmark={() => toggleBookmark(entry.id)}
                    onDelete={() => requestDeleteEntry(entry.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmModal
        open={confirmClearOpen}
        title="Clear history?"
        description="This removes all identifications from SpotiFind. Saved bookmarks will also be cleared."
        confirmLabel="Clear history"
        cancelLabel="Cancel"
        onConfirm={() => {
          clearAllHistory()
          setConfirmClearOpen(false)
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  )
}

export const HistoryPage = memo(HistoryPageComponent)
