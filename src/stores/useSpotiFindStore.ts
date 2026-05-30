import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioEngine, supportsSystemAudioCapture } from '../audio/AudioEngine'
import { RecognitionCopy } from '../lib/recognitionMessages'
import { INITIAL_SAVED_IDS, INITIAL_STORED_HISTORY } from '../data/initialStore'
import { toStoredEntry } from '../lib/historyUtils'
import type { RecognitionMatch } from '../services/recognition'
import type {
  CaptureSource,
  HistoryEntry,
  HistoryFilter,
  NavPage,
  RecognitionState,
  StoredHistoryEntry,
  Track,
} from '../types/track'

const PLAY_LOADING_MS = 400
const LEGACY_STORAGE_KEY = 'spotfind-storage'
const STORAGE_KEY = 'spotifind-storage'
let playTimer: number | null = null

function migrateLegacyStorage() {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      localStorage.setItem(STORAGE_KEY, legacy)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    }
  } catch {
    /* ignore storage errors */
  }
}

migrateLegacyStorage()

function shouldFallbackToMic(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return (
    error.message === 'SYSTEM_AUDIO_UNSUPPORTED' ||
    error.message === 'SYSTEM_AUDIO_NO_TRACK'
  )
}

interface SpotiFindState {
  page: NavPage
  recognitionState: RecognitionState
  currentTrack: Track | null
  currentEntryId: string | null
  liveConfidence: number | null
  showSuccessPulse: boolean
  recognitionMessage: string | null
  captureMode: CaptureSource
  systemAudioSupported: boolean
  historyFilter: HistoryFilter
  storedHistory: StoredHistoryEntry[]
  savedEntryIds: string[]
  removingEntryIds: string[]
  nowPlayingEntryId: string | null
  playLoadingEntryId: string | null

  setPage: (page: NavPage) => void
  setCaptureMode: (mode: CaptureSource) => void
  setHistoryFilter: (filter: HistoryFilter) => void
  setRecognitionState: (state: RecognitionState) => void
  getHistory: () => HistoryEntry[]
  toggleBookmark: (entryId: string) => void
  startListening: () => Promise<void>
  stopListening: () => Promise<void>
  completeRecognition: (match: RecognitionMatch) => void
  failRecognition: (message: string) => void
  toggleCurrentBookmark: () => void
  requestDeleteEntry: (entryId: string) => void
  clearAllHistory: () => void
  playNow: (entryId: string) => void
}

export const useSpotiFindStore = create<SpotiFindState>()(
  persist(
    (set, get) => ({
      page: 'identify',
      recognitionState: 'idle',
      currentTrack: null,
      currentEntryId: null,
      liveConfidence: null,
      showSuccessPulse: false,
      recognitionMessage: null,
      captureMode: 'mic',
      systemAudioSupported: supportsSystemAudioCapture(),
      historyFilter: 'all',
      storedHistory: INITIAL_STORED_HISTORY,
      savedEntryIds: INITIAL_SAVED_IDS,
      removingEntryIds: [],
      nowPlayingEntryId: null,
      playLoadingEntryId: null,

      setPage: (page) => set({ page }),

      setCaptureMode: (mode) => {
        if (mode === 'system' && !get().systemAudioSupported) return
        set({ captureMode: mode, recognitionMessage: null })
      },

      setHistoryFilter: (filter) => set({ historyFilter: filter }),

      setRecognitionState: (recognitionState) => set({ recognitionState }),

      getHistory: () =>
        get().storedHistory.map((entry) => ({
          ...entry,
          recognizedAt: new Date(entry.recognizedAt),
        })),

      toggleBookmark: (entryId) => {
        set((state) => {
          const saved = state.savedEntryIds.includes(entryId)
          return {
            savedEntryIds: saved
              ? state.savedEntryIds.filter((id) => id !== entryId)
              : [...state.savedEntryIds, entryId],
          }
        })
      },

      startListening: async () => {
        const { captureMode, recognitionState } = get()
        if (recognitionState === 'listening' || recognitionState === 'processing') {
          return
        }

        set({
          recognitionState: 'listening',
          currentTrack: null,
          currentEntryId: null,
          liveConfidence: null,
          showSuccessPulse: false,
          recognitionMessage: null,
        })

        const tryCapture = async (mode: CaptureSource) => {
          await audioEngine.start(mode)
        }

        let mode = captureMode

        let captureError: unknown

        try {
          await tryCapture(mode)
        } catch (err) {
          captureError = err
          await audioEngine.dispose()

          if (mode === 'system' && shouldFallbackToMic(captureError)) {
            set({ captureMode: 'mic' })
            mode = 'mic'
            try {
              await tryCapture(mode)
              return
            } catch (fallbackErr) {
              captureError = fallbackErr
            }
          }

          const error = captureError

          if (error instanceof DOMException && error.name === 'NotAllowedError') {
            set({
              recognitionState: 'error',
              recognitionMessage:
                mode === 'system'
                  ? RecognitionCopy.devicePermissionCancelled
                  : RecognitionCopy.micRequired,
            })
            return
          }

          if (error instanceof Error) {
            if (error.message === 'SYSTEM_AUDIO_UNSUPPORTED') {
              set({
                recognitionState: 'error',
                recognitionMessage: RecognitionCopy.deviceUnsupported,
              })
              return
            }
            if (error.message === 'SYSTEM_AUDIO_NO_TRACK') {
              set({
                recognitionState: 'error',
                recognitionMessage: RecognitionCopy.deviceNoTrack,
              })
              return
            }
          }

          set({
            recognitionState: 'error',
            recognitionMessage:
              mode === 'system'
                ? RecognitionCopy.deviceCaptureFailed
                : RecognitionCopy.micRequired,
          })
        }
      },

      stopListening: async () => {
        await audioEngine.dispose()
        set({
          recognitionState: 'idle',
          currentTrack: null,
          currentEntryId: null,
          liveConfidence: null,
          showSuccessPulse: false,
          recognitionMessage: null,
        })
      },

      completeRecognition: (match) => {
        const entryId = `hist_${Date.now()}`
        const entry: HistoryEntry = {
          id: entryId,
          track: match.track,
          recognizedAt: new Date(),
          confidence: match.confidence,
          source: match.source,
        }

        set((state) => ({
          recognitionState: 'success',
          currentTrack: match.track,
          currentEntryId: entryId,
          liveConfidence: match.confidence,
          storedHistory: [toStoredEntry(entry), ...state.storedHistory].slice(
            0,
            50,
          ),
          showSuccessPulse: true,
          recognitionMessage: null,
        }))

        window.setTimeout(
          () => useSpotiFindStore.setState({ showSuccessPulse: false }),
          600,
        )
        window.setTimeout(
          () =>
            useSpotiFindStore.setState({
              recognitionState: 'idle',
              liveConfidence: null,
            }),
          6000,
        )
      },

      failRecognition: (message) => {
        set({
          recognitionState: 'error',
          currentTrack: null,
          currentEntryId: null,
          liveConfidence: null,
          showSuccessPulse: false,
          recognitionMessage: message,
        })

        window.setTimeout(
          () =>
            useSpotiFindStore.setState({
              recognitionState: 'idle',
              recognitionMessage: null,
            }),
          5000,
        )
      },

      toggleCurrentBookmark: () => {
        const { currentEntryId } = get()
        if (currentEntryId) get().toggleBookmark(currentEntryId)
      },

      requestDeleteEntry: (entryId) => {
        set((state) => ({
          removingEntryIds: [...state.removingEntryIds, entryId],
        }))

        window.setTimeout(() => {
          set((state) => ({
            storedHistory: state.storedHistory.filter((e) => e.id !== entryId),
            savedEntryIds: state.savedEntryIds.filter((id) => id !== entryId),
            removingEntryIds: state.removingEntryIds.filter(
              (id) => id !== entryId,
            ),
            nowPlayingEntryId:
              state.nowPlayingEntryId === entryId
                ? null
                : state.nowPlayingEntryId,
          }))
        }, 220)
      },

      clearAllHistory: () => {
        set({
          storedHistory: [],
          savedEntryIds: [],
          removingEntryIds: [],
          nowPlayingEntryId: null,
          currentTrack: null,
          currentEntryId: null,
          liveConfidence: null,
          recognitionState: 'idle',
        })
      },

      playNow: (entryId) => {
        if (get().playLoadingEntryId) return
        if (playTimer) clearTimeout(playTimer)

        set({ playLoadingEntryId: entryId, nowPlayingEntryId: null })

        playTimer = window.setTimeout(() => {
          set({
            playLoadingEntryId: null,
            nowPlayingEntryId: entryId,
          })
          playTimer = null
        }, PLAY_LOADING_MS)
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        storedHistory: state.storedHistory,
        savedEntryIds: state.savedEntryIds,
        captureMode: state.captureMode,
      }),
    },
  ),
)

export function useCurrentRecognition() {
  const recognitionState = useSpotiFindStore((s) => s.recognitionState)
  const currentTrack = useSpotiFindStore((s) => s.currentTrack)
  const currentEntryId = useSpotiFindStore((s) => s.currentEntryId)
  const showSuccessPulse = useSpotiFindStore((s) => s.showSuccessPulse)
  const liveConfidence = useSpotiFindStore((s) => s.liveConfidence)
  const recognitionMessage = useSpotiFindStore((s) => s.recognitionMessage)
  const savedEntryIds = useSpotiFindStore((s) => s.savedEntryIds)

  const saved =
    currentEntryId != null && savedEntryIds.includes(currentEntryId)

  return {
    recognitionState,
    currentTrack,
    currentEntryId,
    showSuccessPulse,
    saved,
    confidence: liveConfidence ?? undefined,
    recognitionMessage,
  }
}
