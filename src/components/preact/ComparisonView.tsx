import { useStore } from '@nanostores/preact'
import { useState } from 'preact/hooks'

import type { Locale } from '@/i18n/utils'
import { OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import { compareIds } from '@/lib/state'
import type { PreschoolSurvey } from '@/lib/types'

import ComparisonCard from './ComparisonCard'
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

  const selectedCountHeading = selectedCountTemplate.replace(
    '{count}',
    String(selectedSurveys.length),
  )

  return (
    <div class="relative mx-auto max-w-2xl overflow-x-clip px-4 pt-4 pb-16 sm:px-0">
      {ids.length === 1 ? (
        <header class="mb-8 flex min-w-0 flex-col gap-2 border-l-4 border-primary-300 pl-4">
          <p
            class="text-base font-semibold text-gray-700"
            data-testid="selected-count-label"
          >
            {selectedCountHeading}
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
          {selectedCountHeading}
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
              {selectedSurveys.map((survey) => (
                <ComparisonCard
                  agreeShareLabel={agreeShareLabel}
                  categoryLabels={categoryLabels}
                  directoryHref={directoryHref}
                  isDimmed={
                    highlightedId !== null && highlightedId !== survey.id
                  }
                  isHighlighted={highlightedId === survey.id}
                  key={survey.id}
                  noDataLabel={noDataLabel}
                  onToggleHighlight={() =>
                    setHighlightedId(
                      highlightedId === survey.id ? null : survey.id,
                    )
                  }
                  question={question}
                  removeFromCompareLabel={removeFromCompareLabel}
                  survey={survey}
                />
              ))}
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
