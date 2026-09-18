import type { Progress } from '../domain/progress'
import { totalText } from '../domain/progress'
import './Footer.css'

interface Props {
  progress: Progress
  onClearCompleted: () => void
}

export function Footer({ progress, onClearCompleted }: Props) {
  return (
    <div className="foot">
      <span>{totalText(progress)}</span>
      <button type="button" className="link-btn" disabled={progress.done === 0} onClick={onClearCompleted}>
        Clear completed
      </button>
    </div>
  )
}
