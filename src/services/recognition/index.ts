import { debugLog } from '../../lib/debugLog'
import {
  getRecognitionErrorMessage,
  hasAuddApiKey,
} from '../../lib/recognitionErrors'
import { getMinCaptureBytes } from '../../lib/validateCaptureBlob'
import { TimeoutError, withTimeout } from '../../lib/withTimeout'
import { createAuddProvider } from './auddProvider'
import { createMockFallbackProvider } from './mockFallbackProvider'
import type { RecognitionMatch, RecognitionProvider } from './types'
import type { CaptureSource } from '../../types/track'

const RECOGNITION_TIMEOUT_MS = 12_000

export type { RecognitionMatch, RecognitionProvider }

export function getRecognitionProvider(
  source: CaptureSource,
): RecognitionProvider {
  if (hasAuddApiKey()) {
    return createAuddProvider(source)
  }
  return createMockFallbackProvider(source)
}

export async function recognizeAudio(
  audio: Blob,
  source: CaptureSource,
): Promise<RecognitionMatch | null> {
  const started = performance.now()
  const key = hasAuddApiKey()

  if (audio.size < getMinCaptureBytes(source)) {
    debugLog('recognizeAudio skipped: blob too small')
    return null
  }

  if (!key) {
    debugLog('no API key, mock fallback')
    const match = await createMockFallbackProvider(source).recognize(audio)
    debugLog('recognizeAudio mock finished', {
      matched: Boolean(match),
      durationMs: Math.round(performance.now() - started),
    })
    return match
  }

  try {
    const match = await withTimeout(
      createAuddProvider(source).recognize(audio),
      RECOGNITION_TIMEOUT_MS,
      'RECOGNITION_TIMEOUT',
    )
    debugLog('recognizeAudio finished', {
      matched: Boolean(match),
      durationMs: Math.round(performance.now() - started),
    })
    return match
  } catch (error) {
    debugLog('recognizeAudio error', {
      error,
      durationMs: Math.round(performance.now() - started),
    })
    if (error instanceof TimeoutError) {
      return null
    }
    throw new Error(getRecognitionErrorMessage(error))
  }
}
