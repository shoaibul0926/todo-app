import type { Progress } from '../domain/progress'
import { totalText } from '../domain/progress'
import './Footer.css'

export function Footer({ progress }: { progress: Progress }) {
  return (
    <div className="foot">
      <span>{totalText(progress)}</span>
    </div>
  )
}
