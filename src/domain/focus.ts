import type { Task } from './types'

/** Pinning the already-pinned task unpins it. */
export function toggleFocus(focusId: string | null, id: string): string | null {
  return focusId === id ? null : id
}

/** The focused task, or null if nothing is pinned or the task no longer exists. */
export function findFocus(tasks: Task[], focusId: string | null): Task | null {
  if (!focusId) return null
  return tasks.find((t) => t.id === focusId) ?? null
}
