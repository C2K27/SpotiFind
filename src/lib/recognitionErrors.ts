export function getAuddApiKey(): string | undefined {
  const key = import.meta.env.VITE_AUDD_API_KEY?.trim()
  return key || undefined
}

export function hasAuddApiKey(): boolean {
  return Boolean(getAuddApiKey())
}

import { RecognitionCopy } from './recognitionMessages'

export function getRecognitionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case 'AUDD_KEY_MISSING':
        return 'Add VITE_AUDD_API_KEY to your local .env file to enable recognition.'
      case 'AUDD_INVALID_KEY':
        return 'Recognition API key is invalid. Check VITE_AUDD_API_KEY in .env.'
      case 'AUDD_HTTP_401':
      case 'AUDD_HTTP_403':
        return 'Recognition API key was rejected. Verify VITE_AUDD_API_KEY.'
      case 'AUDD_NETWORK':
        return 'Could not reach the recognition service. Check your connection.'
      case 'AUDD_TIMEOUT':
      case 'RECOGNITION_TIMEOUT':
      case 'FETCH_TIMEOUT':
        return RecognitionCopy.noMatch
      case 'RECORDING_STOP_TIMEOUT':
      case 'RECORDING_FAILED':
        return RecognitionCopy.quietAudio
      case 'CAPTURE_ENDED':
        return RecognitionCopy.deviceStopped
      case 'AUDD_API_ERROR':
        return RecognitionCopy.recognitionFailed
      default:
        if (error.message.startsWith('AUDD_HTTP_')) {
          return 'Recognition service is temporarily unavailable.'
        }
    }
  }

  return 'Recognition is unavailable right now. Try again shortly.'
}
