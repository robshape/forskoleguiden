import { describe, expect, it } from 'vitest'

import type { SearchablePreschool } from '@/features/search/search'
import { filterPreschools, normalizeText } from '@/features/search/search'

const makePreschool = (
  overrides: Partial<SearchablePreschool> & { id: string; name: string },
): SearchablePreschool => ({
  address: 'Testgatan 1',
  operatorType: 'municipal',
  ...overrides,
})

const TEST_PRESCHOOLS: SearchablePreschool[] = [
  makePreschool({
    id: 'alpha',
    name: 'Alpha förskola',
    address: 'Storgatan 1',
  }),
  makePreschool({ id: 'beta', name: 'Beta daghem', address: 'Ängatan 2' }),
  makePreschool({ id: 'gamma', name: 'Gamma montessori', address: 'Ögatan 3' }),
  makePreschool({ id: 'delta', name: 'Delta förskola', address: 'Ågatan 4' }),
  makePreschool({
    id: 'epsilon',
    name: 'Epsilon förskola',
    address: 'Storgatan 5',
  }),
  makePreschool({
    id: 'zeta',
    name: 'Zeta förskola',
    address: 'Lilla Storgatan 6',
  }),
  makePreschool({ id: 'eta', name: 'Eta montessori', address: 'Storgatan 7' }),
  makePreschool({
    id: 'theta',
    name: 'Theta förskola',
    address: 'Storgatan 8',
  }),
  makePreschool({ id: 'iota', name: 'Iota daghem', address: 'Storgatan 9' }),
  makePreschool({
    id: 'kappa',
    name: 'Kappa förskola',
    address: 'Storgatan 10',
  }),
  makePreschool({
    id: 'lambda',
    name: 'Lambda förskola',
    address: 'Storgatan 11',
  }),
  makePreschool({
    id: 'mu',
    name: 'Mu förskola',
    address: 'Storgatan 12',
    operatorType: 'independent',
  }),
  makePreschool({ id: 'nu', name: 'Nu förskola', address: 'Storgatan 13' }),
  makePreschool({ id: 'xi', name: 'Xi förskola', address: 'Storgatan 14' }),
  makePreschool({
    id: 'omicron',
    name: 'Omicron daghem',
    address: 'Storgatan 15',
  }),
]

describe('normalizeText', () => {
  it('converts text to lowercase', () => {
    expect(normalizeText('HELLO World')).toBe('hello world')
  })

  it('strips Swedish diacritics ö → o, ä → a, å → a', () => {
    expect(normalizeText('Ögatan')).toBe('ogatan')
    expect(normalizeText('Ängatan')).toBe('angatan')
    expect(normalizeText('Ågatan')).toBe('agatan')
  })

  it('strips combined diacritics in a single string', () => {
    expect(normalizeText('Åkersberga Östra Ängen')).toBe(
      'akersberga ostra angen',
    )
  })

  it('returns empty string for empty input', () => {
    expect(normalizeText('')).toBe('')
  })

  it('preserves non-diacritic characters', () => {
    expect(normalizeText('abc 123')).toBe('abc 123')
  })
})

describe('filterPreschools', () => {
  it('returns empty results for an empty query', () => {
    const result = filterPreschools('', TEST_PRESCHOOLS)
    expect(result).toEqual({ results: [], totalCount: 0 })
  })

  it('matches preschools by name (case-insensitive)', () => {
    const result = filterPreschools('alpha', TEST_PRESCHOOLS)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].id).toBe('alpha')
    expect(result.totalCount).toBe(1)
  })

  it('matches preschools by address', () => {
    const result = filterPreschools('Lilla Storgatan', TEST_PRESCHOOLS)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].id).toBe('zeta')
  })

  it('returns results sorted alphabetically by name', () => {
    const result = filterPreschools('förskola', TEST_PRESCHOOLS)
    const names = result.results.map((p) => p.name)
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'sv'))
    expect(names).toEqual(sorted)
  })

  it('caps results at 10 while totalCount reflects all matches', () => {
    const result = filterPreschools('storgatan', TEST_PRESCHOOLS)
    expect(result.results).toHaveLength(10)
    expect(result.totalCount).toBe(12)
  })

  it('matches with diacritics-tolerant search (o matches ö)', () => {
    const result = filterPreschools('ogatan', TEST_PRESCHOOLS)
    expect(result.results.some((p) => p.address === 'Ögatan 3')).toBe(true)
  })

  it('matches with diacritics-tolerant search (a matches ä)', () => {
    const result = filterPreschools('angatan', TEST_PRESCHOOLS)
    expect(result.results.some((p) => p.address === 'Ängatan 2')).toBe(true)
  })

  it('matches with diacritics-tolerant search (a matches å)', () => {
    const result = filterPreschools('agatan', TEST_PRESCHOOLS)
    expect(result.results.some((p) => p.address === 'Ågatan 4')).toBe(true)
  })

  it('returns empty results when no preschool matches', () => {
    const result = filterPreschools('nonexistent xyz', TEST_PRESCHOOLS)
    expect(result).toEqual({ results: [], totalCount: 0 })
  })

  it('handles whitespace-only query as empty', () => {
    const result = filterPreschools('   ', TEST_PRESCHOOLS)
    expect(result).toEqual({ results: [], totalCount: 0 })
  })

  it('returns an empty array when given no preschools', () => {
    const result = filterPreschools('alpha', [])
    expect(result).toEqual({ results: [], totalCount: 0 })
  })

  it('matches both name and address fields for the same preschool', () => {
    const result = filterPreschools('alpha', TEST_PRESCHOOLS)
    expect(result.results[0].name).toBe('Alpha förskola')
    expect(result.results[0].address).toBe('Storgatan 1')
  })
})
