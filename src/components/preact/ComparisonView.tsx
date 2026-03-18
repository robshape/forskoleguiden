import { useStore } from '@nanostores/preact'

import { computeBestPerQuestion } from '@/features/comparison/summary'
import { formatBestPerQuestionText } from '@/features/comparison/summaryText'
import type { Locale } from '@/i18n/utils'
import { SCORE_TIER_HIGH, SCORE_TIER_MEDIUM } from '@/lib/constants'
import { computeAgreeShare, OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import { compareIds } from '@/lib/state'
import { RESPONSE_ROWS } from '@/lib/survey-responses'
import type { PreschoolSurvey } from '@/lib/types'

import CompareButton from './CompareButton'

interface Props {
  heading: string
  directoryHref: string
  emptyStateTitle: string
  emptyStateBody: string
  singleSelectionPrompt: string
  summaryHeading: string
  backToDirectoryLabel: string
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

/** Card width for each school column. Sized so two cards fit side-by-side on mobile. */
const CARD_W = 'w-[calc(50vw-1.5rem)] sm:w-[280px]'

export default function ComparisonView({
  heading,
  directoryHref,
  emptyStateTitle,
  emptyStateBody,
  singleSelectionPrompt,
  summaryHeading,
  backToDirectoryLabel,
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

  const renderBreadcrumb = () => (
    <nav aria-label={backToDirectoryLabel} class="mt-2 mb-6">
      <a
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        href={directoryHref}
      >
        <svg
          aria-hidden="true"
          class="size-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <path
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
        {backToDirectoryLabel}
      </a>
    </nav>
  )

  const renderEmptyState = () => (
    <div>
      {renderBreadcrumb()}
      <div class="py-12 text-center">
        <h1 class="text-2xl font-bold text-gray-900">{emptyStateTitle}</h1>
        <p class="mt-3 text-[15px] text-gray-600">{emptyStateBody}</p>
      </div>
    </div>
  )

  if (ids.length === 0) {
    return renderEmptyState()
  }

  // 1+ selected — render preschool results side-by-side
  const selectedSurveys = ids
    .map((id) => surveys.find((s) => s.id === id))
    .filter((s): s is PreschoolSurvey => s !== undefined)

  if (selectedSurveys.length === 0) {
    return renderEmptyState()
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
        class="w-px shrink-0 self-stretch bg-gray-200"
      ></div>
    )

  return (
    <div class="overflow-x-hidden pb-16">
      {renderBreadcrumb()}
      <header class="mb-10 flex flex-col gap-3">
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {heading} ({selectedSurveys.length})
        </h1>
        {ids.length === 1 && (
          <p
            class="mt-1 text-[15px] text-gray-600"
            data-testid="single-selection-prompt"
          >
            {singleSelectionPrompt}
          </p>
        )}
      </header>

      {/* Scroll hint — visible when more than 2 schools overflow on mobile */}
      {selectedSurveys.length > 2 && (
        <p
          aria-hidden="true"
          class="mb-3 flex items-center gap-1 text-xs text-gray-500 sm:hidden"
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
          class="snap-x snap-mandatory overflow-x-auto scroll-smooth"
          data-testid="comparison-scroll"
        >
          <div class="inline-flex flex-col gap-10">
            {/* Header Row */}
            <div class="flex gap-4">
              {selectedSurveys.map((survey, idx) => (
                <>
                  <div
                    class={`flex ${CARD_W} shrink-0 snap-start flex-col border-b border-gray-200 pb-4`}
                    key={survey.id}
                  >
                    <h2 class="text-xl font-bold tracking-tight text-gray-900">
                      <a
                        class="hover:text-primary-700 hover:underline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none"
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
              <div class="flex flex-col gap-6" key={question.text}>
                <div class="sticky left-0 z-10 flex w-fit max-w-[80vw] flex-col gap-2 bg-page pr-5">
                  <h3 class="text-[15px] font-bold text-gray-900">
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
                            class={`${CARD_W} shrink-0 snap-start rounded-xl border border-gray-200 bg-white p-6 shadow-sm`}
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
                          class={`flex ${CARD_W} shrink-0 snap-start flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md`}
                          key={survey.id}
                        >
                          <div
                            class={`text-[32px] leading-none font-extrabold ${scoreColor}`}
                          >
                            {agreeShare}%
                          </div>
                          <div class="mt-1 text-[13px] font-medium text-gray-600">
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

      {/* Summary section — best-per-question sentences (only when 2+ schools selected) */}
      {selectedSurveys.length >= 2 &&
        (() => {
          const names: Record<string, string> = {}
          for (const survey of selectedSurveys) {
            names[survey.id] = survey.preschoolName
          }
          const summary = computeBestPerQuestion(selectedSurveys)
          const sentences = formatBestPerQuestionText(summary, names, locale)
          if (sentences.length === 0) return null
          return (
            <section
              aria-labelledby="comparison-summary-heading"
              class="mt-10 rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm"
              data-testid="comparison-summary"
              role="region"
            >
              <h2
                class="mb-3 text-[15px] font-bold text-blue-950"
                id="comparison-summary-heading"
              >
                {summaryHeading}
              </h2>
              <ul class="space-y-2">
                {sentences.map((sentence, i) => (
                  <li class="text-sm font-medium text-blue-900" key={i}>
                    {sentence}
                  </li>
                ))}
              </ul>
            </section>
          )
        })()}
    </div>
  )
}
