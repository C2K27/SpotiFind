import { MOCK_TRACKS } from '../../data/mockTracks'
import type { CaptureSource } from '../../types/track'
import type { RecognitionProvider } from './types'

export function createMockFallbackProvider(
  source: CaptureSource,
): RecognitionProvider {
  return {
    name: 'mock-fallback',
    async recognize() {
      await new Promise((r) => setTimeout(r, 400))
      const track = MOCK_TRACKS[Math.floor(Math.random() * MOCK_TRACKS.length)]!
      return {
        track,
        confidence: 0.88 + Math.random() * 0.1,
        source,
      }
    },
  }
}
