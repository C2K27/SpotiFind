import type {
  HistoryEntry,
  HistoryFilter,
  StoredHistoryEntry,
} from '../types/track'

export function toStoredEntry(entry: HistoryEntry): StoredHistoryEntry {
  return {
    ...entry,
    recognizedAt: entry.recognizedAt.toISOString(),
  }
}

export function fromStoredEntry(stored: StoredHistoryEntry): HistoryEntry {
  return {
    ...stored,
    recognizedAt: new Date(stored.recognizedAt),
  }
}

export function filterHistory(
  entries: HistoryEntry[],
  filter: HistoryFilter,
  savedIds: string[],
): HistoryEntry[] {
  switch (filter) {
    case 'mic':
      return entries.filter((e) => e.source === 'mic')
    case 'system':
      return entries.filter((e) => e.source === 'system')
    case 'saved':
      return entries.filter((e) => savedIds.includes(e.id))
    default:
      return entries
  }
}
