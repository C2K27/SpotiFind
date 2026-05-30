import { debugLog } from '../../lib/debugLog'
import { fetchWithTimeout } from '../../lib/fetchWithTimeout'
import { getAuddApiKey } from '../../lib/recognitionErrors'
import { TimeoutError } from '../../lib/withTimeout'
import { mapAuddToMatch } from './mapAuddResult'
import type { RecognitionProvider } from './types'
import type { CaptureSource } from '../../types/track'

const API_TIMEOUT_MS = 10_000

interface AuddResponse {
  status: string
  result?: Record<string, unknown> | null
  error?: { error_message?: string; error_code?: number }
}

function isInvalidKeyMessage(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('token') ||
    lower.includes('api key') ||
    lower.includes('api_token') ||
    lower.includes('unauthorized')
  )
}

function fileNameForBlob(blob: Blob): string {
  const type = blob.type.toLowerCase()
  if (type.includes('mp4')) return 'capture.m4a'
  if (type.includes('ogg')) return 'capture.ogg'
  if (type.includes('wav')) return 'capture.wav'
  return 'capture.webm'
}

export function createAuddProvider(source: CaptureSource): RecognitionProvider {
  const apiUrl =
    import.meta.env.VITE_RECOGNITION_API_URL ?? 'https://api.audd.io/'

  return {
    name: 'audd',
    async recognize(audio: Blob) {
      const apiKey = getAuddApiKey()
      if (!apiKey) {
        throw new Error('AUDD_KEY_MISSING')
      }

      const fileName = fileNameForBlob(audio)
      const fileType = audio.type || 'audio/webm'
      const started = performance.now()

      debugLog('AudD request start', { bytes: audio.size, source })

      const file = new File([audio], fileName, { type: fileType })
      const form = new FormData()
      form.append('api_token', apiKey)
      form.append('return', 'apple_music,spotify')
      form.append('file', file, fileName)

      let response: Response
      try {
        response = await fetchWithTimeout(
          apiUrl,
          { method: 'POST', body: form },
          API_TIMEOUT_MS,
        )
      } catch (error) {
        if (error instanceof TimeoutError) {
          debugLog('AudD request timeout', {
            durationMs: Math.round(performance.now() - started),
          })
          throw new Error('AUDD_TIMEOUT')
        }
        debugLog('AudD request network failure', {
          durationMs: Math.round(performance.now() - started),
          error,
        })
        throw new Error('AUDD_NETWORK')
      }

      const durationMs = Math.round(performance.now() - started)
      debugLog('AudD response status', {
        status: response.status,
        durationMs,
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error(`AUDD_HTTP_${response.status}`)
      }

      if (!response.ok) {
        throw new Error(`AUDD_HTTP_${response.status}`)
      }

      let data: AuddResponse
      try {
        const raw = await response.text()
        data = JSON.parse(raw) as AuddResponse
      } catch (error) {
        debugLog('AudD response parse error', {
          durationMs: Math.round(performance.now() - started),
          error,
        })
        throw new Error('AUDD_API_ERROR')
      }

      if (data.status === 'error') {
        const message = data.error?.error_message ?? ''
        debugLog('AudD API error', {
          message,
          code: data.error?.error_code,
        })
        if (isInvalidKeyMessage(message)) {
          throw new Error('AUDD_INVALID_KEY')
        }
        throw new Error('AUDD_API_ERROR')
      }

      if (data.status !== 'success' || !data.result) {
        debugLog('AudD no match in response', {
          status: data.status,
          durationMs: Math.round(performance.now() - started),
        })
        return null
      }

      const match = mapAuddToMatch(
        data.result as Parameters<typeof mapAuddToMatch>[0],
        source,
      )
      debugLog('AudD match', {
        matched: Boolean(match),
        durationMs: Math.round(performance.now() - started),
      })
      return match
    },
  }
}
