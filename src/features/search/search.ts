import type { OperatorType } from '@/lib/types'

export type SearchablePreschool = {
  id: string
  name: string
  address: string
  operatorType: OperatorType
}

const MAX_RESULTS = 10

export const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const filterPreschools = (
  query: string,
  preschools: SearchablePreschool[],
): { results: SearchablePreschool[]; totalCount: number } => {
  const trimmed = query.trim()

  if (trimmed === '') {
    return { results: [], totalCount: 0 }
  }

  const normalizedQuery = normalizeText(trimmed)

  const matches = preschools.filter((p) => {
    const normalizedName = normalizeText(p.name)
    const normalizedAddress = normalizeText(p.address)

    return (
      normalizedName.includes(normalizedQuery) ||
      normalizedAddress.includes(normalizedQuery)
    )
  })

  matches.sort((a, b) => a.name.localeCompare(b.name, 'sv'))

  return {
    results: matches.slice(0, MAX_RESULTS),
    totalCount: matches.length,
  }
}
