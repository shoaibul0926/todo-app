export type Priority = 'low' | 'medium' | 'high'
export type Filter = 'all' | 'active' | 'done'

export interface Task {
  id: string
  title: string
  priority: Priority
  /** ISO date (YYYY-MM-DD) or empty string for no due date. */
  due: string
  done: boolean
  created: number
  doneAt?: number
}

export interface NewTask {
  title: string
  priority: Priority
  due?: string
}

export interface Removed {
  task: Task
  index: number
}
