import { describe, expect, it } from 'vitest'
import {
  addTask, clearCompleted, editTitle, removeTask, restoreCompleted, restoreTask, toggleTask,
} from './tasks'
import type { Task } from './types'

const task = (id: string, over: Partial<Task> = {}): Task => ({
  id, title: id, priority: 'medium', due: '', done: false, created: 0, ...over,
})

describe('addTask', () => {
  it('puts the new task first with trimmed title and defaults', () => {
    const out = addTask([task('a')], { title: '  Buy milk ', priority: 'high' }, 'b', 5)
    expect(out.map((t) => t.id)).toEqual(['b', 'a'])
    expect(out[0]).toEqual({ id: 'b', title: 'Buy milk', priority: 'high', due: '', done: false, created: 5 })
  })
  it('ignores blank titles', () => {
    const list = [task('a')]
    expect(addTask(list, { title: '   ', priority: 'low' }, 'b', 1)).toBe(list)
  })
  it('caps title length at 200', () => {
    const out = addTask([], { title: 'x'.repeat(300), priority: 'low' }, 'a', 1)
    expect(out[0].title).toHaveLength(200)
  })
  it('does not mutate the input', () => {
    const list = [task('a')]
    addTask(list, { title: 'x', priority: 'low' }, 'b', 1)
    expect(list).toHaveLength(1)
  })
})

describe('toggleTask', () => {
  it('marks done and records when', () => {
    const [t] = toggleTask([task('a')], 'a', 99)
    expect(t.done).toBe(true)
    expect(t.doneAt).toBe(99)
  })
  it('clears doneAt when un-ticked', () => {
    const [t] = toggleTask([task('a', { done: true, doneAt: 5 })], 'a', 99)
    expect(t.done).toBe(false)
    expect('doneAt' in t).toBe(false)
  })
  it('leaves other tasks alone', () => {
    const out = toggleTask([task('a'), task('b')], 'a', 1)
    expect(out[1].done).toBe(false)
  })
})

describe('editTitle', () => {
  it('renames with trimming', () => {
    expect(editTitle([task('a')], 'a', '  new ')[0].title).toBe('new')
  })
  it('keeps the old title when blank', () => {
    const list = [task('a')]
    expect(editTitle(list, 'a', '  ')).toBe(list)
  })
})

describe('removeTask / restoreTask', () => {
  it('removes and reports the old position', () => {
    const { tasks, removed } = removeTask([task('a'), task('b'), task('c')], 'b')
    expect(tasks.map((t) => t.id)).toEqual(['a', 'c'])
    expect(removed?.index).toBe(1)
  })
  it('returns null for an unknown id', () => {
    const list = [task('a')]
    const out = removeTask(list, 'zzz')
    expect(out.tasks).toBe(list)
    expect(out.removed).toBeNull()
  })
  it('restores to the original position', () => {
    const { tasks, removed } = removeTask([task('a'), task('b'), task('c')], 'b')
    expect(restoreTask(tasks, removed!).map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })
  it('clamps the position if the list got shorter', () => {
    const removed = { task: task('z'), index: 10 }
    expect(restoreTask([task('a')], removed).map((t) => t.id)).toEqual(['a', 'z'])
  })
})

describe('clearCompleted / restoreCompleted', () => {
  it('splits done from open', () => {
    const { tasks, removed } = clearCompleted([task('a'), task('b', { done: true }), task('c')])
    expect(tasks.map((t) => t.id)).toEqual(['a', 'c'])
    expect(removed.map((t) => t.id)).toEqual(['b'])
  })
  it('restores the cleared tasks', () => {
    const { tasks, removed } = clearCompleted([task('a'), task('b', { done: true })])
    expect(restoreCompleted(tasks, removed).map((t) => t.id).sort()).toEqual(['a', 'b'])
  })
})
