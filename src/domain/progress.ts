import type { Task } from './types'

export interface Progress {
  total: number
  done: number
  left: number
  percent: number
}

export function progress(tasks: Task[]): Progress {
  const total = tasks.length
  const done = tasks.filter((t) => t.done).length
  return { total, done, left: total - done, percent: total ? Math.round((done / total) * 100) : 0 }
}

export function summaryText({ total, done, left }: Progress): string {
  if (!total) return 'Nothing on your list yet.'
  if (!left) return 'All done. Nice work.'
  return `${left} ${left === 1 ? 'task' : 'tasks'} left, ${done} done`
}

export function totalText({ total }: Progress): string {
  if (!total) return ''
  return `${total} ${total === 1 ? 'task' : 'tasks'} in total`
}
