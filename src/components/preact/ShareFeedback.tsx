import { useEffect } from 'preact/hooks'

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
  useEffect(() => {
    if (state.kind !== 'copied') return
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [state.kind, onDismiss])

  if (state.kind === 'idle') return null

  if (state.kind === 'copied') {
    return (
      <p
        class="mt-2 text-sm font-medium text-green-700"
        data-testid="share-feedback-copied"
        role="status"
      >
        {labels.copiedLabel}
      </p>
    )
  }

  if (state.kind === 'fallback') {
    return (
      <div
        class="mt-2 flex items-center gap-2"
        data-testid="share-feedback-fallback"
        role="status"
      >
        <label class="text-sm text-gray-700">
          {labels.fallbackLabel}
          <input
            class="ml-2 rounded-sm border border-gray-300 px-2 py-1 text-sm rtl:mr-2 rtl:ml-0"
            onClick={(e) => (e.target as HTMLInputElement).select()}
            readOnly
            type="text"
            value={state.url}
          />
        </label>
        <button
          class="min-h-11 rounded-sm px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none"
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
        class="mt-2 flex items-center gap-2 rounded-sm bg-amber-50 px-3 py-2 text-sm text-amber-800"
        data-testid="share-feedback-warning"
        role="status"
      >
        <p>
          {labels.warningTemplate.replace(
            '{count}',
            String(state.invalidCount),
          )}
        </p>
        <button
          class="min-h-11 rounded-sm px-2 py-1 text-sm hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none"
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
      class="mt-2 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-800"
      data-testid="share-feedback-error"
      role="alert"
    >
      <p>{labels.errorMessage}</p>
      <a
        class="mt-1 inline-block font-medium underline hover:text-red-900 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none"
        href={directoryHref}
      >
        {labels.errorDirectoryLink}
      </a>
    </div>
  )
}
