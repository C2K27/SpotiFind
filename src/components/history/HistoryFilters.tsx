import { memo, useMemo } from 'react'
import type { HistoryFilter } from '../../types/track'
import { cn } from '../../lib/cn'
import styles from './HistoryFilters.module.css'

interface HistoryFiltersProps {
  active: HistoryFilter
  counts: Record<HistoryFilter, number>
  onChange: (filter: HistoryFilter) => void
}

const FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mic', label: 'Microphone' },
  { id: 'system', label: 'System audio' },
  { id: 'saved', label: 'Saved' },
]

function HistoryFiltersComponent({
  active,
  counts,
  onChange,
}: HistoryFiltersProps) {
  return (
    <div className={styles.filters} role="tablist" aria-label="Filter history">
      {FILTERS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={cn(styles.chip, active === id && styles.active)}
          onClick={() => onChange(id)}
        >
          {label}
          <span className={styles.count}>{counts[id]}</span>
        </button>
      ))}
    </div>
  )
}

export const HistoryFilters = memo(HistoryFiltersComponent)

export function useFilterCounts(
  total: number,
  mic: number,
  system: number,
  saved: number,
): Record<HistoryFilter, number> {
  return useMemo(
    () => ({
      all: total,
      mic,
      system,
      saved,
    }),
    [total, mic, system, saved],
  )
}
