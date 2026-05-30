import { memo } from 'react'
import type { Track } from '../../types/track'
import { RecognitionCopy } from '../../lib/recognitionMessages'
import { AlbumArt } from '../ui/AlbumArt'
import { Badge } from '../ui/Badge'
import { BookmarkButton } from '../ui/BookmarkButton'
import { PlayNowButton } from '../ui/PlayNowButton'
import { Button } from '../ui/Button'
import { formatConfidence, formatDuration } from '../../lib/formatTime'
import { cn } from '../../lib/cn'
import styles from './RecognitionResult.module.css'

interface RecognitionResultProps {
  track: Track | null
  entryId: string | null
  confidence?: number
  saved: boolean
  processing?: boolean
  failed?: boolean
  errorMessage?: string | null
  showHaptic?: boolean
  onBookmark: () => void
  onListenAgain: () => void
}

function parseErrorMessage(message: string | null | undefined) {
  if (!message) {
    return {
      title: RecognitionCopy.noMatch,
      hint: RecognitionCopy.noMatchHint,
    }
  }

  const parts = message.split('\n').map((p) => p.trim()).filter(Boolean)
  return {
    title: parts[0] ?? RecognitionCopy.noMatch,
    hint: parts[1] ?? RecognitionCopy.noMatchHint,
  }
}

function RecognitionResultComponent({
  track,
  entryId,
  confidence,
  saved,
  processing,
  failed,
  errorMessage,
  showHaptic,
  onBookmark,
  onListenAgain,
}: RecognitionResultProps) {
  if (processing) {
    return (
      <div className={styles.processingBlock} role="status" aria-live="polite">
        <span className={styles.processingSpinner} aria-hidden />
        <p className={cn(styles.statusLine, styles.processing)}>
          Analyzing audio…
        </p>
      </div>
    )
  }

  if (failed) {
    const { title, hint } = parseErrorMessage(errorMessage)

    return (
      <div className={styles.error} role="alert">
        <p className={styles.errorTitle}>{title}</p>
        <p className={styles.errorHint}>{hint}</p>
        <Button variant="secondary" size="sm" onClick={onListenAgain}>
          Listen again
        </Button>
      </div>
    )
  }

  if (!track || !entryId) return null

  return (
    <article
      className={styles.result}
      aria-live="polite"
      aria-label={`Recognized ${track.title} by ${track.artist}`}
    >
      {showHaptic && <span className={cn(styles.haptic, styles.hapticActive)} aria-hidden />}
      <AlbumArt hue={track.coverHue} title={track.title} size="lg" />
      <div className={styles.meta}>
        <h2 className={styles.title}>{track.title}</h2>
        <p className={styles.artist}>{track.artist}</p>
        <div className={styles.details}>
          <span>{track.album}</span>
          <span aria-hidden>·</span>
          <span>{formatDuration(track.durationMs)}</span>
          {confidence != null && (
            <>
              <span aria-hidden>·</span>
              <span className={styles.confidence}>
                {formatConfidence(confidence)} match
              </span>
            </>
          )}
          {track.isExplicit && <Badge variant="explicit" />}
        </div>
      </div>
      <div className={styles.actions}>
        <PlayNowButton
          entryId={entryId}
          trackTitle={track.title}
          tone="accent"
        />
        <BookmarkButton saved={saved} onToggle={onBookmark} />
      </div>
    </article>
  )
}

export const RecognitionResult = memo(RecognitionResultComponent)
