import { atom, readonlyType } from 'nanostores'
import type { ReadableAtom } from 'nanostores'

export const COMPARE_STORAGE_KEY = 'compareIds'

export const MAX_COMPARE = 5

export type CompareIdsStore = ReadableAtom<readonly string[]>
type CompareIdsAtom = ReturnType<typeof atom<string[]>>

interface CompareStoreContainer {
  store: CompareIdsAtom
  persistenceBound: boolean
}

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

const createCompareStoreContainer = (): CompareStoreContainer => ({
  store: atom<string[]>(readPersistedCompareIds()),
  persistenceBound: false,
})

const getCompareStoreContainer = (): CompareStoreContainer => {
  if (typeof window === 'undefined') {
    return createCompareStoreContainer()
  }

  const browserWindow = window as Window & {
    __forskoleguidenCompareStore__?: CompareStoreContainer
  }

  if (!browserWindow.__forskoleguidenCompareStore__) {
    browserWindow.__forskoleguidenCompareStore__ = createCompareStoreContainer()
  }

  return browserWindow.__forskoleguidenCompareStore__
}

const compareStoreContainer = getCompareStoreContainer()
const compareIdsStore = compareStoreContainer.store

export const compareIds: CompareIdsStore = readonlyType(compareIdsStore)

if (!compareStoreContainer.persistenceBound) {
  compareIdsStore.listen((ids) => {
    persistCompareIds(ids)
  })

  compareStoreContainer.persistenceBound = true
}

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
