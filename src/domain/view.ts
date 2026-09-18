import type { Filter, Task } from './types'

/**
 * Tasks to show for a filter. Open tasks come first (newest first), then finished
 * ones (most recently finished first). `settling` holds ids that were just ticked:
 * they still count as open so the strike-through can play before they move down.
 */
export function visibleTasks(tasks: Task[], filter: Filter, settling: ReadonlySet<string> = new Set()): Task[] {
  const isOpen = (t: Task) => !t.done || settling.has(t.id)
  const shown = tasks.filter((t) => {
    if (filter === 'active') return isOpen(t)
    if (filter === 'done') return t.done
    return true
  })
  const open = shown.filter(isOpen).sort((a, b) => b.created - a.created)
  const closed = shown.filter((t) => !isOpen(t)).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0))
  return [...open, ...closed]
}
