import { useEffect } from 'react'
import { useSpotiFindStore } from '../stores/useSpotiFindStore'

export function useKeyboardShortcuts() {
  const page = useSpotiFindStore((s) => s.page)
  const recognitionState = useSpotiFindStore((s) => s.recognitionState)
  const startListening = useSpotiFindStore((s) => s.startListening)
  const stopListening = useSpotiFindStore((s) => s.stopListening)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (page !== 'identify') return
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        if (
          recognitionState === 'listening' ||
          recognitionState === 'processing'
        ) {
          stopListening()
        }
        else if (
          recognitionState === 'idle' ||
          recognitionState === 'success' ||
          recognitionState === 'error'
        ) {
          startListening()
        }
      }

      if (
        e.code === 'Escape' &&
        (recognitionState === 'listening' || recognitionState === 'processing')
      ) {
        stopListening()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [page, recognitionState, startListening, stopListening])
}
