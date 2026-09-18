import { useEffect, useRef, useState } from 'react'
import { findFocus, toggleFocus } from './domain/focus'
import { addTask, clearCompleted, editTitle, removeTask, restoreCompleted, restoreTask, toggleTask } from './domain/tasks'
import type { Filter, NewTask, Task } from './domain/types'
import { refocusAfterRender } from './dom'
import { newId } from './id'
import type { ToastData } from './components/Toast'
import type { AppData, StorageAdapter } from './storage/adapter'

/** How long a just-ticked task stays put so its strike-through can draw before it moves down. */
const SETTLE_MS = 900

/** How long the undo toast stays on screen. */
const TOAST_MS = 6000

export function useTodos(adapter: StorageAdapter) {
  // A first-time visitor starts with an empty list; every task is one they add themselves.
  const [initial] = useState<AppData>(() => adapter.load() ?? { tasks: [], focusId: null })
  const [tasks, setTasks] = useState<Task[]>(initial.tasks)
  const [rawFocusId, setFocusId] = useState<string | null>(initial.focusId)
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastData | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
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

  const startEdit = (id: string) => setEditingId(id)

  /** Ends editing. A null title cancels; otherwise the task is renamed (blank titles are ignored). */
  const finishEdit = (id: string, title: string | null) => {
    if (title !== null) setTasks((list) => editTitle(list, id, title))
    setEditingId(null)
    refocusAfterRender(`[data-edit="${id}"]`)
  }

  const dismissToast = () => {
    window.clearTimeout(toastTimer.current)
    setToast(null)
  }

  const showToast = (message: string, undo: () => void) => {
    window.clearTimeout(toastTimer.current)
    setToast({ message, undo })
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS)
  }

  const remove = (id: string) => {
    const { tasks: next, removed } = removeTask(tasks, id)
    if (!removed) return
    setTasks(next)
    showToast('Task deleted', () => setTasks((list) => restoreTask(list, removed)))
  }

  const clearDone = () => {
    const { tasks: next, removed } = clearCompleted(tasks)
    if (!removed.length) return
    setTasks(next)
    const n = removed.length
    showToast(`${n} ${n === 1 ? 'task' : 'tasks'} cleared`, () => setTasks((list) => restoreCompleted(list, removed)))
  }

  return {
    tasks,
    focus,
    focusId,
    filter,
    setFilter,
    settling,
    editingId,
    toast,
    add,
    toggle,
    togglePin,
    startEdit,
    finishEdit,
    remove,
    clearDone,
    dismissToast,
  }
}
