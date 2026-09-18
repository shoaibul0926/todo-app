import { AddForm } from './components/AddForm'
import { Filters } from './components/Filters'
import { FocusCard } from './components/FocusCard'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { TaskList } from './components/TaskList'
import { Toast } from './components/Toast'
import { progress } from './domain/progress'
import { visibleTasks } from './domain/view'
import type { StorageAdapter } from './storage/adapter'
import { useTodos } from './useTodos'

export default function App({ adapter }: { adapter: StorageAdapter }) {
  const todos = useTodos(adapter)
  const p = progress(todos.tasks)
  return (
    <>
      <main className="wrap">
        <Header progress={p} />
        <FocusCard task={todos.focus} onToggle={todos.toggle} onUnpin={todos.togglePin} />
        <AddForm onAdd={todos.add} />
        <Filters filter={todos.filter} onChange={todos.setFilter} />
        <TaskList
          tasks={visibleTasks(todos.tasks, todos.filter, todos.settling)}
          total={todos.tasks.length}
          filter={todos.filter}
          focusId={todos.focusId}
          editingId={todos.editingId}
          onToggle={todos.toggle}
          onTogglePin={todos.togglePin}
          onStartEdit={todos.startEdit}
          onFinishEdit={todos.finishEdit}
          onRemove={todos.remove}
        />
        <Footer progress={p} onClearCompleted={todos.clearDone} />
      </main>
      <Toast toast={todos.toast} onDismiss={todos.dismissToast} />
    </>
  )
}
