import { describe, expect, it } from 'vitest'
import { seedData } from './seed'

describe('seedData', () => {
  const { tasks, focusId } = seedData(100, '2026-09-18', ['a', 'b', 'c'])

  it('creates three open tasks with the given ids', () => {
    expect(tasks.map((t) => t.id)).toEqual(['a', 'b', 'c'])
    expect(tasks.every((t) => !t.done)).toBe(true)
  })

  it('makes the first task due today', () => {
    expect(tasks[0].due).toBe('2026-09-18')
  })

  it('pins the last task and lists newest first', () => {
    expect(focusId).toBe('c')
    expect(tasks.map((t) => t.created)).toEqual([102, 101, 100])
  })
})
