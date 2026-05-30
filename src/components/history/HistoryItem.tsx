import { memo } from 'react'
import type { HistoryEntry } from '../../types/track'
import { AlbumArt } from '../ui/AlbumArt'
import { BookmarkButton } from '../ui/BookmarkButton'
import { PlayNowButton } from '../ui/PlayNowButton'
import { formatDuration, formatRelativeTime } from '../../lib/formatTime'
import { cn } from '../../lib/cn'
import styles from './HistoryItem.module.css'

interface HistoryItemProps {
  entry: HistoryEntry
  saved: boolean
  onToggleBookmark: () => void
  onDelete?: () => void
  removing?: boolean
}

function HistoryItemComponent({
  entry,
  saved,
  onToggleBookmark,
  onDelete,
  removing,
}: HistoryItemProps) {
  const { id, track, recognizedAt, source } = entry

  return (
    <li className={cn(styles.row, saved && styles.rowSaved, removing && styles.removing)}>
      <AlbumArt hue={track.coverHue} title={track.title} size="sm" />
      <div className={styles.info}>
        <p className={styles.title}>{track.title}</p>
        <p className={styles.artist}>{track.artist}</p>
        <div className={styles.meta}>
          <time dateTime={recognizedAt.toISOString()}>
            {formatRelativeTime(recognizedAt)}
          </time>
          <span className={styles.dot} aria-hidden />
          <span>{source === 'mic' ? 'Microphone' : 'System audio'}</span>
          <span className={styles.dot} aria-hidden />
          <span>{formatDuration(track.durationMs)}</span>
        </div>
      </div>
      <div className={styles.actions}>
        {onDelete && (
          <button
            type="button"
            className={styles.delete}
            onClick={onDelete}
            aria-label={`Remove ${track.title} from history`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <PlayNowButton entryId={id} trackTitle={track.title} size="sm" />
        <BookmarkButton
          saved={saved}
          onToggle={onToggleBookmark}
          label={`${saved ? 'Remove bookmark for' : 'Bookmark'} ${track.title}`}
        />
      </div>
    </li>
  )
}

export const HistoryItem = memo(HistoryItemComponent)
