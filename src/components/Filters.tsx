import type { Filter } from '../domain/types'
import './Filters.css'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'To do' },
  { value: 'done', label: 'Done' },
]

interface Props {
  filter: Filter
  onChange: (filter: Filter) => void
}

export function Filters({ filter, onChange }: Props) {
  return (
    <div className="filters" role="group" aria-label="Filter tasks">
      {FILTERS.map((f) => (
        <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => onChange(f.value)}>
          {f.label}
        </button>
      ))}
    </div>
  )
}
