import type { CaptureSource } from '../types/track'

const MIC_ACTIVITY_THRESHOLD = 0.012
const SYSTEM_ACTIVITY_THRESHOLD = 0.02

const MIC_PEAK_MIN = 0.01
const SYSTEM_PEAK_MIN = 0.018

export function activityThresholdFor(mode: CaptureSource): number {
  return mode === 'mic' ? MIC_ACTIVITY_THRESHOLD : SYSTEM_ACTIVITY_THRESHOLD
}

export function peakThresholdFor(mode: CaptureSource): number {
  return mode === 'mic' ? MIC_PEAK_MIN : SYSTEM_PEAK_MIN
}

export function minRecordedBytesFor(mode: CaptureSource): number {
  return mode === 'mic' ? 700 : 1200
}
