import { useEffect, useState } from 'react'
import { audioEngine } from '../audio/AudioEngine'

export function useLiveMicLevel(active: boolean): number {
  const [level, setLevel] = useState(0)

  useEffect(() => {
    if (!active) {
      setLevel(0)
      return
    }

    let raf = 0
    const tick = () => {
      setLevel(audioEngine.getLevel())
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return level
}
