import type { Priority, Task } from '../domain/types'

export interface AppData {
  tasks: Task[]
  focusId: string | null
}

/** The only way the app reads or writes persisted data. Components never touch localStorage. */
export interface StorageAdapter {
  /** Saved data, or null when nothing usable is stored. Never throws. */
  load(): AppData | null
  /** Persists data. Never throws; storage failures are swallowed so the app keeps working. */
  save(data: AppData): void
}

/** Same key as docs/prototype.html, so tasks saved by the prototype carry over. */
export const STORAGE_KEY = 'today-todo-v1'

const PRIORITIES: readonly Priority[] = ['low', 'medium', 'high']

function toTask(raw: unknown): Task | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== 'string' || !r.id) return null
  if (typeof r.title !== 'string' || !r.title.trim()) return null
  const task: Task = {
    id: r.id,
    title: r.title,
    priority: PRIORITIES.includes(r.priority as Priority) ? (r.priority as Priority) : 'medium',
    due: typeof r.due === 'string' ? r.due : '',
    done: r.done === true,
    created: typeof r.created === 'number' ? r.created : 0,
  }
  if (typeof r.doneAt === 'number') task.doneAt = r.doneAt
  return task
}

/** Turns untrusted parsed JSON into AppData, dropping anything malformed. */
export function parseAppData(value: unknown): AppData | null {
  if (typeof value !== 'object' || value === null) return null
  const v = value as Record<string, unknown>
  if (!Array.isArray(v.tasks)) return null
  const tasks = v.tasks.map(toTask).filter((t): t is Task => t !== null)
  const focusId = typeof v.focusId === 'string' && tasks.some((t) => t.id === v.focusId) ? v.focusId : null
  return { tasks, focusId }
}

/** Storage adapter backed by a Web Storage object (localStorage by default). */
export function createLocalStorageAdapter(getStorage: () => Storage = () => localStorage): StorageAdapter {
  return {
    load() {
      try {
        const raw = getStorage().getItem(STORAGE_KEY)
        return raw ? parseAppData(JSON.parse(raw)) : null
      } catch {
        return null
      }
    },
    save(data) {
      try {
        getStorage().setItem(STORAGE_KEY, JSON.stringify(data))
      } catch {
        // Storage can be full, blocked or unavailable (private mode). Keep going without it.
      }
    },
  }
}

/** In-memory adapter for tests and as a fallback when nothing better is available. */
export function createMemoryAdapter(initial: AppData | null = null): StorageAdapter {
  let data = initial
  return {
    load: () => data,
    save: (next) => {
      data = next
    },
  }
}
