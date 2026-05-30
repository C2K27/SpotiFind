import { memo } from 'react'
import { useSpotiFindStore } from '../../stores/useSpotiFindStore'
import { Button } from './Button'
import { cn } from '../../lib/cn'
import styles from './PlayNowButton.module.css'

interface PlayNowButtonProps {
  entryId: string
  trackTitle: string
  size?: 'md' | 'sm'
  tone?: 'muted' | 'accent'
}

function PlayNowButtonComponent({
  entryId,
  trackTitle,
  size = 'sm',
  tone = 'muted',
}: PlayNowButtonProps) {
  const playNow = useSpotiFindStore((s) => s.playNow)
  const nowPlayingEntryId = useSpotiFindStore((s) => s.nowPlayingEntryId)
  const playLoadingEntryId = useSpotiFindStore((s) => s.playLoadingEntryId)

  const loading = playLoadingEntryId === entryId
  const playing = nowPlayingEntryId === entryId && !loading

  const label = loading
    ? `Loading ${trackTitle}`
    : playing
      ? `Playing ${trackTitle}`
      : `Play ${trackTitle} now`

  const variant =
    playing || tone === 'muted' ? 'surface' : 'primary'

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        styles.button,
        tone === 'muted' && styles.muted,
        loading && styles.loading,
        playing && styles.playing,
      )}
      onClick={() => playNow(entryId)}
      disabled={loading}
      aria-busy={loading}
      aria-label={label}
      aria-pressed={playing}
    >
      {loading ? (
        <>
          <span className={styles.spinner} aria-hidden />
          Loading…
        </>
      ) : playing ? (
        <>
          <span className={styles.dot} aria-hidden />
          Playing
        </>
      ) : (
        'Play Now'
      )}
    </Button>
  )
}

export const PlayNowButton = memo(PlayNowButtonComponent)
