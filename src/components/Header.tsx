import { summaryText } from '../domain/progress'
import type { Progress } from '../domain/progress'
import './Header.css'

export function Header({ progress }: { progress: Progress }) {
  const now = new Date()
  return (
    <header>
      <h1>{now.toLocaleDateString(undefined, { weekday: 'long' })}</h1>
      <p className="date">{now.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <div className="progress">
        <p aria-live="polite">{summaryText(progress)}</p>
        <div className="track" aria-hidden="true">
          <div className="fill" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>
    </header>
  )
}
