import { atom, readonlyType } from 'nanostores'
import type { ReadableAtom } from 'nanostores'

export const COMPARE_STORAGE_KEY = 'compareIds'

export const MAX_COMPARE = 5

export type CompareIdsStore = ReadableAtom<readonly string[]>

const hasBrowserStorage = (): boolean =>
  typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'

const readPersistedCompareIds = (): string[] => {
  if (!hasBrowserStorage()) {
    return []
  }

  try {
    const storedValue = sessionStorage.getItem(COMPARE_STORAGE_KEY)

    if (storedValue === null) {
      return []
    }

    const parsedValue: unknown = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
      .filter((id): id is string => typeof id === 'string')
      .slice(0, MAX_COMPARE)
  } catch {
    return []
  }
}

const persistCompareIds = (ids: readonly string[]): void => {
  if (!hasBrowserStorage()) {
    return
  }

  try {
    sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    return
  }
}

const compareIdsStore = atom<string[]>(readPersistedCompareIds())

export const compareIds: CompareIdsStore = readonlyType(compareIdsStore)

compareIdsStore.listen((ids) => {
  persistCompareIds(ids)
})

export const toggleCompare = (id: string): void => {
  const currentIds = compareIdsStore.get()

  if (currentIds.includes(id)) {
    compareIdsStore.set(currentIds.filter((currentId) => currentId !== id))

    return
  }

  if (currentIds.length >= MAX_COMPARE) {
    return
  }

  compareIdsStore.set([...currentIds, id])
}

export const clearCompare = (): void => {
  compareIdsStore.set([])
}
