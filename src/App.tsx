import { AddForm } from './components/AddForm'
import { Filters } from './components/Filters'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { TaskList } from './components/TaskList'
import { progress } from './domain/progress'
import { visibleTasks } from './domain/view'
import type { StorageAdapter } from './storage/adapter'
import { useTodos } from './useTodos'

export default function App({ adapter }: { adapter: StorageAdapter }) {
  const { tasks, filter, setFilter, settling, add, toggle } = useTodos(adapter)
  const p = progress(tasks)
  return (
    <main className="wrap">
      <Header progress={p} />
      <AddForm onAdd={add} />
      <Filters filter={filter} onChange={setFilter} />
      <TaskList tasks={visibleTasks(tasks, filter, settling)} total={tasks.length} filter={filter} onToggle={toggle} />
      <Footer progress={p} />
    </main>
  )
}
