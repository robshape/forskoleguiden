import { useMemo } from 'preact/hooks'

import { computeBestPerQuestion } from '@/features/comparison/summary'
import { formatBestPerQuestionText } from '@/features/comparison/summaryText'
import type { Locale } from '@/i18n/utils'
import type { PreschoolSurvey } from '@/lib/types'

interface Props {
  selectedSurveys: PreschoolSurvey[]
  locale: Locale
  summaryHeading: string
}

export default function ComparisonSummary({
  selectedSurveys,
  locale,
  summaryHeading,
}: Props) {
  const sentences = useMemo(() => {
    if (selectedSurveys.length < 2) return []

    const names: Record<string, string> = {}
    for (const survey of selectedSurveys) {
      names[survey.id] = survey.preschoolName
    }

    const summary = computeBestPerQuestion(selectedSurveys)
    return formatBestPerQuestionText(summary, names, locale)
  }, [selectedSurveys, locale])

  if (selectedSurveys.length < 2 || sentences.length === 0) return null

  return (
    <section
      aria-labelledby="comparison-summary-heading"
      class="rounded-xl bg-primary-50 p-5 text-start ring-1 ring-primary-100 ring-inset"
      data-testid="comparison-summary"
      role="region"
    >
      <h2
        class="mb-3 text-base font-semibold text-primary-900"
        id="comparison-summary-heading"
      >
        {summaryHeading}
      </h2>
      <ul class="space-y-2 text-start">
        {sentences.map((sentence) => (
          <li class="text-sm text-primary-700" key={sentence}>
            {sentence}
          </li>
        ))}
      </ul>
    </section>
  )
}
