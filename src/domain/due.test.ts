import { describe, expect, it } from 'vitest'
import { dueInfo, dueLabel, nextDay, toIsoDate } from './due'

describe('toIsoDate', () => {
  it('uses the local calendar date with zero padding', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('nextDay', () => {
  it('rolls over month and year ends', () => {
    expect(nextDay('2026-01-31')).toBe('2026-02-01')
    expect(nextDay('2026-12-31')).toBe('2027-01-01')
  })
  it('handles leap days', () => {
    expect(nextDay('2028-02-28')).toBe('2028-02-29')
    expect(nextDay('2026-02-28')).toBe('2026-03-01')
  })
})

describe('dueInfo', () => {
  const today = '2026-09-18'
  it('is null without a due date', () => {
    expect(dueInfo('', today)).toBeNull()
  })
  it('classifies dates relative to today', () => {
    expect(dueInfo('2026-09-18', today)?.kind).toBe('today')
    expect(dueInfo('2026-09-19', today)?.kind).toBe('tomorrow')
    expect(dueInfo('2026-09-17', today)?.kind).toBe('overdue')
    expect(dueInfo('2026-10-01', today)?.kind).toBe('upcoming')
  })
})

describe('dueLabel', () => {
  const fmt = (iso: string) => `<${iso}>`
  it('labels each kind', () => {
    expect(dueLabel({ kind: 'today', due: 'x' }, false, fmt)).toBe('Due today')
    expect(dueLabel({ kind: 'tomorrow', due: 'x' }, false, fmt)).toBe('Due tomorrow')
    expect(dueLabel({ kind: 'upcoming', due: 'd' }, false, fmt)).toBe('Due <d>')
    expect(dueLabel({ kind: 'overdue', due: 'd' }, false, fmt)).toBe('Overdue, <d>')
  })
  it('softens overdue once the task is done', () => {
    expect(dueLabel({ kind: 'overdue', due: 'd' }, true, fmt)).toBe('Was due <d>')
  })
})
