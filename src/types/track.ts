export type RecognitionState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'success'
  | 'error'

export type NavPage = 'identify' | 'history'

export type CaptureSource = 'mic' | 'system'

export type HistoryFilter = 'all' | 'mic' | 'system' | 'saved'

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  durationMs: number
  coverHue: number
  isExplicit?: boolean
}

export interface HistoryEntry {
  id: string
  track: Track
  recognizedAt: Date
  confidence: number
  source: CaptureSource
}

export interface StoredHistoryEntry {
  id: string
  track: Track
  recognizedAt: string
  confidence: number
  source: CaptureSource
}
