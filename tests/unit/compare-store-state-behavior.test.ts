import { afterEach, describe, expect, it } from 'vitest'

import {
  clearCompare,
  compareIds,
  MAX_COMPARE,
  setCompareIds,
  toggleCompare,
} from '../../src/lib/state'

// Importing state.ts in a Node environment (no window/sessionStorage) is the
// SSR-safety test: if it crashes, every test in this file fails.

afterEach(() => {
  clearCompare()
})

describe('compare store state behavior', () => {
  it('starts with an empty compare list and exposes MAX_COMPARE as 5', () => {
    expect(MAX_COMPARE).toBe(5)
    expect(compareIds.get()).toEqual([])
  })

  it('toggles a preschool into and out of the compare list', () => {
    toggleCompare('alpha')
    expect(compareIds.get()).toEqual(['alpha'])

    toggleCompare('alpha')
    expect(compareIds.get()).toEqual([])
  })

  it('silently refuses additions beyond MAX_COMPARE capacity', () => {
    toggleCompare('a')
    toggleCompare('b')
    toggleCompare('c')
    toggleCompare('d')
    toggleCompare('e')

    toggleCompare('overflow')
    expect(compareIds.get()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('clears all selections', () => {
    toggleCompare('a')
    toggleCompare('b')
    expect(compareIds.get()).toEqual(['a', 'b'])

    clearCompare()
    expect(compareIds.get()).toEqual([])
  })

  it('bulk-replaces IDs with setCompareIds and caps at MAX_COMPARE', () => {
    setCompareIds(['x', 'y', 'z'])
    expect(compareIds.get()).toEqual(['x', 'y', 'z'])

    setCompareIds(['1', '2', '3', '4', '5', '6', '7'])
    expect(compareIds.get()).toEqual(['1', '2', '3', '4', '5'])
  })
})
