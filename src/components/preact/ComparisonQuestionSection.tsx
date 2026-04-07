import type { PreschoolSurvey, SurveyQuestion } from '@/lib/types'

import ComparisonCard from './ComparisonCard'

interface Props {
  question: SurveyQuestion
  questionIdx: number
  selectedSurveys: PreschoolSurvey[]
  highlightedId: string | null
  onToggleHighlight: (id: string | null) => void
  directoryHref: string
  categoryLabels: string[]
  labels: {
    agreeShare: string
    noData: string
    removeFromCompare: string
    responseRate: string
  }
}

export default function ComparisonQuestionSection({
  question,
  questionIdx,
  selectedSurveys,
  highlightedId,
  onToggleHighlight,
  directoryHref,
  categoryLabels,
  labels,
}: Props) {
  return (
    <section class="flex flex-col">
      <header class="mb-5 md:mb-6">
        <h3 class="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
          "{question.text}"
        </h3>
      </header>

      <ul class="flex flex-col gap-0 border-y-2 border-zinc-900">
        {selectedSurveys.map((survey, surveyIdx) => (
          <ComparisonCard
            agreeShareLabel={labels.agreeShare}
            categoryLabels={categoryLabels}
            chartIndex={questionIdx * selectedSurveys.length + surveyIdx + 1000}
            directoryHref={directoryHref}
            isDimmed={highlightedId !== null && highlightedId !== survey.id}
            isHighlighted={highlightedId === survey.id}
            key={survey.id}
            noDataLabel={labels.noData}
            onToggleHighlight={() =>
              onToggleHighlight(highlightedId === survey.id ? null : survey.id)
            }
            question={question}
            removeFromCompareLabel={labels.removeFromCompare}
            responseRateLabel={labels.responseRate}
            survey={survey}
          />
        ))}
      </ul>
    </section>
  )
}
