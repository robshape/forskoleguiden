import { useState } from 'preact/hooks'

import type { SearchablePreschool } from '@/features/search/search'
import { filterPreschools } from '@/features/search/search'
import {
  nextIndex,
  prevIndex,
  resolveKeyboardAction,
} from '@/features/search/search-panel-keyboard'
import { useSearchPanel } from '@/features/search/useSearchPanel'
import type { Locale } from '@/i18n/utils'
import {
  CLOSE_24_STROKE_PATH,
  SEARCH_24_STROKE_CIRCLE,
  SEARCH_24_STROKE_PATH,
} from '@/lib/icons'
import { interpolate } from '@/lib/interpolate'

import SearchResultList from './SearchResultList'

interface Props {
  searchablePreschools: SearchablePreschool[]
  locale: Locale
  basePath: string
  placeholder: string
  triggerAriaLabel: string
  noResultsText: string
  resultCountTemplate: string
  closeAriaLabel: string
  resultsAriaLabel: string
  addLabel: string
  addedLabel: string
  compareButtonAriaLabelTemplate: string
}

const RESULTS_ID = 'search-results-list'
const RESULT_ID_PREFIX = 'search-result-'

export default function SearchPanel({
  searchablePreschools,
  locale,
  basePath,
  placeholder,
  triggerAriaLabel,
  noResultsText,
  resultCountTemplate,
  closeAriaLabel,
  resultsAriaLabel,
  addLabel,
  addedLabel,
  compareButtonAriaLabelTemplate,
}: Props) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const { isOpen, open, close, triggerRef, inputRef } = useSearchPanel()

  const { results, totalCount } =
    query.trim() === ''
      ? { results: [], totalCount: 0 }
      : filterPreschools(query, searchablePreschools)

  const hasQuery = query.trim() !== ''
  const showNoResults = hasQuery && results.length === 0
  const showResultCount = hasQuery && totalCount > results.length

  const handleClose = () => {
    setQuery('')
    setActiveIndex(-1)
    close()
  }

  const navigateToResult = (result: SearchablePreschool) => {
    window.location.href = `${basePath}/${locale}/forskola/${result.id}/`
  }

  const handleInputKeyDown = (e: KeyboardEvent) => {
    const action = resolveKeyboardAction(e.key, results, activeIndex)
    switch (action.type) {
      case 'next':
        e.preventDefault()
        setActiveIndex((prev) => nextIndex(prev, results.length))
        break
      case 'prev':
        e.preventDefault()
        setActiveIndex((prev) => prevIndex(prev, results.length))
        break
      case 'select':
        e.preventDefault()
        navigateToResult(action.result)
        break
      case 'close':
        e.preventDefault()
        handleClose()
        break
    }
  }

  if (!isOpen) {
    return (
      <button
        aria-label={triggerAriaLabel}
        class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none active:bg-gray-200"
        onClick={open}
        ref={triggerRef}
        type="button"
      >
        <svg
          aria-hidden="true"
          class="size-5"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <circle
            cx={SEARCH_24_STROKE_CIRCLE.cx}
            cy={SEARCH_24_STROKE_CIRCLE.cy}
            r={SEARCH_24_STROKE_CIRCLE.r}
          />
          <path d={SEARCH_24_STROKE_PATH} />
        </svg>
      </button>
    )
  }

  return (
    <>
      {/* Backdrop — visible only on sm+ */}
      <div
        aria-hidden="true"
        class="fixed inset-0 z-50 bg-black/10"
        data-testid="search-backdrop"
        onClick={handleClose}
      />

      {/* Panel — full-height on mobile, popup card on sm+ */}
      <div class="fixed inset-x-0 top-(--height-nav) z-50 px-3 pt-2 sm:px-4">
        <div class="mx-auto max-w-content animate-search-panel-in overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          {/* Search input */}
          <div
            class="flex items-center gap-2 px-5 py-3 rtl:flex-row-reverse"
            data-testid="search-panel-header"
          >
            <svg
              aria-hidden="true"
              class="size-5 shrink-0 text-gray-400"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle
                cx={SEARCH_24_STROKE_CIRCLE.cx}
                cy={SEARCH_24_STROKE_CIRCLE.cy}
                r={SEARCH_24_STROKE_CIRCLE.r}
              />
              <path d={SEARCH_24_STROKE_PATH} />
            </svg>

            <div class="relative flex-1">
              <input
                aria-activedescendant={
                  activeIndex >= 0
                    ? `${RESULT_ID_PREFIX}${activeIndex}`
                    : undefined
                }
                aria-autocomplete="list"
                aria-controls={results.length > 0 ? RESULTS_ID : undefined}
                aria-expanded={results.length > 0 || showNoResults}
                class="w-full bg-transparent text-body outline-none placeholder:text-gray-400"
                onInput={(e) => {
                  setQuery((e.target as HTMLInputElement).value)
                  setActiveIndex(-1)
                }}
                onKeyDown={handleInputKeyDown}
                placeholder={placeholder}
                ref={inputRef}
                role="combobox"
                type="search"
                value={query}
              />
            </div>

            <button
              aria-label={closeAriaLabel}
              class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none active:bg-gray-200"
              onClick={handleClose}
              type="button"
            >
              <svg
                aria-hidden="true"
                class="size-5"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d={CLOSE_24_STROKE_PATH} />
              </svg>
            </button>
          </div>

          {/* Results — only rendered when there's a query */}
          {hasQuery && (
            <div class="max-h-80 overflow-y-auto border-t border-border px-5 py-2 sm:max-h-96">
              {showResultCount && (
                <p aria-live="polite" class="mb-2 text-caption text-gray-500">
                  {interpolate(resultCountTemplate, {
                    shown: results.length,
                    total: totalCount,
                  })}
                </p>
              )}

              {showNoResults && (
                <p
                  class="py-6 text-center text-body text-gray-500"
                  role="status"
                >
                  {noResultsText}
                </p>
              )}

              {results.length > 0 && (
                <SearchResultList
                  activeIndex={activeIndex}
                  addedLabel={addedLabel}
                  addLabel={addLabel}
                  compareButtonAriaLabelTemplate={
                    compareButtonAriaLabelTemplate
                  }
                  onNavigate={navigateToResult}
                  results={results}
                  resultsAriaLabel={resultsAriaLabel}
                  resultsId={RESULTS_ID}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
