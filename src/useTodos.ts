import { useEffect, useState } from 'react'
import { toIsoDate } from './domain/due'
import { findFocus, toggleFocus } from './domain/focus'
import { seedData } from './domain/seed'
import { addTask, toggleTask } from './domain/tasks'
import type { Filter, NewTask, Task } from './domain/types'
import { refocusAfterRender } from './dom'
import { newId } from './id'
import type { StorageAdapter } from './storage/adapter'

/** How long a just-ticked task stays put so its strike-through can draw before it moves down. */
const SETTLE_MS = 900

export function useTodos(adapter: StorageAdapter) {
  const [initial] = useState(
    () => adapter.load() ?? seedData(Date.now(), toIsoDate(new Date()), [newId(), newId(), newId()]),
  )
  const [tasks, setTasks] = useState<Task[]>(initial.tasks)
  const [rawFocusId, setFocusId] = useState<string | null>(initial.focusId)
  const [filter, setFilter] = useState<Filter>('all')
  const [settling, setSettling] = useState<ReadonlySet<string>>(new Set())

  const focus = findFocus(tasks, rawFocusId)
  const focusId = focus?.id ?? null

  useEffect(() => {
    adapter.save({ tasks, focusId })
  }, [adapter, tasks, focusId])

  const stopSettling = (id: string) =>
    setSettling((s) => {
      const next = new Set(s)
      next.delete(id)
      return next
    })

  const add = (input: NewTask) => setTasks((list) => addTask(list, input, newId(), Date.now()))

  const toggle = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    setTasks((list) => toggleTask(list, id, Date.now()))
    if (task.done) {
      stopSettling(id)
      return
    }
    setSettling((s) => new Set(s).add(id))
    setTimeout(() => {
      const keepFocus = document.activeElement?.getAttribute('data-cb') === id
      stopSettling(id)
      if (keepFocus) refocusAfterRender(`[data-cb="${id}"]`)
    }, SETTLE_MS)
  }

  const togglePin = (id: string) => setFocusId(toggleFocus(focusId, id))

  return { tasks, focus, focusId, togglePin, filter, setFilter, settling, add, toggle }
}
