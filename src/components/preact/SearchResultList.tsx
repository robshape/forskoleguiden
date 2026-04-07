import { useStore } from '@nanostores/preact'

import type { SearchablePreschool } from '@/features/search/search'
import { interpolate } from '@/lib/interpolate'
import { compareIds, toggleCompare } from '@/lib/state'

const RESULT_ID_PREFIX = 'search-result-'

interface SearchResultListProps {
  results: SearchablePreschool[]
  activeIndex: number
  resultsId: string
  resultsAriaLabel: string
  addLabel: string
  addedLabel: string
  compareButtonAriaLabelTemplate: string
  onNavigate: (result: SearchablePreschool) => void
}

export default function SearchResultList({
  results,
  activeIndex,
  resultsId,
  resultsAriaLabel,
  addLabel,
  addedLabel,
  compareButtonAriaLabelTemplate,
  onNavigate,
}: SearchResultListProps) {
  const ids = useStore(compareIds)
  const compareSet = new Set(ids)

  return (
    <>
      <ul aria-label={resultsAriaLabel} id={resultsId} role="listbox">
        {results.map((result, index) => {
          const isActive = index === activeIndex
          const isInCompare = compareSet.has(result.id)
          const compareLabel = isInCompare ? addedLabel : addLabel

          return (
            <li
              aria-label={`${result.name}, ${result.address}`}
              aria-selected={isActive}
              class={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors rtl:flex-row-reverse ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'}`}
              id={`${RESULT_ID_PREFIX}${index}`}
              key={result.id}
              onClick={() => onNavigate(result)}
              role="option"
            >
              <div class="min-w-0 flex-1">
                <div class="truncate font-medium text-gray-900">
                  {result.name}
                </div>
                <div class="truncate text-caption text-gray-500">
                  {result.address}
                </div>
              </div>
              {/* Compare toggle — rendered inside option layout but
                  removed from the accessibility tree to avoid
                  nested-interactive. Keyboard users toggle via the
                  per-result Tab-reachable button below the listbox. */}
              <span
                aria-hidden="true"
                class={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-caption/tight font-semibold transition-colors ${
                  isInCompare
                    ? 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-700/90'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }`}
                data-testid="search-compare-toggle"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCompare(result.id)
                }}
                role="presentation"
              >
                <svg
                  class="size-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  viewBox="0 0 16 16"
                >
                  {isInCompare ? (
                    <path d="M3 8.5 6.5 12 13 5.5" />
                  ) : (
                    <path d="M8 3v10M3 8h10" />
                  )}
                </svg>
                <span class="hidden sm:inline">{compareLabel}</span>
              </span>
            </li>
          )
        })}
      </ul>

      {/* Accessible compare toggles for keyboard/screen-reader users */}
      <div class="sr-only">
        {results.map((result) => {
          const isInCompare = compareSet.has(result.id)
          const compareLabel = isInCompare ? addedLabel : addLabel
          const compareAriaLabel = interpolate(compareButtonAriaLabelTemplate, {
            action: compareLabel,
            name: result.name,
          })

          return (
            <button
              aria-label={compareAriaLabel}
              aria-pressed={isInCompare}
              key={`compare-${result.id}`}
              onClick={() => toggleCompare(result.id)}
              type="button"
            >
              {compareLabel}
            </button>
          )
        })}
      </div>
    </>
  )
}
