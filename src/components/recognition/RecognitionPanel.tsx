import { Suspense, lazy, memo } from 'react'
import type { RecognitionState, Track } from '../../types/track'
import { useSpotiFindStore } from '../../stores/useSpotiFindStore'
import { ListenButton } from './ListenButton'
import { RecognitionResult } from './RecognitionResult'
import { CaptureModeToggle } from './CaptureModeToggle'
import { RecognitionCopy } from '../../lib/recognitionMessages'
import { cn } from '../../lib/cn'
import styles from './RecognitionPanel.module.css'

const WaveformVisualizer = lazy(() => import('./WaveformVisualizer'))

interface RecognitionPanelProps {
  state: RecognitionState
  track: Track | null
  entryId: string | null
  saved: boolean
  confidence?: number
  showSuccessPulse: boolean
  recognitionMessage?: string | null
}

function stateLabel(state: RecognitionState): string {
  switch (state) {
    case 'listening':
      return 'Listening…'
    case 'processing':
      return 'Analyzing audio…'
    case 'success':
      return 'Match found'
    case 'error':
      return "Couldn't identify"
    default:
      return 'Ready'
  }
}

function WaveformFallback() {
  return <div style={{ height: 72 }} aria-hidden />
}

function RecognitionPanelComponent({
  state,
  track,
  entryId,
  saved,
  confidence,
  showSuccessPulse,
  recognitionMessage,
}: RecognitionPanelProps) {
  const startListening = useSpotiFindStore((s) => s.startListening)
  const stopListening = useSpotiFindStore((s) => s.stopListening)
  const toggleCurrentBookmark = useSpotiFindStore((s) => s.toggleCurrentBookmark)
  const captureMode = useSpotiFindStore((s) => s.captureMode)
  const systemAudioSupported = useSpotiFindStore((s) => s.systemAudioSupported)

  const listening = state === 'listening'
  const processing = state === 'processing'
  const failed = state === 'error'
  const isActive = listening || processing

  const hint = listening
    ? 'Hold steady near the audio source.'
    : processing
      ? 'Analyzing audio…'
        : failed
        ? RecognitionCopy.noMatchHint
        : 'Tap listen to identify · Space on desktop'

  return (
    <section className={styles.panel} aria-labelledby="spotifind-heading">
      <header className={styles.header}>
        <h1 id="spotifind-heading" className={styles.heading}>
          What&apos;s playing?
        </h1>
        <p className={styles.sub}>
          Point your device toward the music and tap listen. Microphone works best.
        </p>
        <CaptureModeToggle disabled={isActive} />
        {captureMode === 'system' && !isActive && (
          <p className={styles.captureNote}>
            {systemAudioSupported
              ? 'Experimental on desktop. Listen to audio from your computer when your browser allows it.'
              : 'Not available in this browser. Microphone works best.'}
          </p>
        )}
      </header>

      <div
        className={cn(styles.stage, listening && styles.immersive)}
        aria-busy={isActive}
      >
        <p
          className={cn(
            styles.stateLabel,
            isActive && styles.stateLabelActive,
            failed && styles.stateLabelError,
          )}
          role="status"
        >
          {stateLabel(state)}
        </p>

        <Suspense fallback={<WaveformFallback />}>
          <WaveformVisualizer active={listening} />
        </Suspense>

        <ListenButton
          state={state}
          onStart={startListening}
          onStop={stopListening}
          showSuccessPulse={showSuccessPulse}
        />

        <RecognitionResult
          track={track}
          entryId={entryId}
          confidence={confidence}
          saved={saved}
          processing={processing}
          failed={failed}
          errorMessage={recognitionMessage}
          showHaptic={showSuccessPulse}
          onBookmark={toggleCurrentBookmark}
          onListenAgain={startListening}
        />
      </div>

      <p className={styles.hint}>{hint}</p>
    </section>
  )
}

export const RecognitionPanel = memo(RecognitionPanelComponent)
