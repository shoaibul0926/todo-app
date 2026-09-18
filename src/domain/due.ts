export type DueKind = 'today' | 'tomorrow' | 'overdue' | 'upcoming'

export interface DueInfo {
  kind: DueKind
  due: string
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Local calendar date as YYYY-MM-DD. */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** The ISO date after `iso`. Uses UTC arithmetic so DST never shifts the result. */
export function nextDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`
}

/** How a due date relates to `today` (both ISO dates). Null when there is no due date. */
export function dueInfo(due: string, today: string): DueInfo | null {
  if (!due) return null
  if (due === today) return { kind: 'today', due }
  if (due === nextDay(today)) return { kind: 'tomorrow', due }
  if (due < today) return { kind: 'overdue', due }
  return { kind: 'upcoming', due }
}

/** Text for a due date. `formatDate` turns an ISO date into a short display date (e.g. "3 Mar"). */
export function dueLabel(info: DueInfo, done: boolean, formatDate: (iso: string) => string): string {
  switch (info.kind) {
    case 'today':
      return 'Due today'
    case 'tomorrow':
      return 'Due tomorrow'
    case 'overdue':
      return `${done ? 'Was due' : 'Overdue,'} ${formatDate(info.due)}`
    case 'upcoming':
      return `Due ${formatDate(info.due)}`
  }
}
