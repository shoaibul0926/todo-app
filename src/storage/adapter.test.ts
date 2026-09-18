import { describe, expect, it } from 'vitest'
import { createLocalStorageAdapter, createMemoryAdapter, parseAppData, STORAGE_KEY } from './adapter'
import type { AppData } from './adapter'

function fakeStorage(initial: Record<string, string> = {}): Storage {
  const m = new Map(Object.entries(initial))
  return {
    get length() {
      return m.size
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  }
}

const sample: AppData = {
  tasks: [
    { id: 'a', title: 'A', priority: 'high', due: '2026-09-18', done: true, created: 1, doneAt: 2 },
    { id: 'b', title: 'B', priority: 'low', due: '', done: false, created: 3 },
  ],
  focusId: 'b',
}

describe('createLocalStorageAdapter', () => {
  it('round-trips data under the prototype key', () => {
    const storage = fakeStorage()
    const adapter = createLocalStorageAdapter(() => storage)
    adapter.save(sample)
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(adapter.load()).toEqual(sample)
  })

  it('returns null when nothing is stored', () => {
    expect(createLocalStorageAdapter(() => fakeStorage()).load()).toBeNull()
  })

  it('returns null for corrupt JSON', () => {
    const adapter = createLocalStorageAdapter(() => fakeStorage({ [STORAGE_KEY]: '{nope' }))
    expect(adapter.load()).toBeNull()
  })

  it('reads data written by the prototype', () => {
    const legacy = JSON.stringify({ tasks: sample.tasks, focusId: 'a' })
    const adapter = createLocalStorageAdapter(() => fakeStorage({ [STORAGE_KEY]: legacy }))
    expect(adapter.load()?.tasks).toHaveLength(2)
  })

  it('never throws when storage is unavailable', () => {
    const adapter = createLocalStorageAdapter(() => {
      throw new Error('blocked')
    })
    expect(adapter.load()).toBeNull()
    expect(() => adapter.save(sample)).not.toThrow()
  })

  it('never throws when the quota is exceeded', () => {
    const storage = fakeStorage()
    storage.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    expect(() => createLocalStorageAdapter(() => storage).save(sample)).not.toThrow()
  })
})

describe('parseAppData', () => {
  it('rejects non-objects and missing task arrays', () => {
    expect(parseAppData(null)).toBeNull()
    expect(parseAppData('x')).toBeNull()
    expect(parseAppData({})).toBeNull()
    expect(parseAppData({ tasks: 'nope' })).toBeNull()
  })

  it('drops malformed tasks and keeps valid ones', () => {
    const out = parseAppData({ tasks: [null, 5, { id: 'a' }, { id: '', title: 'x' }, { id: 'ok', title: 'Fine' }] })
    expect(out?.tasks.map((t) => t.id)).toEqual(['ok'])
  })

  it('fills defaults for missing or invalid fields', () => {
    const out = parseAppData({ tasks: [{ id: 'a', title: 'A', priority: 'urgent', due: 5, done: 'yes', created: 'x' }] })
    expect(out?.tasks[0]).toEqual({ id: 'a', title: 'A', priority: 'medium', due: '', done: false, created: 0 })
  })

  it('clears a focusId that points at no task', () => {
    expect(parseAppData({ tasks: [{ id: 'a', title: 'A' }], focusId: 'gone' })?.focusId).toBeNull()
    expect(parseAppData({ tasks: [{ id: 'a', title: 'A' }], focusId: 'a' })?.focusId).toBe('a')
  })
})

describe('createMemoryAdapter', () => {
  it('starts empty, then returns what was saved', () => {
    const adapter = createMemoryAdapter()
    expect(adapter.load()).toBeNull()
    adapter.save(sample)
    expect(adapter.load()).toEqual(sample)
  })
})
