import { describe, expect, it } from 'vitest'
import { progress, summaryText, totalText } from './progress'
import type { Task } from './types'

const t = (done: boolean): Task => ({ id: String(Math.random()), title: 'x', priority: 'low', due: '', done, created: 0 })

describe('progress', () => {
  it('handles an empty list', () => {
    expect(progress([])).toEqual({ total: 0, done: 0, left: 0, percent: 0 })
  })
  it('counts and rounds the percentage', () => {
    expect(progress([t(true), t(false), t(false)])).toEqual({ total: 3, done: 1, left: 2, percent: 33 })
  })
})

describe('summaryText', () => {
  it('covers each state', () => {
    expect(summaryText(progress([]))).toBe('Nothing on your list yet.')
    expect(summaryText(progress([t(true)]))).toBe('All done. Nice work.')
    expect(summaryText(progress([t(false), t(true)]))).toBe('1 task left, 1 done')
    expect(summaryText(progress([t(false), t(false)]))).toBe('2 tasks left, 0 done')
  })
})

describe('totalText', () => {
  it('is blank, singular or plural', () => {
    expect(totalText(progress([]))).toBe('')
    expect(totalText(progress([t(false)]))).toBe('1 task in total')
    expect(totalText(progress([t(false), t(false)]))).toBe('2 tasks in total')
  })
})
