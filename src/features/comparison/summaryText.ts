import type { Locale } from '@/i18n/utils'
import { t } from '@/i18n/utils'

import type { ComparisonSummary } from './summary'

export type SummaryNames = Record<string, string>

export type FormattedPair = {
  baseId: string
  targetId: string
  sentences: string[]
}

export type FormattedSummary = {
  pairs: FormattedPair[]
}

export const formatSummaryText = (
  summary: ComparisonSummary,
  names: SummaryNames,
  locale: Locale,
): FormattedSummary => {
  const pairs = summary.pairs.map((pair) => {
    const baseName = names[pair.baseId] ?? pair.baseId
    const targetName = names[pair.targetId] ?? pair.targetId

    const sentences = pair.questions.map((question) => {
      const { classification, baseAgreeShare, targetAgreeShare, questionText } =
        question

      // For 'higher'/'lower', the target is the subject of the sentence
      // (the one described as having the higher/lower share). For 'similar'
      // the pair is symmetric so base is listed first for determinism.
      const isDirectional =
        classification === 'higher' || classification === 'lower'

      const left = isDirectional ? targetName : baseName
      const leftPercent = Math.round(
        isDirectional ? targetAgreeShare : baseAgreeShare,
      )
      const right = isDirectional ? baseName : targetName
      const rightPercent = Math.round(
        isDirectional ? baseAgreeShare : targetAgreeShare,
      )

      return t(`summary.${classification}`, locale, {
        left,
        leftPercent,
        right,
        rightPercent,
        question: questionText,
      })
    })

    return { baseId: pair.baseId, targetId: pair.targetId, sentences }
  })

  return { pairs }
}
