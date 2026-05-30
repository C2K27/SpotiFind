import type { StoredHistoryEntry } from '../types/track'
import { MOCK_TRACKS } from './mockTracks'

function daysAgo(days: number, hours = 14, minutes = 22): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hours, minutes, 0, 0)
  return d.toISOString()
}

export const INITIAL_STORED_HISTORY: StoredHistoryEntry[] = [
  {
    id: 'hist_01',
    track: MOCK_TRACKS[0]!,
    recognizedAt: daysAgo(0, 9, 41),
    confidence: 0.97,
    source: 'mic',
  },
  {
    id: 'hist_02',
    track: MOCK_TRACKS[4]!,
    recognizedAt: daysAgo(0, 8, 12),
    confidence: 0.94,
    source: 'system',
  },
  {
    id: 'hist_03',
    track: MOCK_TRACKS[6]!,
    recognizedAt: daysAgo(1, 22, 8),
    confidence: 0.91,
    source: 'mic',
  },
  {
    id: 'hist_04',
    track: MOCK_TRACKS[2]!,
    recognizedAt: daysAgo(2, 18, 55),
    confidence: 0.89,
    source: 'system',
  },
  {
    id: 'hist_05',
    track: MOCK_TRACKS[5]!,
    recognizedAt: daysAgo(4, 11, 3),
    confidence: 0.96,
    source: 'mic',
  },
]

export const INITIAL_SAVED_IDS = ['hist_01', 'hist_03', 'hist_05']
