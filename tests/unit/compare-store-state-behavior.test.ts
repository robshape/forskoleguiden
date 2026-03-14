import { afterEach, describe, expect, it, vi } from 'vitest'

type CompareStateModule = typeof import('../../src/lib/state')

const importCompareState = async () => {
  vi.resetModules()

  return (await import('../../src/lib/state')) as CompareStateModule
}

const getCompareStorageKey = async () => {
  clearBrowserGlobals()

  const { COMPARE_STORAGE_KEY } = await importCompareState()

  return COMPARE_STORAGE_KEY
}

const clearBrowserGlobals = () => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(globalThis, 'window')
  Reflect.deleteProperty(globalThis, 'sessionStorage')
}

const createSessionStorage = (
  initialEntries: Record<string, string> = {},
): Storage => {
  const store = new Map(Object.entries(initialEntries))

  return {
    get length() {
      return store.size
    },
    clear() {
      store.clear()
    },
    getItem(key) {
      return store.has(key) ? (store.get(key) ?? null) : null
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null
    },
    removeItem(key) {
      store.delete(key)
    },
    setItem(key, value) {
      store.set(key, value)
    },
  }
}

const stubBrowserStorage = (
  initialEntries: Record<string, string> = {},
): Storage => {
  const sessionStorage = createSessionStorage(initialEntries)

  vi.stubGlobal('sessionStorage', sessionStorage)
  vi.stubGlobal('window', { sessionStorage })

  return sessionStorage
}

afterEach(() => {
  clearBrowserGlobals()
  vi.resetModules()
})

describe('compare store state behavior', () => {
  it('should stay SSR-safe without browser globals and handle default, toggle, clear, and max-cap behavior', async () => {
    clearBrowserGlobals()

    const { MAX_COMPARE, compareIds, toggleCompare, clearCompare } =
      await importCompareState()

    expect(MAX_COMPARE).toBe(5)
    expect(compareIds.get()).toEqual([])

    toggleCompare('alpha')
    expect(compareIds.get()).toEqual(['alpha'])

    toggleCompare('alpha')
    expect(compareIds.get()).toEqual([])

    toggleCompare('alpha')
    toggleCompare('beta')
    toggleCompare('gamma')
    toggleCompare('delta')
    toggleCompare('epsilon')
    toggleCompare('zeta')

    expect(compareIds.get()).toEqual([
      'alpha',
      'beta',
      'gamma',
      'delta',
      'epsilon',
    ])

    clearCompare()
    expect(compareIds.get()).toEqual([])
  })

  it('should only write persisted state after toggle and clear mutations, and hydrate from existing storage on import', async () => {
    const compareStorageKey = await getCompareStorageKey()

    const sessionStorage = stubBrowserStorage()

    let { compareIds, toggleCompare, clearCompare } = await importCompareState()

    expect(sessionStorage.getItem(compareStorageKey)).toBeNull()

    toggleCompare('alpha')
    expect(compareIds.get()).toEqual(['alpha'])
    expect(sessionStorage.getItem(compareStorageKey)).toBe(
      JSON.stringify(['alpha']),
    )

    clearCompare()
    expect(compareIds.get()).toEqual([])
    expect(sessionStorage.getItem(compareStorageKey)).toBe(JSON.stringify([]))

    clearBrowserGlobals()

    stubBrowserStorage({
      [compareStorageKey]: JSON.stringify(['alpha', 'beta']),
    })
    ;({ compareIds } = await importCompareState())

    expect(compareIds.get()).toEqual(['alpha', 'beta'])
  })

  it('should fall back to empty compare IDs when persisted storage is invalid JSON or a non-array JSON value', async () => {
    const compareStorageKey = await getCompareStorageKey()

    stubBrowserStorage({
      [compareStorageKey]: '{not-json',
    })

    let { compareIds } = await importCompareState()

    expect(compareIds.get()).toEqual([])

    clearBrowserGlobals()

    stubBrowserStorage({
      [compareStorageKey]: JSON.stringify({ ids: ['alpha', 'beta'] }),
    })
    ;({ compareIds } = await importCompareState())

    expect(compareIds.get()).toEqual([])
  })
})
