import { describe, expect, it } from 'vitest'

import { clearCompare, compareIds, setCompareIds } from '@/lib/state'

describe('setCompareIds', () => {
  it('replaces the entire compare set with the provided IDs', () => {
    clearCompare()
    setCompareIds(['a', 'b', 'c'])
    expect(compareIds.get()).toEqual(['a', 'b', 'c'])
  })

  it('truncates to MAX_COMPARE (5) when given more IDs', () => {
    clearCompare()
    setCompareIds(['a', 'b', 'c', 'd', 'e', 'f', 'g'])
    expect(compareIds.get()).toHaveLength(5)
    expect(compareIds.get()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('accepts an empty array and clears all selections', () => {
    setCompareIds(['a', 'b'])
    setCompareIds([])
    expect(compareIds.get()).toEqual([])
  })

  it('replaces existing IDs rather than appending', () => {
    setCompareIds(['x', 'y'])
    setCompareIds(['a'])
    expect(compareIds.get()).toEqual(['a'])
  })

  it('triggers exactly one store update (no intermediate states)', () => {
    clearCompare()
    const snapshots: string[][] = []
    const unsub = compareIds.subscribe((ids) => {
      snapshots.push([...ids])
    })
    setCompareIds(['a', 'b', 'c'])
    unsub()
    // subscribe fires immediately with current value, then once for setCompareIds
    expect(snapshots).toHaveLength(2)
    expect(snapshots[1]).toEqual(['a', 'b', 'c'])
  })
})
