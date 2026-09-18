import { useEffect, useState } from 'react'
import { toIsoDate } from './domain/due'
import { seedData } from './domain/seed'
import type { Task } from './domain/types'
import { newId } from './id'
import type { StorageAdapter } from './storage/adapter'

export function useTodos(adapter: StorageAdapter) {
  const [initial] = useState(
    () => adapter.load() ?? seedData(Date.now(), toIsoDate(new Date()), [newId(), newId(), newId()]),
  )
  const [tasks] = useState<Task[]>(initial.tasks)
  const [focusId] = useState<string | null>(initial.focusId)

  useEffect(() => {
    adapter.save({ tasks, focusId })
  }, [adapter, tasks, focusId])

  return { tasks, focusId }
}
