import { useEffect, useRef } from 'react'
import { audioEngine } from '../audio/AudioEngine'
import { debugLog } from '../lib/debugLog'
import { RecognitionCopy } from '../lib/recognitionMessages'
import { getListenWindow } from '../lib/recognitionTiming'
import { validateCaptureBlob } from '../lib/validateCaptureBlob'
import { recognizeAudio } from '../services/recognition'
import { randomBetween } from '../lib/timing'
import { useSpotiFindStore } from '../stores/useSpotiFindStore'

export function useRecognitionSession() {
  const recognitionState = useSpotiFindStore((s) => s.recognitionState)
  const captureMode = useSpotiFindStore((s) => s.captureMode)
  const sessionRef = useRef(0)

  useEffect(() => {
    if (recognitionState !== 'listening') return

    const timing = getListenWindow(captureMode)
    const sessionId = ++sessionRef.current
    let cancelled = false
    let aborted = false
    let finalizing = false
    let intervalId = 0
    let processingGuardId = 0
    let captureExtensions = 0
    const startedAt = Date.now()
    let listenUntil = startedAt + timing.maxMs
    let heardAudio = false

    const fail = (message: string, hint?: string) => {
      const store = useSpotiFindStore.getState()
      if (sessionId !== sessionRef.current) return
      if (
        store.recognitionState === 'idle' ||
        store.recognitionState === 'success' ||
        store.recognitionState === 'error'
      ) {
        return
      }
      aborted = true
      clearTimeout(processingGuardId)
      void audioEngine.dispose()
      store.failRecognition(hint ? `${message}\n${hint}` : message)
    }

    const beginFinalize = () => {
      if (cancelled || finalizing || sessionId !== sessionRef.current) return
      finalizing = true
      clearInterval(intervalId)
      void finalize()
    }

    audioEngine.onStreamEnded(() => {
      if (!finalizing && !cancelled) {
        beginFinalize()
      }
    })

    const tick = () => {
      if (cancelled || finalizing || sessionId !== sessionRef.current) return

      if (!audioEngine.isStreamActive()) {
        beginFinalize()
        return
      }

      audioEngine.sampleSignal()

      if (audioEngine.hasAudibleActivity()) heardAudio = true
      if (audioEngine.hasRecordedData()) heardAudio = true
      if (audioEngine.hasMeaningfulSignal()) heardAudio = true

      const now = Date.now()
      const elapsed = now - startedAt
      const ready =
        now >= listenUntil ||
        (elapsed >= timing.minMs && heardAudio)

      if (ready) beginFinalize()
    }

    intervalId = window.setInterval(tick, 100)
    tick()

    async function recognizeWithRetry(blob: Blob) {
      let lastMatch = null

      for (let attempt = 0; attempt < timing.maxApiAttempts; attempt++) {
        if (aborted || sessionId !== sessionRef.current) return null

        lastMatch = await recognizeAudio(blob, captureMode)
        if (lastMatch) return lastMatch

        if (attempt < timing.maxApiAttempts - 1) {
          debugLog('recognition retry', { attempt: attempt + 1 })
          await sleep(500)
        }
      }

      return lastMatch
    }

    async function finalize() {
      if (cancelled || sessionId !== sessionRef.current) return

      const store = useSpotiFindStore.getState()
      if (store.recognitionState !== 'listening') return

      store.setRecognitionState('processing')

      processingGuardId = window.setTimeout(() => {
        fail(RecognitionCopy.noMatch, RecognitionCopy.noMatchHint)
      }, timing.processingMaxMs)

      try {
        const analyzeMs = randomBetween(
          timing.analyzeMinMs,
          timing.analyzeMaxMs,
        )
        await sleep(analyzeMs)

        if (aborted || sessionId !== sessionRef.current) return

        if (cancelled) {
          fail(RecognitionCopy.noMatch, RecognitionCopy.noMatchHint)
          return
        }

        if (
          captureMode === 'system' &&
          !audioEngine.isStreamActive() &&
          !heardAudio
        ) {
          fail(
            RecognitionCopy.deviceStopped,
            RecognitionCopy.noMatchHint,
          )
          return
        }

        if (
          !audioEngine.hasMeaningfulSignal() &&
          captureExtensions < timing.maxCaptureExtensions
        ) {
          captureExtensions += 1
          finalizing = false
          heardAudio = false
          listenUntil = Date.now() + timing.extraCaptureMs + timing.minMs
          debugLog('extending capture', { captureExtensions })
          intervalId = window.setInterval(tick, 100)
          return
        }

        const hadSignal = heardAudio || audioEngine.hasMeaningfulSignal()
        const blob = await audioEngine.stopRecording()
        await audioEngine.dispose()

        const validation = validateCaptureBlob(blob, captureMode)
        if (!validation.ok || !hadSignal) {
          fail(RecognitionCopy.quietAudio)
          return
        }

        const match = await recognizeWithRetry(blob)

        if (aborted || sessionId !== sessionRef.current) return

        clearTimeout(processingGuardId)

        if (useSpotiFindStore.getState().recognitionState !== 'processing') {
          return
        }

        if (!match) {
          store.failRecognition(
            `${RecognitionCopy.noMatch}\n${RecognitionCopy.noMatchHint}`,
          )
          return
        }

        store.completeRecognition(match)
      } catch (error) {
        if (aborted || sessionId !== sessionRef.current) return
        clearTimeout(processingGuardId)
        debugLog('finalize error', error)

        const isConfigError =
          error instanceof Error &&
          (error.message.startsWith('Add VITE_') ||
            error.message.includes('API key'))

        if (isConfigError && error instanceof Error) {
          fail(error.message)
          return
        }

        fail(
          RecognitionCopy.recognitionFailed,
          RecognitionCopy.noMatchHint,
        )
      } finally {
        clearTimeout(processingGuardId)
        audioEngine.onStreamEnded(null)
      }
    }

    return () => {
      const state = useSpotiFindStore.getState().recognitionState

      if (state === 'processing') {
        return
      }

      cancelled = true
      clearInterval(intervalId)
      clearTimeout(processingGuardId)
      audioEngine.onStreamEnded(null)
    }
  }, [recognitionState, captureMode])
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
