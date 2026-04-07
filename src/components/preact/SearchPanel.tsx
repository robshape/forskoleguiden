import { useStore } from '@nanostores/preact'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'

import type { Locale } from '@/i18n/utils'
import { interpolate } from '@/lib/interpolate'
import type { SearchablePreschool } from '@/lib/search'
import { filterPreschools } from '@/lib/search'
import { compareIds, toggleCompare } from '@/lib/state'

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
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [shouldFocusTrigger, setShouldFocusTrigger] = useState(false)

  const ids = useStore(compareIds)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { results, totalCount } =
    query.trim() === ''
      ? { results: [], totalCount: 0 }
      : filterPreschools(query, searchablePreschools)

  const hasQuery = query.trim() !== ''
  const showNoResults = hasQuery && results.length === 0
  const showResultCount = hasQuery && totalCount > results.length

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setActiveIndex(-1)
    setShouldFocusTrigger(true)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [])

  // Focus trigger after close — runs when trigger re-mounts
  useEffect(() => {
    if (!isOpen && shouldFocusTrigger && triggerRef.current) {
      triggerRef.current.focus()
      setShouldFocusTrigger(false)
    }
  }, [isOpen, shouldFocusTrigger])

  const navigateToResult = (result: SearchablePreschool) => {
    window.location.href = `${basePath}/${locale}/forskola/${result.id}/`
  }

  const handleInputKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        if (results.length > 0) {
          setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
        }
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        if (results.length > 0) {
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
        }
        break
      }
      case 'Enter': {
        if (activeIndex >= 0 && activeIndex < results.length) {
          e.preventDefault()
          navigateToResult(results[activeIndex])
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        close()
        break
      }
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
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
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
        onClick={close}
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
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
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
              onClick={close}
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
                <path d="M18 6 6 18M6 6l12 12" />
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
                <ul
                  aria-label={resultsAriaLabel}
                  id={RESULTS_ID}
                  role="listbox"
                >
                  {results.map((result, index) => {
                    const isActive = index === activeIndex
                    const isInCompare = ids.includes(result.id)
                    const compareLabel = isInCompare ? addedLabel : addLabel

                    return (
                      <li
                        aria-label={`${result.name}, ${result.address}`}
                        aria-selected={isActive}
                        class={`flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors rtl:flex-row-reverse ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'}`}
                        id={`${RESULT_ID_PREFIX}${index}`}
                        key={result.id}
                        onClick={() => navigateToResult(result)}
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
              )}

              {/* Accessible compare toggles for keyboard/screen-reader users */}
              {results.length > 0 && (
                <div class="sr-only">
                  {results.map((result) => {
                    const isInCompare = ids.includes(result.id)
                    const compareLabel = isInCompare ? addedLabel : addLabel
                    const compareAriaLabel = interpolate(
                      compareButtonAriaLabelTemplate,
                      { action: compareLabel, name: result.name },
                    )

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
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
