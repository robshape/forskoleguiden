import { useStore } from '@nanostores/preact'

import type { Locale } from '@/i18n/utils'
import { SCORE_TIER_HIGH, SCORE_TIER_MEDIUM } from '@/lib/constants'
import { computeAgreeShare, OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import { compareIds } from '@/lib/state'
import { RESPONSE_ROWS } from '@/lib/survey-responses'
import type { PreschoolSurvey } from '@/lib/types'

import CompareButton from './CompareButton'
import ComparisonEmptyState from './ComparisonEmptyState'
import ComparisonSummary from './ComparisonSummary'

interface Props {
  directoryHref: string
  emptyStateTitle: string
  emptyStateBody: string
  selectedCountTemplate: string
  singleSelectionPrompt: string
  summaryHeading: string
  scrollHintLabel: string
  surveys: PreschoolSurvey[]
  /** 5 localized response category labels in RESPONSE_ROWS order */
  categoryLabels: string[]
  locale: Locale
  compareAddLabel: string
  compareAddedLabel: string
  compareAriaLabelTemplate: string
  agreeShareLabel: string
}

/** Card width uses spacing scale tokens for predictable layout across contexts. */
const CARD_W = 'w-64 sm:w-[283px]'

export default function ComparisonView({
  directoryHref,
  emptyStateTitle,
  emptyStateBody,
  selectedCountTemplate,
  singleSelectionPrompt,
  summaryHeading,
  scrollHintLabel,
  surveys,
  categoryLabels,
  locale,
  compareAddLabel,
  compareAddedLabel,
  compareAriaLabelTemplate,
  agreeShareLabel,
}: Props) {
  const ids = useStore(compareIds)

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

  const isLastColumn = (idx: number) => idx === selectedSurveys.length - 1

  /** Standalone vertical separator rendered between adjacent school columns */
  const renderDivider = (idx: number) =>
    isLastColumn(idx) ? null : (
      <div
        aria-hidden="true"
        class="w-px shrink-0 self-stretch bg-border"
      ></div>
    )

  return (
    <div class="overflow-x-clip pb-16">
      {ids.length === 1 ? (
        <header class="mb-10 flex min-w-0 flex-col gap-2 border-s-4 border-primary-300 ps-4">
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
            class="text-base text-gray-600"
            data-testid="single-selection-prompt"
          >
            {singleSelectionPrompt}
          </p>
        </header>
      ) : (
        <p
          class="mb-8 text-sm font-medium text-gray-500"
          data-testid="selected-count-label"
        >
          {selectedCountTemplate.replace(
            '{count}',
            String(selectedSurveys.length),
          )}
        </p>
      )}

      {/* Scroll hint — visible when more than 2 schools overflow on mobile */}
      {selectedSurveys.length > 2 && (
        <p
          aria-hidden="true"
          class="mb-3 flex items-center gap-1 text-sm text-gray-500 sm:hidden"
          data-testid="scroll-hint"
        >
          <svg
            class="size-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M8 7l4-4m0 0l4 4m-4-4v18"
              stroke-linecap="round"
              stroke-linejoin="round"
              transform="rotate(90 12 12)"
            ></path>
          </svg>
          {scrollHintLabel}
        </p>
      )}

      {/* Scrollable comparison grid */}
      <div class="relative">
        <div
          class="snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
          data-testid="comparison-scroll"
        >
          <div class="inline-flex flex-col gap-8 pt-1 pr-8 pb-4 sm:pr-6">
            {/* Header Row */}
            <div class="flex gap-4">
              {selectedSurveys.map((survey, idx) => (
                <>
                  <div
                    class={`flex ${CARD_W} shrink-0 snap-start flex-col border-b border-border pb-4`}
                    key={survey.id}
                  >
                    <h2 class="text-xl font-bold tracking-tight wrap-break-word text-gray-900">
                      <a
                        class="wrap-break-word hover:text-primary-700 hover:underline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                        href={`${directoryHref}forskola/${survey.id}/?from=compare`}
                      >
                        {survey.preschoolName}
                      </a>
                    </h2>
                    <div class="mt-auto pt-3">
                      <CompareButton
                        addedLabel={compareAddedLabel}
                        addLabel={compareAddLabel}
                        ariaLabelTemplate={compareAriaLabelTemplate}
                        id={survey.id}
                        name={survey.preschoolName}
                      />
                    </div>
                  </div>
                  {renderDivider(idx)}
                </>
              ))}
            </div>
            {/* Questions Rows */}
            {questions.map((question) => (
              <div
                class="flex flex-col gap-5 border-t border-border pt-6 first:border-t-0 first:pt-0"
                key={question.text}
              >
                <div class="sticky left-0 z-10 flex w-fit max-w-[80vw] flex-col gap-2 bg-page pr-5">
                  <h3 class="text-base font-bold text-gray-900">
                    "{question.text}"
                  </h3>
                </div>

                <div class="flex items-stretch gap-4">
                  {selectedSurveys.map((survey, idx) => {
                    const group = survey.questionGroups.find(
                      (g) => g.name === OVERALL_ASSESSMENT_GROUP,
                    )
                    const cell = group?.questions.find(
                      (candidate) => candidate.text === question.text,
                    )

                    if (!cell) {
                      return (
                        <>
                          <div
                            class={`${CARD_W} shrink-0 snap-start rounded-xl border border-border bg-surface p-6 shadow-sm`}
                            key={survey.id}
                          >
                            <p class="text-sm text-gray-500">—</p>
                          </div>
                          {renderDivider(idx)}
                        </>
                      )
                    }

                    const agreeShare = Math.round(
                      computeAgreeShare(cell.response),
                    )
                    const scoreColor = getScoreTextColor(agreeShare)

                    return (
                      <>
                        <div
                          class={`flex ${CARD_W} shrink-0 snap-start flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:shadow-md`}
                          key={survey.id}
                        >
                          <div
                            class={`text-[32px] leading-none font-extrabold ${scoreColor}`}
                          >
                            {agreeShare}%
                          </div>
                          <div class="mt-1 text-sm font-medium text-gray-600">
                            {agreeShareLabel}
                          </div>

                          {/* Screen-reader fallback data */}
                          <table class="sr-only">
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
                        {renderDivider(idx)}
                      </>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right fade hint — outside scroll container to avoid adding scroll width */}
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-page to-transparent sm:hidden"
        ></div>
      </div>

      <ComparisonSummary
        locale={locale}
        selectedSurveys={selectedSurveys}
        summaryHeading={summaryHeading}
      />
    </div>
  )
}
