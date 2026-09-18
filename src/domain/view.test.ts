import { describe, expect, it } from 'vitest'
import { emptyState, visibleTasks } from './view'
import type { Task } from './types'

const task = (id: string, over: Partial<Task> = {}): Task => ({
  id, title: id, priority: 'medium', due: '', done: false, created: 0, ...over,
})

const ids = (l: Task[]) => l.map((t) => t.id)

describe('visibleTasks', () => {
  const list = [
    task('old', { created: 1 }),
    task('new', { created: 3 }),
    task('d1', { done: true, doneAt: 10, created: 2 }),
    task('d2', { done: true, doneAt: 20, created: 0 }),
  ]

  it('all: open newest first, then done most recently finished first', () => {
    expect(ids(visibleTasks(list, 'all'))).toEqual(['new', 'old', 'd2', 'd1'])
  })
  it('active: only open tasks', () => {
    expect(ids(visibleTasks(list, 'active'))).toEqual(['new', 'old'])
  })
  it('done: only finished tasks', () => {
    expect(ids(visibleTasks(list, 'done'))).toEqual(['d2', 'd1'])
  })
  it('settling tasks stay in the open group and the active filter', () => {
    const settling = new Set(['d2'])
    expect(ids(visibleTasks(list, 'active', settling))).toEqual(['new', 'old', 'd2'])
    expect(ids(visibleTasks(list, 'all', settling))).toEqual(['new', 'old', 'd2', 'd1'])
  })
  it('does not mutate the input order', () => {
    const copy = [...list]
    visibleTasks(list, 'all')
    expect(list).toEqual(copy)
  })
})

describe('emptyState', () => {
  it('prompts for a first task when the list is empty', () => {
    expect(emptyState(0, 'all').title).toBe('Your list is empty')
    expect(emptyState(0, 'done').title).toBe('Your list is empty')
  })
  it('explains an empty Done filter', () => {
    expect(emptyState(3, 'done').title).toBe('Nothing finished yet')
  })
  it('says nothing is left otherwise', () => {
    expect(emptyState(3, 'active').title).toBe('Nothing left to do')
    expect(emptyState(3, 'all').title).toBe('Nothing left to do')
  })
})
