import type { NewTask, Removed, Task } from './types'

export const MAX_TITLE_LENGTH = 200

/** Adds a task to the top of the list. Blank titles are ignored. */
export function addTask(tasks: Task[], input: NewTask, id: string, now: number): Task[] {
  const title = input.title.trim().slice(0, MAX_TITLE_LENGTH)
  if (!title) return tasks
  const task: Task = {
    id,
    title,
    priority: input.priority,
    due: input.due ?? '',
    done: false,
    created: now,
  }
  return [task, ...tasks]
}

export function toggleTask(tasks: Task[], id: string, now: number): Task[] {
  return tasks.map((t) => {
    if (t.id !== id) return t
    if (t.done) {
      const { doneAt: _doneAt, ...rest } = t
      return { ...rest, done: false }
    }
    return { ...t, done: true, doneAt: now }
  })
}

/** Renames a task. A blank title leaves the task unchanged. */
export function editTitle(tasks: Task[], id: string, title: string): Task[] {
  const next = title.trim().slice(0, MAX_TITLE_LENGTH)
  if (!next) return tasks
  return tasks.map((t) => (t.id === id ? { ...t, title: next } : t))
}

export function removeTask(tasks: Task[], id: string): { tasks: Task[]; removed: Removed | null } {
  const index = tasks.findIndex((t) => t.id === id)
  if (index < 0) return { tasks, removed: null }
  return {
    tasks: [...tasks.slice(0, index), ...tasks.slice(index + 1)],
    removed: { task: tasks[index], index },
  }
}

/** Undo for removeTask: puts the task back at (or as near as possible to) its old position. */
export function restoreTask(tasks: Task[], removed: Removed): Task[] {
  const at = Math.min(removed.index, tasks.length)
  return [...tasks.slice(0, at), removed.task, ...tasks.slice(at)]
}

export function clearCompleted(tasks: Task[]): { tasks: Task[]; removed: Task[] } {
  return {
    tasks: tasks.filter((t) => !t.done),
    removed: tasks.filter((t) => t.done),
  }
}

/** Undo for clearCompleted. */
export function restoreCompleted(tasks: Task[], removed: Task[]): Task[] {
  return [...tasks, ...removed]
}
