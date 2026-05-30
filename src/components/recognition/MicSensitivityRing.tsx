import { memo } from 'react'
import { useLiveMicLevel } from '../../hooks/useLiveMicLevel'
import { cn } from '../../lib/cn'
import styles from './MicSensitivityRing.module.css'

interface MicSensitivityRingProps {
  active: boolean
}

function MicSensitivityRingComponent({ active }: MicSensitivityRingProps) {
  const level = useLiveMicLevel(active)
  const scale = 1 + level * 0.1

  return (
    <div
      className={cn(styles.ringHost, active && styles.active)}
      aria-hidden
    >
      <div
        className={styles.glow}
        style={{
          transform: `scale(${scale})`,
          opacity: active ? 0.2 + level * 0.25 : 0,
        }}
      />
      <span className={styles.ring} style={{ opacity: active ? 0.15 + level * 0.2 : 0 }} />
      <span className={styles.ring} style={{ opacity: active ? 0.1 + level * 0.15 : 0 }} />
    </div>
  )
}

export default memo(MicSensitivityRingComponent)
