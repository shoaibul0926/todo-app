import type { Filter, Task } from '../domain/types'
import { emptyState } from '../domain/view'
import { TaskRow } from './TaskRow'
import './TaskList.css'

interface Props {
  tasks: Task[]
  total: number
  filter: Filter
  onToggle: (id: string) => void
}

export function TaskList({ tasks, total, filter, onToggle }: Props) {
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
          <TaskRow key={t.id} task={t} onToggle={onToggle} />
        ))}
      </ul>
    </div>
  )
}
