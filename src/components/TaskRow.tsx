import { dueInfo, dueLabel, toIsoDate } from '../domain/due'
import type { Task } from '../domain/types'
import { formatShortDate } from '../format'
import { IconButton } from './IconButton'
import { PinIcon } from './icons'

interface Props {
  task: Task
  pinned: boolean
  onToggle: (id: string) => void
  onTogglePin: (id: string) => void
}

export function TaskRow({ task, pinned, onToggle, onTogglePin }: Props) {
  const due = dueInfo(task.due, toIsoDate(new Date()))
  const priority = task.priority.charAt(0).toUpperCase() + task.priority.slice(1)

  return (
    <li className={`row p-${task.priority}${task.done ? ' done' : ''}`}>
      <input
        type="checkbox"
        checked={task.done}
        data-cb={task.id}
        aria-label={`${task.done ? 'Mark not done' : 'Mark done'}: ${task.title}`}
        onChange={() => onToggle(task.id)}
      />
      <div className="body">
        <div className="title">
          <span className="t">{task.title}</span>
        </div>
        <div className="meta">
          <span>
            <span className="dot" />
            {priority}
          </span>
          {due && (
            <span className={due.kind === 'overdue' && !task.done ? 'overdue' : ''}>
              {dueLabel(due, task.done, formatShortDate)}
            </span>
          )}
          {pinned && <span className="chip-focus">Focus</span>}
        </div>
      </div>
      <div className="actions">
        <IconButton label={pinned ? 'Unpin from Focus' : 'Pin to Focus'} on={pinned} onClick={() => onTogglePin(task.id)}>
          <PinIcon />
        </IconButton>
      </div>
    </li>
  )
}
