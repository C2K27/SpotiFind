import type { CaptureSource, Track } from '../../types/track'

export interface RecognitionMatch {
  track: Track
  confidence: number
  source: CaptureSource
}

export interface RecognitionProvider {
  readonly name: string
  recognize(audio: Blob): Promise<RecognitionMatch | null>
}
