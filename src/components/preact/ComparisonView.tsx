import { useStore } from '@nanostores/preact'
import { useCallback, useEffect, useState } from 'preact/hooks'

import type { Locale } from '@/i18n/utils'
import { getBasePath } from '@/lib/base-path'
import { copyToClipboard } from '@/lib/clipboard'
import { interpolate } from '@/lib/interpolate'
import { OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import {
  decodeShareState,
  encodeShareState,
  validateShareIds,
} from '@/lib/share'
import { compareIds, setCompareIds } from '@/lib/state'
import type { PreschoolSurvey } from '@/lib/types'

import ComparisonCard from './ComparisonCard'
import ComparisonEmptyState from './ComparisonEmptyState'
import ComparisonSummary from './ComparisonSummary'
import ShareBox from './ShareBox'
import type { FeedbackState } from './ShareFeedback'
import ShareFeedback from './ShareFeedback'

const stripShareParam = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('s')
  window.history.replaceState({}, '', url.pathname + url.search)
}

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
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    kind: 'idle',
  })

  // Restore shared comparison from ?s= query param
  useEffect(() => {
    const params = new URL(window.location.href).searchParams
    const encoded = params.get('s')
    if (!encoded) return

    const payload = decodeShareState(encoded)
    if (!payload) {
      setFeedbackState({ kind: 'error' })
      stripShareParam()
      return
    }

    const { valid, invalid } = validateShareIds(payload, knownIds)

    if (valid.length > 0) {
      setCompareIds(valid)
    }

    if (invalid.length > 0 && valid.length > 0) {
      setFeedbackState({ kind: 'warning', invalidCount: invalid.length })
    } else if (valid.length === 0) {
      setFeedbackState({ kind: 'error' })
    }

    stripShareParam()
  }, [])

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

  if (ids.length === 0) {
    return (
      <>
        <ShareFeedback
          directoryHref={directoryHref}
          labels={{
            closeLabel: labels.shareClose,
            copiedLabel: labels.shareCopied,
            errorDirectoryLink: labels.shareErrorDirectoryLink,
            errorMessage: labels.shareErrorMessage,
            fallbackLabel: labels.shareFallback,
            warningTemplate: labels.shareWarningTemplate,
          }}
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
          labels={{
            closeLabel: labels.shareClose,
            copiedLabel: labels.shareCopied,
            errorDirectoryLink: labels.shareErrorDirectoryLink,
            errorMessage: labels.shareErrorMessage,
            fallbackLabel: labels.shareFallback,
            warningTemplate: labels.shareWarningTemplate,
          }}
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
        labels={{
          closeLabel: labels.shareClose,
          copiedLabel: labels.shareCopied,
          errorDirectoryLink: labels.shareErrorDirectoryLink,
          errorMessage: labels.shareErrorMessage,
          fallbackLabel: labels.shareFallback,
          warningTemplate: labels.shareWarningTemplate,
        }}
        onDismiss={dismissFeedback}
        state={feedbackState}
      />

      {/* Vertical Comparison Stack */}
      <div
        class="flex flex-col gap-16 md:gap-20"
        data-testid="comparison-scroll"
      >
        {questions.map((question, questionIdx) => (
          <section class="flex flex-col" key={question.text}>
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
                  chartIndex={
                    questionIdx * selectedSurveys.length + surveyIdx + 1000
                  }
                  directoryHref={directoryHref}
                  isDimmed={
                    highlightedId !== null && highlightedId !== survey.id
                  }
                  isHighlighted={highlightedId === survey.id}
                  key={survey.id}
                  noDataLabel={labels.noData}
                  onToggleHighlight={() =>
                    setHighlightedId(
                      highlightedId === survey.id ? null : survey.id,
                    )
                  }
                  question={question}
                  removeFromCompareLabel={labels.removeFromCompare}
                  responseRateLabel={labels.responseRate}
                  survey={survey}
                />
              ))}
            </ul>
          </section>
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
