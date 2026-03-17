import type { Locale } from '@/i18n/utils'
import { t } from '@/i18n/utils'

import type { BestPerQuestionSummary } from './summary'

export type SummaryNames = Record<string, string>

const LIST_CONJUNCTIONS: Record<Locale, string> = {
  sv: 'och',
  en: 'and',
  ar: 'و',
}

const joinNames = (
  items: Array<{ name: string; percent: number }>,
  locale: Locale,
): string => {
  const formatted = items.map((i) => `${i.name} (${i.percent}%)`)
  if (formatted.length <= 1) return formatted[0] ?? ''
  const conjunction = LIST_CONJUNCTIONS[locale]
  const last = formatted.pop()!
  return `${formatted.join(', ')} ${conjunction} ${last}`
}

export const formatBestPerQuestionText = (
  summary: BestPerQuestionSummary,
  names: SummaryNames,
  locale: Locale,
): string[] =>
  summary.questions.map((q) => {
    const bestName = names[q.bestId] ?? q.bestId

    if (q.tiedWithBest.length === 0) {
      return t('summary.bestForQuestion', locale, {
        name: bestName,
        percent: Math.round(q.bestAgreeShare),
        question: q.questionText,
      })
    }

    const allTied = [
      { name: bestName, percent: Math.round(q.bestAgreeShare) },
      ...q.tiedWithBest.map((s) => ({
        name: names[s.id] ?? s.id,
        percent: Math.round(s.agreeShare),
      })),
    ]

    return t('summary.tiedForQuestion', locale, {
      names: joinNames(allTied, locale),
      question: q.questionText,
    })
  })
