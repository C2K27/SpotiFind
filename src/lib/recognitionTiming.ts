import type { CaptureSource } from '../types/track'

export interface ListenWindow {
  minMs: number
  maxMs: number
  analyzeMinMs: number
  analyzeMaxMs: number
  processingMaxMs: number
  extraCaptureMs: number
  maxCaptureExtensions: number
  maxApiAttempts: number
}

const MIC: ListenWindow = {
  minMs: 5000,
  maxMs: 13_000,
  analyzeMinMs: 1200,
  analyzeMaxMs: 2200,
  processingMaxMs: 18_000,
  extraCaptureMs: 3200,
  maxCaptureExtensions: 2,
  maxApiAttempts: 2,
}

const SYSTEM: ListenWindow = {
  minMs: 4500,
  maxMs: 11_000,
  analyzeMinMs: 1000,
  analyzeMaxMs: 2000,
  processingMaxMs: 16_000,
  extraCaptureMs: 2800,
  maxCaptureExtensions: 1,
  maxApiAttempts: 2,
}

export function getListenWindow(mode: CaptureSource): ListenWindow {
  return mode === 'mic' ? MIC : SYSTEM
}
