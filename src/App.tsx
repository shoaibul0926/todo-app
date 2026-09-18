import { Header } from './components/Header'
import { progress } from './domain/progress'
import type { StorageAdapter } from './storage/adapter'
import { useTodos } from './useTodos'

export default function App({ adapter }: { adapter: StorageAdapter }) {
  const { tasks } = useTodos(adapter)
  return (
    <main className="wrap">
      <Header progress={progress(tasks)} />
    </main>
  )
}
