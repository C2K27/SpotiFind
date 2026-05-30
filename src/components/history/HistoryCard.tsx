import { memo } from 'react'
import type { HistoryEntry } from '../../types/track'
import { AlbumArt } from '../ui/AlbumArt'
import { BookmarkButton } from '../ui/BookmarkButton'
import { PlayNowButton } from '../ui/PlayNowButton'
import { formatDuration, formatTimestamp } from '../../lib/formatTime'
import { cn } from '../../lib/cn'
import styles from './HistoryCard.module.css'

interface HistoryCardProps {
  entry: HistoryEntry
  saved: boolean
  onToggleBookmark: () => void
  onDelete: () => void
}

function HistoryCardComponent({
  entry,
  saved,
  onToggleBookmark,
  onDelete,
}: HistoryCardProps) {
  const { id, track, recognizedAt, source } = entry

  return (
    <article className={cn(styles.card, saved && styles.cardSaved)}>
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
      <div className={styles.top}>
        <AlbumArt hue={track.coverHue} title={track.title} size="md" />
        <div className={styles.info}>
          <h3 className={styles.title}>{track.title}</h3>
          <p className={styles.artist}>{track.artist}</p>
          <div className={styles.meta}>
            <time dateTime={recognizedAt.toISOString()}>
              {formatTimestamp(recognizedAt)}
            </time>
            <span className={styles.dot} aria-hidden />
            <span>{source === 'mic' ? 'Microphone' : 'System audio'}</span>
            <span className={styles.dot} aria-hidden />
            <span>{formatDuration(track.durationMs)}</span>
          </div>
        </div>
        {saved && (
          <span className={styles.savedBadge} aria-label="Saved">
            Saved
          </span>
        )}
      </div>
      <div className={styles.footer}>
        <PlayNowButton entryId={id} trackTitle={track.title} />
        <BookmarkButton
          saved={saved}
          onToggle={onToggleBookmark}
          label={`${saved ? 'Remove bookmark for' : 'Bookmark'} ${track.title}`}
        />
      </div>
    </article>
  )
}

export const HistoryCard = memo(HistoryCardComponent)
