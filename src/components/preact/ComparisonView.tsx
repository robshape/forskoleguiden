import { useStore } from '@nanostores/preact'
import { useState } from 'preact/hooks'

import type { Locale } from '@/i18n/utils'
import { SCORE_TIER_HIGH, SCORE_TIER_MEDIUM } from '@/lib/constants'
import { computeAgreeShare, OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import { compareIds, toggleCompare } from '@/lib/state'
import { RESPONSE_ROWS } from '@/lib/survey-responses'
import type { PreschoolSurvey } from '@/lib/types'

import ComparisonEmptyState from './ComparisonEmptyState'
import ComparisonSummary from './ComparisonSummary'

interface Props {
  directoryHref: string
  emptyStateTitle: string
  emptyStateBody: string
  selectedCountTemplate: string
  singleSelectionPrompt: string
  summaryHeading: string
  surveys: PreschoolSurvey[]
  /** 5 localized response category labels in RESPONSE_ROWS order */
  categoryLabels: string[]
  locale: Locale
  noDataLabel: string
  removeFromCompareLabel: string
  agreeShareLabel: string
}

export default function ComparisonView({
  directoryHref,
  emptyStateTitle,
  emptyStateBody,
  selectedCountTemplate,
  singleSelectionPrompt,
  summaryHeading,
  surveys,
  categoryLabels,
  locale,
  noDataLabel,
  removeFromCompareLabel,
  agreeShareLabel,
}: Props) {
  const ids = useStore(compareIds)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  if (ids.length === 0) {
    return (
      <ComparisonEmptyState
        emptyStateBody={emptyStateBody}
        emptyStateTitle={emptyStateTitle}
      />
    )
  }

  // 1+ selected — render preschool results side-by-side
  const selectedSurveys = ids
    .map((id) => surveys.find((s) => s.id === id))
    .filter((s): s is PreschoolSurvey => s !== undefined)

  if (selectedSurveys.length === 0) {
    return (
      <ComparisonEmptyState
        emptyStateBody={emptyStateBody}
        emptyStateTitle={emptyStateTitle}
      />
    )
  }

  const overallGroup =
    selectedSurveys[0]?.questionGroups.find(
      (g) => g.name === OVERALL_ASSESSMENT_GROUP,
    ) ?? null

  const questions = overallGroup?.questions ?? []

  const getScoreTextColor = (score: number) => {
    if (score >= SCORE_TIER_HIGH) return 'text-score-high-text'
    if (score >= SCORE_TIER_MEDIUM) return 'text-score-medium-text'
    return 'text-gray-700'
  }

  return (
    <div class="relative mx-auto max-w-2xl overflow-x-clip px-4 pt-4 pb-16 sm:px-0">
      {ids.length === 1 ? (
        <header class="mb-8 flex min-w-0 flex-col gap-2 border-l-4 border-primary-300 pl-4">
          <p
            class="text-base font-semibold text-gray-700"
            data-testid="selected-count-label"
          >
            {selectedCountTemplate.replace(
              '{count}',
              String(selectedSurveys.length),
            )}
          </p>
          <p
            class="text-base text-gray-700"
            data-testid="single-selection-prompt"
          >
            {singleSelectionPrompt}
          </p>
        </header>
      ) : (
        <p
          class="mb-8 text-sm font-medium text-gray-700"
          data-testid="selected-count-label"
        >
          {selectedCountTemplate.replace(
            '{count}',
            String(selectedSurveys.length),
          )}
        </p>
      )}

      {/* Vertical Comparison Stack */}
      <div
        class="mb-24 flex flex-col gap-16 md:gap-20"
        data-testid="comparison-scroll"
      >
        {questions.map((question) => (
          <section class="flex flex-col" key={question.text}>
            <header class="mb-6 md:mb-8">
              <h3 class="text-[19px] leading-snug font-bold tracking-tight text-zinc-900 sm:text-xl">
                "{question.text}"
              </h3>
            </header>

            <ul class="flex flex-col gap-0 border-y-2 border-zinc-900">
              {selectedSurveys.map((survey) => {
                const group = survey.questionGroups.find(
                  (g) => g.name === OVERALL_ASSESSMENT_GROUP,
                )
                const cell = group?.questions.find(
                  (candidate) => candidate.text === question.text,
                )

                const isHighlighted = highlightedId === survey.id
                const isDimmed =
                  highlightedId !== null && highlightedId !== survey.id
                const opacityClass = isDimmed
                  ? 'opacity-40 grayscale scale-[0.98]'
                  : 'opacity-100 scale-100'
                const highlightBgClass = isHighlighted
                  ? 'bg-zinc-50 border-transparent shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]'
                  : 'hover:bg-zinc-50/50'

                const removeAriaLabel = removeFromCompareLabel.replace(
                  '{name}',
                  survey.preschoolName,
                )

                // Group remove button and school name tightly, but give the row itself generous air
                const preschoolInfo = (
                  <div class="flex min-w-0 flex-1 items-center gap-3">
                    <button
                      aria-label={removeAriaLabel}
                      class="flex size-10 shrink-0 items-center justify-center rounded-full text-zinc-300 ring-offset-surface transition-all duration-200 hover:scale-110 hover:rotate-90 hover:bg-red-50 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Ensure focus doesn't trap if button is ripped out of the DOM on removal
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur()
                        }
                        toggleCompare(survey.id)
                      }}
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        class="size-5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                    <a
                      class={`min-w-0 text-[16px] leading-snug wrap-break-word transition-all duration-300 hover:text-primary-700 hover:underline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none ${isHighlighted ? 'font-bold text-zinc-900' : 'font-medium text-zinc-800'}`}
                      href={`${directoryHref}forskola/${survey.id}/?from=compare`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {survey.preschoolName}
                    </a>
                  </div>
                )

                if (!cell) {
                  return (
                    <li
                      class={`border-t border-zinc-100/60 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] first:border-0 ${opacityClass}`}
                      key={survey.id}
                    >
                      <div
                        class={`-mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer items-center justify-between gap-6 rounded-2xl px-3 py-4 transition-all duration-300 sm:-mx-5 sm:w-[calc(100%+2.5rem)] sm:p-5 ${highlightBgClass}`}
                        onClick={() =>
                          setHighlightedId(isHighlighted ? null : survey.id)
                        }
                      >
                        {preschoolInfo}
                        <span
                          aria-label={noDataLabel}
                          class="shrink-0 text-base font-medium text-zinc-300"
                        >
                          —
                        </span>
                      </div>
                    </li>
                  )
                }

                const agreeShare = Math.round(computeAgreeShare(cell.response))
                const scoreColor = getScoreTextColor(agreeShare)

                return (
                  <li
                    class={`border-t border-zinc-100/60 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] first:border-0 ${opacityClass}`}
                    key={survey.id}
                  >
                    <div
                      class={`relative -mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer items-center justify-between gap-6 rounded-2xl px-3 py-4 transition-all duration-300 sm:-mx-5 sm:w-[calc(100%+2.5rem)] sm:px-5 sm:py-4 ${highlightBgClass}`}
                      onClick={() =>
                        setHighlightedId(isHighlighted ? null : survey.id)
                      }
                    >
                      {preschoolInfo}

                      <div class="flex min-w-16 shrink-0 flex-col items-end justify-center sm:min-w-18">
                        <div
                          class={`text-3xl leading-none tracking-tight transition-all duration-300 sm:text-4xl ${scoreColor} ${isHighlighted ? 'scale-105 font-black' : 'font-extrabold'}`}
                        >
                          {agreeShare}%
                        </div>
                        <div
                          class={`mt-1 text-[11px] tracking-wide uppercase transition-colors duration-300 ${isHighlighted ? 'font-bold text-zinc-600' : 'font-semibold text-zinc-400'}`}
                        >
                          {agreeShareLabel}
                        </div>
                      </div>
                    </div>

                    {/* Screen-reader fallback data — placed outside the row div to avoid nesting tables inside interactive elements */}
                    <div class="sr-only">
                      <table>
                        <caption>
                          {question.text} - {survey.preschoolName}
                        </caption>
                        <tbody>
                          {RESPONSE_ROWS.map((row, rowIdx) => (
                            <tr key={row.field}>
                              <th scope="row">{categoryLabels[rowIdx]}</th>
                              <td>{cell.response[row.field]}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      <ComparisonSummary
        locale={locale}
        selectedSurveys={selectedSurveys}
        summaryHeading={summaryHeading}
      />
    </div>
  )
}
