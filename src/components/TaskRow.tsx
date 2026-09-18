import { useEffect, useRef } from 'react'
import { dueInfo, dueLabel, toIsoDate } from '../domain/due'
import { MAX_TITLE_LENGTH } from '../domain/tasks'
import type { Task } from '../domain/types'
import { formatShortDate } from '../format'
import { IconButton } from './IconButton'
import { EditIcon, PinIcon } from './icons'

interface Props {
  task: Task
  pinned: boolean
  editing: boolean
  onToggle: (id: string) => void
  onTogglePin: (id: string) => void
  onStartEdit: (id: string) => void
  onFinishEdit: (id: string, title: string | null) => void
}

function EditInput({ initial, onFinish }: { initial: string; onFinish: (title: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const finished = useRef(false)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  // Enter, Escape and blur can all fire for one edit; only the first counts.
  const finish = (save: boolean) => {
    if (finished.current) return
    finished.current = true
    onFinish(save ? (ref.current?.value ?? initial) : null)
  }

  return (
    <input
      ref={ref}
      type="text"
      className="edit-input"
      aria-label="Edit task"
      defaultValue={initial}
      maxLength={MAX_TITLE_LENGTH}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          finish(true)
        } else if (e.key === 'Escape') {
          e.preventDefault()
          finish(false)
        }
      }}
      onBlur={() => finish(true)}
    />
  )
}

export function TaskRow({ task, pinned, editing, onToggle, onTogglePin, onStartEdit, onFinishEdit }: Props) {
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
        {editing ? (
          <EditInput initial={task.title} onFinish={(title) => onFinishEdit(task.id, title)} />
        ) : (
          <div className="title" onDoubleClick={() => onStartEdit(task.id)}>
            <span className="t">{task.title}</span>
          </div>
        )}
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
        <IconButton label="Edit task" data-edit={task.id} onClick={() => onStartEdit(task.id)}>
          <EditIcon />
        </IconButton>
      </div>
    </li>
  )
}
