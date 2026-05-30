import { memo } from 'react'
import type { CaptureSource } from '../../types/track'
import { useSpotiFindStore } from '../../stores/useSpotiFindStore'
import { cn } from '../../lib/cn'
import styles from './CaptureModeToggle.module.css'

interface CaptureModeToggleProps {
  disabled?: boolean
}

function CaptureModeToggleComponent({ disabled }: CaptureModeToggleProps) {
  const captureMode = useSpotiFindStore((s) => s.captureMode)
  const setCaptureMode = useSpotiFindStore((s) => s.setCaptureMode)
  const systemAudioSupported = useSpotiFindStore((s) => s.systemAudioSupported)

  const setMode = (mode: CaptureSource) => {
    if (disabled) return
    if (mode === 'system' && !systemAudioSupported) return
    setCaptureMode(mode)
  }

  return (
    <div className={styles.group} role="group" aria-label="Audio capture source">
      <button
        type="button"
        className={cn(styles.option, captureMode === 'mic' && styles.active)}
        onClick={() => setMode('mic')}
        disabled={disabled}
        aria-pressed={captureMode === 'mic'}
      >
        Microphone
      </button>
      <button
        type="button"
        className={cn(
          styles.option,
          styles.optionWithBadge,
          captureMode === 'system' && styles.active,
          !systemAudioSupported && styles.unavailable,
        )}
        onClick={() => setMode('system')}
        disabled={disabled || !systemAudioSupported}
        aria-pressed={captureMode === 'system'}
        aria-disabled={!systemAudioSupported}
        title={
          systemAudioSupported
            ? 'Experimental desktop audio listening'
            : 'Not available in this browser'
        }
      >
        <span className={styles.optionLabel}>System audio</span>
        <span className={styles.experimental}>Experimental</span>
      </button>
    </div>
  )
}

export const CaptureModeToggle = memo(CaptureModeToggleComponent)
