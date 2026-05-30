import { memo } from 'react'
import { useLiveWaveform } from '../../hooks/useLiveWaveform'
import { cn } from '../../lib/cn'
import styles from './WaveformVisualizer.module.css'

interface WaveformVisualizerProps {
  active: boolean
  className?: string
}

function WaveformVisualizerComponent({
  active,
  className,
}: WaveformVisualizerProps) {
  const bars = useLiveWaveform(active)

  return (
    <div
      className={cn(
        styles.wrapper,
        active && styles.active,
        active && styles.listening,
        className,
      )}
      role="img"
      aria-label={active ? 'Live audio waveform' : 'Audio waveform idle'}
      aria-hidden={!active}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          className={styles.bar}
          style={{
            transform: `scaleY(${Math.max(0.08, h)})`,
          }}
        />
      ))}
    </div>
  )
}

export default memo(WaveformVisualizerComponent)
