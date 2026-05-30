import { useEffect, useState } from 'react'
import { audioEngine } from '../audio/AudioEngine'

const BAR_COUNT = 48

function idleBars(): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const center = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2)
    return 0.1 + center * 0.05
  })
}

export function useLiveWaveform(active: boolean): number[] {
  const [bars, setBars] = useState(idleBars)

  useEffect(() => {
    if (!active) {
      setBars(idleBars())
      return
    }

    let raf = 0
    const tick = () => {
      setBars(audioEngine.getFrequencyBars(BAR_COUNT))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])

  return bars
}

export const LIVE_WAVEFORM_BAR_COUNT = BAR_COUNT
