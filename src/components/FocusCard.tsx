import type { Task } from '../domain/types'
import './FocusCard.css'

interface Props {
  task: Task | null
  onToggle: (id: string) => void
  onUnpin: (id: string) => void
}

export function FocusCard({ task, onToggle, onUnpin }: Props) {
  return (
    <section className="focus" aria-labelledby="focusHeading">
      <h2 id="focusHeading">Focus</h2>
      {task ? (
        <>
          <p className={`focus-title${task.done ? ' done' : ''}`}>
            <span className="t">{task.title}</span>
          </p>
          {task.done && <p className="focus-note">Done. Pin your next focus from the list.</p>}
          <div className="focus-actions">
            <button type="button" className="btn btn-dark" onClick={() => onToggle(task.id)}>
              {task.done ? 'Mark not done' : 'Mark done'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onUnpin(task.id)}>
              Unpin
            </button>
          </div>
        </>
      ) : (
        <p className="focus-empty">Choose the one task that matters most. Tap the pin on any task to put it here.</p>
      )}
    </section>
  )
}
