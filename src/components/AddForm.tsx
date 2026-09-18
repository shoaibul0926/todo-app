import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { toIsoDate } from '../domain/due'
import { MAX_TITLE_LENGTH } from '../domain/tasks'
import type { NewTask, Priority } from '../domain/types'
import './AddForm.css'

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function AddForm({ onAdd }: { onAdd: (task: NewTask) => void }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [due, setDue] = useState('')
  const [hint, setHint] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setHint('Type a task first.')
      titleRef.current?.focus()
      return
    }
    onAdd({ title, priority, due })
    setTitle('')
    setDue('')
    setPriority('medium')
    setHint('')
    titleRef.current?.focus()
  }

  return (
    <form className="add" autoComplete="off" noValidate onSubmit={submit}>
      <label htmlFor="newTitle" className="sr">
        New task
      </label>
      <input
        ref={titleRef}
        type="text"
        id="newTitle"
        placeholder="Add a task"
        maxLength={MAX_TITLE_LENGTH}
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          setHint('')
        }}
      />
      <div className="options">
        <fieldset>
          <legend className="sr">Priority</legend>
          <div className="seg">
            {PRIORITIES.map((p) => (
              <label key={p.value}>
                <input
                  type="radio"
                  name="priority"
                  value={p.value}
                  checked={priority === p.value}
                  onChange={() => setPriority(p.value)}
                />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label htmlFor="newDue" className="sr">
          Due date
        </label>
        <input
          type="date"
          id="newDue"
          className="date-input"
          min={toIsoDate(new Date())}
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
        <button type="submit" className="btn btn-add">
          Add task
        </button>
      </div>
      <p className="hint" role="status">
        {hint}
      </p>
    </form>
  )
}
