import type { Filter, Task } from '../domain/types'
import { emptyState } from '../domain/view'
import { TaskRow } from './TaskRow'
import './TaskList.css'

interface Props {
  tasks: Task[]
  total: number
  filter: Filter
  focusId: string | null
  editingId: string | null
  onToggle: (id: string) => void
  onTogglePin: (id: string) => void
  onStartEdit: (id: string) => void
  onFinishEdit: (id: string, title: string | null) => void
  onRemove: (id: string) => void
}

export function TaskList({ tasks, total, filter, focusId, editingId, ...handlers }: Props) {
  if (!tasks.length) {
    const { title, hint } = emptyState(total, filter)
    return (
      <div className="list-box">
        <ul>
          <li className="empty">
            <strong>{title}</strong>
            {hint}
          </li>
        </ul>
      </div>
    )
  }
  return (
    <div className="list-box">
      <ul>
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} pinned={t.id === focusId} editing={t.id === editingId} {...handlers} />
        ))}
      </ul>
    </div>
  )
}
