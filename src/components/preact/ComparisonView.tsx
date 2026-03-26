import { useStore } from '@nanostores/preact'
import { useCallback, useEffect, useState } from 'preact/hooks'

import type { Locale } from '@/i18n/utils'
import { getBasePath } from '@/lib/base-path'
import { copyToClipboard } from '@/lib/clipboard'
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
import type { FeedbackState } from './ShareFeedback'
import ShareFeedback from './ShareFeedback'

const stripShareParam = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('s')
  window.history.replaceState({}, '', url.pathname + url.search)
}

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
  shareButtonLabel: string
  shareTitleLabel: string
  shareDescriptionLabel: string
  shareCopiedLabel: string
  shareFallbackLabel: string
  shareCloseLabel: string
  shareWarningTemplate: string
  shareErrorMessage: string
  shareErrorDirectoryLink: string
  knownIds: string[]
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
  shareButtonLabel,
  shareTitleLabel,
  shareDescriptionLabel,
  shareCopiedLabel,
  shareFallbackLabel,
  shareCloseLabel,
  shareWarningTemplate,
  shareErrorMessage,
  shareErrorDirectoryLink,
  knownIds,
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
            closeLabel: shareCloseLabel,
            copiedLabel: shareCopiedLabel,
            errorDirectoryLink: shareErrorDirectoryLink,
            errorMessage: shareErrorMessage,
            fallbackLabel: shareFallbackLabel,
            warningTemplate: shareWarningTemplate,
          }}
          onDismiss={dismissFeedback}
          state={feedbackState}
        />
        <ComparisonEmptyState
          emptyStateBody={emptyStateBody}
          emptyStateTitle={emptyStateTitle}
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
            closeLabel: shareCloseLabel,
            copiedLabel: shareCopiedLabel,
            errorDirectoryLink: shareErrorDirectoryLink,
            errorMessage: shareErrorMessage,
            fallbackLabel: shareFallbackLabel,
            warningTemplate: shareWarningTemplate,
          }}
          onDismiss={dismissFeedback}
          state={feedbackState}
        />
        <ComparisonEmptyState
          emptyStateBody={emptyStateBody}
          emptyStateTitle={emptyStateTitle}
        />
      </>
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
            {singleSelectionPrompt}
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
        <div class="mb-10 flex flex-col gap-4 sm:gap-6">
          {/* Share Box */}
          <div
            class="flex flex-col gap-4 rounded-xl bg-primary-50 p-5 ring-1 ring-primary-100 ring-inset sm:flex-row sm:items-center sm:justify-between"
            data-testid="share-box"
          >
            <div class="flex flex-col gap-1">
              <p class="text-base font-semibold text-primary-900">
                {shareTitleLabel}
              </p>
              <p class="text-sm text-primary-700">{shareDescriptionLabel}</p>
            </div>
            <button
              class="min-h-11 w-full shrink-0 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:opacity-50 sm:w-auto"
              data-testid="share-comparison-button"
              disabled={feedbackState.kind !== 'idle'}
              onClick={handleShare}
              type="button"
            >
              {shareButtonLabel}
            </button>
          </div>
        </div>
      )}

      <ShareFeedback
        directoryHref={directoryHref}
        labels={{
          closeLabel: shareCloseLabel,
          copiedLabel: shareCopiedLabel,
          errorDirectoryLink: shareErrorDirectoryLink,
          errorMessage: shareErrorMessage,
          fallbackLabel: shareFallbackLabel,
          warningTemplate: shareWarningTemplate,
        }}
        onDismiss={dismissFeedback}
        state={feedbackState}
      />

      {/* Vertical Comparison Stack */}
      <div
        class="flex flex-col gap-16 md:gap-20"
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

      {/* Summary Box */}
      {ids.length >= 2 && (
        <div class="mt-10">
          <ComparisonSummary
            locale={locale}
            selectedSurveys={selectedSurveys}
            summaryHeading={summaryHeading}
          />
        </div>
      )}
    </div>
  )
}
