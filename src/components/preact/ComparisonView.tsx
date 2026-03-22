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
  surveys: PreschoolSurvey[]
  /** 5 localized response category labels in RESPONSE_ROWS order */
  categoryLabels: string[]
  locale: Locale
  compareAddLabel: string
  compareAddedLabel: string
  compareAriaLabelTemplate: string
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

      {/* Selected Schools List */}
      <div class="mb-12 flex flex-col gap-0 rounded-2xl border border-border bg-surface shadow-xs">
        {selectedSurveys.map((survey) => (
          <div
            class="flex items-center justify-between gap-4 border-b border-border/50 p-4 last:border-0 sm:px-6 sm:py-5"
            key={`school-list-${survey.id}`}
          >
            <h2 class="min-w-0 text-[17px] leading-tight font-bold tracking-tight wrap-break-word text-gray-900">
              <a
                class="hover:text-primary-700 hover:underline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                href={`${directoryHref}forskola/${survey.id}/?from=compare`}
              >
                {survey.preschoolName}
              </a>
            </h2>
            <div class="shrink-0">
              <CompareButton
                addedLabel={compareAddedLabel}
                addLabel={compareAddLabel}
                ariaLabelTemplate={compareAriaLabelTemplate}
                id={survey.id}
                name={survey.preschoolName}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Vertical Comparison Stack */}
      <div class="mb-16 flex flex-col gap-12" data-testid="comparison-scroll">
        {questions.map((question) => (
          <section class="flex flex-col" key={question.text}>
            <header class="mb-5 border-b border-gray-200 pb-3">
              <h3 class="text-base/snug font-bold text-gray-900 sm:text-[17px]">
                "{question.text}"
              </h3>
            </header>

            <ul class="flex flex-col gap-0">
              {selectedSurveys.map((survey) => {
                const group = survey.questionGroups.find(
                  (g) => g.name === OVERALL_ASSESSMENT_GROUP,
                )
                const cell = group?.questions.find(
                  (candidate) => candidate.text === question.text,
                )

                if (!cell) {
                  return (
                    <li
                      class="border-b border-gray-100 last:border-0"
                      key={survey.id}
                    >
                      <div class="-mx-2 flex items-center justify-between gap-4 px-2 py-3 sm:-mx-4 sm:p-4">
                        <span class="min-w-0 text-[15px] wrap-break-word text-gray-600">
                          {survey.preschoolName}
                        </span>
                        <span class="shrink-0 text-base font-medium text-gray-400">
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
                    class="border-b border-gray-100 last:border-0"
                    key={survey.id}
                  >
                    <div class="relative -mx-2 flex items-center justify-between gap-4 px-2 py-3 sm:-mx-4 sm:p-4">
                      <div class="min-w-0">
                        <span class="text-[15px] font-medium wrap-break-word text-gray-700">
                          {survey.preschoolName}
                        </span>
                      </div>

                      <div class="flex shrink-0 flex-col items-center">
                        <div
                          class={`text-[28px] leading-none font-extrabold tracking-tight sm:text-[32px] ${scoreColor}`}
                        >
                          {agreeShare}%
                        </div>
                        <div class="mt-0.5 text-[13px] font-medium text-gray-500">
                          {agreeShareLabel}
                        </div>

                        {/* Screen-reader fallback data */}
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
                      </div>
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
