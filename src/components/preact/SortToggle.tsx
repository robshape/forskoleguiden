import { useEffect, useRef, useState } from 'preact/hooks'

import type { Locale } from '@/i18n/utils'

type SortMode = 'ranking' | 'alphabetical'

interface Props {
  listId: string
  rankingLabel: string
  alphabeticalLabel: string
  groupLabel: string
  sortLabel: string
  locale: Locale
}

interface ListRow {
  element: HTMLLIElement
  name: string
  rankIndexZeroBased: number
}

const getRows = (listElement: HTMLUListElement) => {
  return Array.from(
    listElement.querySelectorAll<HTMLLIElement>(':scope > li'),
  ).map((rowElement, index) => ({
    element: rowElement,
    name: rowElement.getAttribute('data-name') ?? '',
    rankIndexZeroBased: Number(
      rowElement.getAttribute('data-rank-index-zero-based') ?? index,
    ),
  }))
}

const sortRows = (rows: ListRow[], sortMode: SortMode, locale: string) => {
  return [...rows].sort((leftRow, rightRow) => {
    if (sortMode === 'ranking') {
      return leftRow.rankIndexZeroBased - rightRow.rankIndexZeroBased
    }

    const byName = leftRow.name.localeCompare(rightRow.name, locale, {
      sensitivity: 'base',
    })

    if (byName !== 0) {
      return byName
    }

    return leftRow.rankIndexZeroBased - rightRow.rankIndexZeroBased
  })
}

const updateRanks = (sortedRows: ListRow[]) => {
  sortedRows.forEach((row, index) => {
    const rankElement = row.element.querySelector('[data-testid="rank-index"]')

    if (rankElement !== null) {
      rankElement.textContent = String(index + 1)
    }
  })
}

// Reorders server-rendered list items in-place — the list is pre-rendered by
// Astro at build time and this island only changes their DOM order.
const applySort = (
  listElement: HTMLUListElement,
  rows: ListRow[],
  sortMode: SortMode,
  locale: string,
) => {
  const sortedRows = sortRows(rows, sortMode, locale)

  sortedRows.forEach((row) => {
    listElement.appendChild(row.element)
  })

  updateRanks(sortedRows)
}

export default function SortToggle({
  listId,
  rankingLabel,
  alphabeticalLabel,
  groupLabel,
  sortLabel,
  locale,
}: Props) {
  const [sortMode, setSortMode] = useState<SortMode>('alphabetical')
  const [announcement, setAnnouncement] = useState('')
  const hasHydratedRef = useRef(false)
  const cachedListElementRef = useRef<HTMLUListElement | null>(null)
  const cachedRowsRef = useRef<ListRow[] | null>(null)

  useEffect(() => {
    const listElement = document.getElementById(listId)

    if (!(listElement instanceof HTMLUListElement)) {
      return
    }

    if (cachedListElementRef.current !== listElement) {
      cachedListElementRef.current = listElement
      cachedRowsRef.current = getRows(listElement)
      hasHydratedRef.current = false
    }

    if (cachedRowsRef.current === null) {
      cachedRowsRef.current = getRows(listElement)
    }

    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true

      return
    }

    applySort(listElement, cachedRowsRef.current, sortMode, locale)
  }, [listId, locale, sortMode])

  const rankingButtonClass =
    sortMode === 'ranking'
      ? 'bg-primary-600 text-white'
      : 'bg-surface text-gray-700 hover:bg-gray-100'

  const alphabeticalButtonClass =
    sortMode === 'alphabetical'
      ? 'bg-primary-600 text-white'
      : 'bg-surface text-gray-700 hover:bg-gray-100'

  return (
    <div
      aria-label={groupLabel}
      class="inline-flex items-center gap-2"
      role="group"
    >
      <span class="text-sm font-medium text-gray-700">{sortLabel}</span>
      <button
        aria-pressed={sortMode === 'alphabetical'}
        class={`inline-flex h-8 items-center rounded-full border border-border px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none ${alphabeticalButtonClass}`}
        onClick={() => {
          setSortMode('alphabetical')
          setAnnouncement(`${groupLabel}: ${alphabeticalLabel}`)
        }}
        type="button"
      >
        {alphabeticalLabel}
      </button>
      <button
        aria-pressed={sortMode === 'ranking'}
        class={`inline-flex h-8 items-center rounded-full border border-border px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none ${rankingButtonClass}`}
        onClick={() => {
          setSortMode('ranking')
          setAnnouncement(`${groupLabel}: ${rankingLabel}`)
        }}
        type="button"
      >
        {rankingLabel}
      </button>
      <span
        aria-atomic="true"
        aria-live="polite"
        class="sr-only"
        data-testid="sort-live-region"
      >
        {announcement}
      </span>
    </div>
  )
}
