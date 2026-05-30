import { memo } from 'react'
import type { RecognitionState } from '../../types/track'
import { cn } from '../../lib/cn'
import MicSensitivityRing from './MicSensitivityRing'
import styles from './ListenButton.module.css'

interface ListenButtonProps {
  state: RecognitionState
  onStart: () => void
  onStop: () => void
  showSuccessPulse: boolean
}

function MicIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="40 20"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.9s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  )
}

function ListenButtonComponent({
  state,
  onStart,
  onStop,
  showSuccessPulse,
}: ListenButtonProps) {
  const listening = state === 'listening'
  const processing = state === 'processing'

  const label = processing
    ? 'Identifying track'
    : listening
      ? 'Stop listening'
      : 'Start listening'

  const handleClick = () => {
    if (processing) return
    if (listening) onStop()
    else onStart()
  }

  return (
    <div
      className={cn(styles.host, showSuccessPulse && styles.success)}
    >
      <MicSensitivityRing active={listening} />
      {showSuccessPulse && <span className={styles.pulse} aria-hidden />}
      <button
        type="button"
        className={cn(
          styles.button,
          listening && styles.listening,
          processing && styles.processing,
        )}
        onClick={handleClick}
        disabled={processing}
        aria-label={label}
        aria-pressed={listening}
        aria-busy={processing}
      >
        {processing ? <Spinner /> : listening ? <StopIcon /> : <MicIcon />}
      </button>
    </div>
  )
}

export const ListenButton = memo(ListenButtonComponent)
