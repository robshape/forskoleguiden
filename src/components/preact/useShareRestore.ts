import { useEffect, useState } from 'preact/hooks'

import { decodeShareState, validateShareIds } from '@/lib/share'
import { setCompareIds } from '@/lib/state'

import type { FeedbackState } from './ShareFeedback'

const stripShareParam = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('s')
  window.history.replaceState({}, '', url.pathname + url.search)
}

/**
 * Restores a shared comparison from the `?s=` query parameter.
 * Returns feedback state for UI display (warning/error if IDs are stale).
 */
export const useShareRestore = (knownIds: string[]) => {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    kind: 'idle',
  })

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
  }, [knownIds])

  return { feedbackState, setFeedbackState }
}
