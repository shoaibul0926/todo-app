import type { Task } from './types'

/** The starter tasks a first-time user sees. `ids` supplies one id per task. */
export function seedData(now: number, today: string, ids: [string, string, string]): { tasks: Task[]; focusId: string } {
  const tasks: Task[] = [
    { id: ids[0], title: 'Tick this one off to see it struck through', priority: 'high', due: today, done: false, created: now + 2 },
    { id: ids[1], title: 'Set a priority and due date when you add a task', priority: 'low', due: '', done: false, created: now + 1 },
    { id: ids[2], title: 'Pin a task to Focus with the pin icon', priority: 'medium', due: '', done: false, created: now },
  ]
  return { tasks, focusId: ids[2] }
}
