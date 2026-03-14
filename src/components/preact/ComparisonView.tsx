import { useStore } from '@nanostores/preact'
import type { PreschoolSurvey, SurveyResponse } from '@/lib/types'
import { compareIds } from '@/lib/state'
import { OVERALL_ASSESSMENT_GROUP, computeAgreeShare } from '@/lib/scoring'
import BarChart from './BarChart'

interface Props {
  heading: string
  directoryHref: string
  emptyStateTitle: string
  emptyStateBody: string
  singleSelectionPrompt: string
  questionColumnLabel: string
  backToDirectoryLabel: string
  surveys: PreschoolSurvey[]
  /** 5 localized response category labels in RESPONSE_ROWS order */
  categoryLabels: string[]
  /** Template for the chart aria-label; "{question}" is replaced with question text */
  chartAriaLabelTemplate: string
}

export default function ComparisonView({
  heading,
  directoryHref,
  emptyStateTitle,
  emptyStateBody,
  singleSelectionPrompt,
  questionColumnLabel,
  backToDirectoryLabel,
  surveys,
  categoryLabels,
  chartAriaLabelTemplate,
}: Props) {
  const ids = useStore(compareIds)

  const renderEmptyState = () => (
    <div class="py-12 text-center">
      <h1 class="text-2xl font-bold text-gray-900">{emptyStateTitle}</h1>
      <p class="mt-3 text-gray-600">{emptyStateBody}</p>
      <a
        href={directoryHref}
        class="mt-6 inline-flex items-center text-sm text-primary-700 hover:underline"
      >
        ← {backToDirectoryLabel}
      </a>
    </div>
  )

  if (ids.length === 0) {
    return renderEmptyState()
  }

  // 1+ selected: render the preschool results table; show a prompt when only one is selected
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

  return (
    <div class="py-8">
      <h1 class="text-2xl font-bold text-gray-900">{heading}</h1>
      {ids.length === 1 && (
        <p class="mt-3 text-gray-600" data-testid="single-selection-prompt">
          {singleSelectionPrompt}
        </p>
      )}
      <a
        href={directoryHref}
        class="mt-4 inline-flex items-center text-sm text-primary-700 hover:underline"
      >
        ← {backToDirectoryLabel}
      </a>
      <div data-testid="comparison-scroll" class="mt-6 overflow-x-auto">
        <table
          aria-label={heading}
          data-testid="comparison-table"
          class="w-auto min-w-full border-collapse text-sm"
        >
          <caption class="sr-only">{heading}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                class="sticky left-0 z-10 w-32 min-w-32 bg-white px-4 py-3 text-left font-medium text-gray-500"
              >
                {questionColumnLabel}
              </th>
              {selectedSurveys.map((survey) => (
                <th
                  key={survey.id}
                  scope="col"
                  class="min-w-40 px-4 py-3 text-left font-semibold text-gray-900"
                >
                  {survey.preschoolName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((question, qi) => (
              <tr
                key={question.text}
                class={qi % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <th
                  scope="row"
                  class={`sticky left-0 z-10 px-4 py-3 text-left font-normal text-gray-700 ${
                    qi % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {question.text}
                </th>
                {selectedSurveys.map((survey) => {
                  const group = survey.questionGroups.find(
                    (g) => g.name === OVERALL_ASSESSMENT_GROUP,
                  )
                  const cell = group?.questions.find(
                    (candidate) => candidate.text === question.text,
                  )
                  const pct = cell
                    ? Math.round(computeAgreeShare(cell.response))
                    : null
                  return (
                    <td key={survey.id} class="px-4 py-3 text-gray-900">
                      {pct !== null ? `${pct}%` : '—'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div class="mt-8 space-y-6">
        {questions.map((question, qi) => {
          const chartResponses: SurveyResponse[] = []
          const chartNames: string[] = []

          for (const survey of selectedSurveys) {
            const group = survey.questionGroups.find(
              (g) => g.name === OVERALL_ASSESSMENT_GROUP,
            )
            const q = group?.questions.find((c) => c.text === question.text)
            if (q) {
              chartResponses.push(q.response)
              chartNames.push(survey.preschoolName)
            }
          }

          if (chartResponses.length === 0) return null

          return (
            <div key={question.text}>
              <h2 class="mb-2 text-sm font-semibold text-gray-800">
                {question.text}
              </h2>
              <BarChart
                responses={chartResponses}
                preschoolNames={chartNames}
                questionText={question.text}
                categoryLabels={categoryLabels}
                ariaLabelTemplate={chartAriaLabelTemplate}
                chartIndex={qi}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
