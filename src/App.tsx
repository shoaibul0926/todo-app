import { AddForm } from './components/AddForm'
import { Header } from './components/Header'
import { TaskList } from './components/TaskList'
import { progress } from './domain/progress'
import { visibleTasks } from './domain/view'
import type { StorageAdapter } from './storage/adapter'
import { useTodos } from './useTodos'

export default function App({ adapter }: { adapter: StorageAdapter }) {
  const { tasks, settling, add, toggle } = useTodos(adapter)
  return (
    <main className="wrap">
      <Header progress={progress(tasks)} />
      <AddForm onAdd={add} />
      <TaskList tasks={visibleTasks(tasks, 'all', settling)} total={tasks.length} filter="all" onToggle={toggle} />
    </main>
  )
}
