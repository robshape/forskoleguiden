import { useStore } from '@nanostores/preact'
import { useCallback, useState } from 'preact/hooks'

import type { Locale } from '@/i18n/utils'
import { getBasePath } from '@/lib/base-path'
import { copyToClipboard } from '@/lib/clipboard'
import { interpolate } from '@/lib/interpolate'
import { OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import { encodeShareState } from '@/lib/share'
import { compareIds } from '@/lib/state'
import type { PreschoolSurvey } from '@/lib/types'

import ComparisonEmptyState from './ComparisonEmptyState'
import ComparisonQuestionSection from './ComparisonQuestionSection'
import ComparisonSummary from './ComparisonSummary'
import ShareBox from './ShareBox'
import ShareFeedback from './ShareFeedback'
import { useShareRestore } from './useShareRestore'

export interface ComparisonViewLabels {
  agreeShare: string
  emptyStateBody: string
  emptyStateTitle: string
  noData: string
  removeFromCompare: string
  responseRate: string
  selectedCountTemplate: string
  shareButton: string
  shareClose: string
  shareCopied: string
  shareDescription: string
  shareErrorDirectoryLink: string
  shareErrorMessage: string
  shareFallback: string
  shareTitle: string
  shareWarningTemplate: string
  singleSelectionPrompt: string
  summaryHeading: string
}

interface Props {
  /** 5 localized response category labels in RESPONSE_ROWS order */
  categoryLabels: string[]
  directoryHref: string
  knownIds: string[]
  labels: ComparisonViewLabels
  locale: Locale
  surveys: PreschoolSurvey[]
}

export default function ComparisonView({
  categoryLabels,
  directoryHref,
  knownIds,
  labels,
  locale,
  surveys,
}: Props) {
  const ids = useStore(compareIds)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const { feedbackState, setFeedbackState } = useShareRestore(knownIds)

  const handleShare = useCallback(async () => {
    if (feedbackState.kind !== 'idle') return
    const encoded = encodeShareState([...ids])
    const url = `${window.location.origin}${getBasePath()}/${locale}/jamfor/?s=${encoded}`
    const copied = await copyToClipboard(url)
    if (copied) {
      setFeedbackState({ kind: 'copied' })
    } else {
      setFeedbackState({ kind: 'fallback', url })
    }
  }, [feedbackState.kind, ids, locale])

  const dismissFeedback = useCallback(() => {
    setFeedbackState({ kind: 'idle' })
  }, [])

  const feedbackLabels = {
    closeLabel: labels.shareClose,
    copiedLabel: labels.shareCopied,
    errorDirectoryLink: labels.shareErrorDirectoryLink,
    errorMessage: labels.shareErrorMessage,
    fallbackLabel: labels.shareFallback,
    warningTemplate: labels.shareWarningTemplate,
  }

  if (ids.length === 0) {
    return (
      <>
        <ShareFeedback
          directoryHref={directoryHref}
          labels={feedbackLabels}
          onDismiss={dismissFeedback}
          state={feedbackState}
        />
        <ComparisonEmptyState
          emptyStateBody={labels.emptyStateBody}
          emptyStateTitle={labels.emptyStateTitle}
        />
      </>
    )
  }

  const selectedSurveys = ids
    .map((id) => surveys.find((s) => s.id === id))
    .filter((s): s is PreschoolSurvey => s !== undefined)

  if (selectedSurveys.length === 0) {
    return (
      <>
        <ShareFeedback
          directoryHref={directoryHref}
          labels={feedbackLabels}
          onDismiss={dismissFeedback}
          state={feedbackState}
        />
        <ComparisonEmptyState
          emptyStateBody={labels.emptyStateBody}
          emptyStateTitle={labels.emptyStateTitle}
        />
      </>
    )
  }

  const overallGroup =
    selectedSurveys[0]?.questionGroups.find(
      (g) => g.name === OVERALL_ASSESSMENT_GROUP,
    ) ?? null

  const questions = overallGroup?.questions ?? []

  const selectedCountHeading = interpolate(labels.selectedCountTemplate, {
    count: selectedSurveys.length,
  })

  return (
    <div class="relative mx-auto max-w-2xl overflow-x-clip pt-5 sm:pt-6">
      {ids.length === 1 ? (
        <header class="mb-8 flex min-w-0 flex-col gap-2 border-l-4 border-primary-300 pl-4 rtl:border-r-4 rtl:border-l-0 rtl:pr-4 rtl:pl-0">
          <p
            class="text-start text-base font-medium text-gray-700"
            data-testid="selected-count-label"
          >
            {selectedCountHeading}
          </p>
          <p
            class="text-start text-base text-gray-700"
            data-testid="single-selection-prompt"
          >
            {labels.singleSelectionPrompt}
          </p>
        </header>
      ) : (
        <p
          class="mb-8 text-start text-base font-medium text-gray-700"
          data-testid="selected-count-label"
        >
          {selectedCountHeading}
        </p>
      )}

      {ids.length >= 2 && (
        <ShareBox
          buttonLabel={labels.shareButton}
          descriptionLabel={labels.shareDescription}
          disabled={feedbackState.kind !== 'idle'}
          onShare={handleShare}
          titleLabel={labels.shareTitle}
        />
      )}

      <ShareFeedback
        directoryHref={directoryHref}
        labels={feedbackLabels}
        onDismiss={dismissFeedback}
        state={feedbackState}
      />

      {/* Vertical Comparison Stack */}
      <div
        class="flex flex-col gap-16 md:gap-20"
        data-testid="comparison-scroll"
      >
        {questions.map((question, questionIdx) => (
          <ComparisonQuestionSection
            categoryLabels={categoryLabels}
            directoryHref={directoryHref}
            highlightedId={highlightedId}
            key={question.text}
            labels={{
              agreeShare: labels.agreeShare,
              noData: labels.noData,
              removeFromCompare: labels.removeFromCompare,
              responseRate: labels.responseRate,
            }}
            onToggleHighlight={setHighlightedId}
            question={question}
            questionIdx={questionIdx}
            selectedSurveys={selectedSurveys}
          />
        ))}
      </div>

      {/* Summary Box */}
      {ids.length >= 2 && (
        <div class="mt-10">
          <ComparisonSummary
            locale={locale}
            selectedSurveys={selectedSurveys}
            summaryHeading={labels.summaryHeading}
          />
        </div>
      )}
    </div>
  )
}
