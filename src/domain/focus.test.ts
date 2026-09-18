import { describe, expect, it } from 'vitest'
import { findFocus, toggleFocus } from './focus'
import type { Task } from './types'

const t = (id: string): Task => ({ id, title: id, priority: 'low', due: '', done: false, created: 0 })

describe('toggleFocus', () => {
  it('pins, switches and unpins', () => {
    expect(toggleFocus(null, 'a')).toBe('a')
    expect(toggleFocus('a', 'b')).toBe('b')
    expect(toggleFocus('a', 'a')).toBeNull()
  })
})

describe('findFocus', () => {
  it('returns the pinned task', () => {
    expect(findFocus([t('a'), t('b')], 'b')?.id).toBe('b')
  })
  it('returns null when unpinned or the task is gone', () => {
    expect(findFocus([t('a')], null)).toBeNull()
    expect(findFocus([t('a')], 'zzz')).toBeNull()
  })
})
