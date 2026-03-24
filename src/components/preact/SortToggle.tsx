import { useEffect, useRef, useState } from 'preact/hooks'

import type { Locale } from '@/i18n/utils'

import type { SortMode } from './sort-helpers'
import { applySort, getRows } from './sort-helpers'

interface Props {
  listId: string
  rankingLabel: string
  alphabeticalLabel: string
  groupLabel: string
  sortLabel: string
  locale: Locale
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
  const [isHydrated, setIsHydrated] = useState(false)
  const initialSortDoneRef = useRef(false)

  useEffect(() => {
    const listElement = document.getElementById(listId)

    if (!(listElement instanceof HTMLUListElement)) {
      return
    }

    const rows = getRows(listElement)

    if (!initialSortDoneRef.current) {
      initialSortDoneRef.current = true
      setIsHydrated(true)

      return
    }

    applySort(listElement, rows, sortMode, locale)
  }, [listId, locale, sortMode])

  const toggleButtonClass = (active: boolean) =>
    active
      ? 'bg-primary-600 text-white active:bg-primary-700/90'
      : 'bg-surface text-gray-700 hover:bg-gray-100 active:bg-gray-200'

  return (
    <div
      aria-label={groupLabel}
      class="inline-flex flex-wrap items-center gap-2 sm:flex-nowrap"
      data-hydrated={isHydrated ? 'true' : 'false'}
      data-testid="sort-toggle"
      role="group"
    >
      <span class="text-sm font-medium text-gray-700">{sortLabel}</span>
      <button
        aria-pressed={sortMode === 'alphabetical'}
        class={`inline-flex min-h-11 items-center rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none ${toggleButtonClass(sortMode === 'alphabetical')}`}
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
        class={`inline-flex min-h-11 items-center rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none ${toggleButtonClass(sortMode === 'ranking')}`}
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
