import { useEffect, useId } from 'preact/hooks'

import { CHECK_24_STROKE_PATH, WARNING_24_STROKE_PATH } from '@/lib/icons'
import { interpolate } from '@/lib/interpolate'

export type FeedbackState =
  | { kind: 'idle' }
  | { kind: 'copied' }
  | { kind: 'fallback'; url: string }
  | { kind: 'warning'; invalidCount: number }
  | { kind: 'error' }

interface Labels {
  copiedLabel: string
  fallbackLabel: string
  closeLabel: string
  warningTemplate: string
  errorMessage: string
  errorDirectoryLink: string
}

interface Props {
  directoryHref: string
  labels: Labels
  onDismiss: () => void
  state: FeedbackState
}

const AUTO_DISMISS_MS = 2500

export default function ShareFeedback({
  directoryHref,
  labels,
  onDismiss,
  state,
}: Props) {
  const shareUrlId = useId()

  useEffect(() => {
    if (state.kind !== 'copied') return
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [state.kind, onDismiss])

  if (state.kind === 'idle') return null

  if (state.kind === 'copied') {
    return (
      <div
        class="mt-2 mb-8 flex animate-feedback-in items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800 ring-1 ring-green-600/20 ring-inset"
        data-testid="share-feedback-copied"
        role="status"
      >
        <svg
          aria-hidden="true"
          class="size-5 text-green-600"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            d={CHECK_24_STROKE_PATH}
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {labels.copiedLabel}
      </div>
    )
  }

  if (state.kind === 'fallback') {
    return (
      <div
        class="mt-2 mb-8 flex animate-feedback-in flex-col items-start justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3 ring-1 ring-gray-200 ring-inset sm:flex-row sm:items-center"
        data-testid="share-feedback-fallback"
        role="status"
      >
        <div class="flex w-full flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label
            class="text-sm font-medium whitespace-nowrap text-gray-700"
            htmlFor={shareUrlId}
          >
            {labels.fallbackLabel}
          </label>
          <input
            class="w-full rounded-md border-0 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-primary-600 focus:ring-inset rtl:mr-2 rtl:ml-0"
            id={shareUrlId}
            onClick={(e) => (e.target as HTMLInputElement).select()}
            readOnly
            type="text"
            value={state.url}
          />
        </div>
        <button
          class="min-h-[44px] w-full shrink-0 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 transition-colors ring-inset hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none sm:w-auto"
          onClick={onDismiss}
          type="button"
        >
          {labels.closeLabel}
        </button>
      </div>
    )
  }

  if (state.kind === 'warning') {
    return (
      <div
        class="mt-2 mb-8 flex animate-feedback-in items-center justify-between gap-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-600/20 ring-inset"
        data-testid="share-feedback-warning"
        role="status"
      >
        <p class="font-medium">
          {interpolate(labels.warningTemplate, {
            count: state.invalidCount,
          })}
        </p>
        <button
          class="min-h-[44px] shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none"
          onClick={onDismiss}
          type="button"
        >
          {labels.closeLabel}
        </button>
      </div>
    )
  }

  // error
  return (
    <div
      class="mt-2 mb-8 animate-feedback-in rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-600/20 ring-inset"
      data-testid="share-feedback-error"
      role="alert"
    >
      <div class="mb-1 flex items-center gap-2">
        <svg
          aria-hidden="true"
          class="size-5 text-red-600"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            d={WARNING_24_STROKE_PATH}
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="font-medium">{labels.errorMessage}</p>
      </div>
      <a
        class="mt-2 inline-block font-medium underline underline-offset-2 hover:text-red-900 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none"
        href={directoryHref}
      >
        {labels.errorDirectoryLink}
      </a>
    </div>
  )
}
