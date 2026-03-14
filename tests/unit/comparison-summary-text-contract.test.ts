import { describe, expect, it } from 'vitest'

import type {
  ComparisonSummary,
  PairSummary,
  QuestionSummary,
} from '@/features/comparison/summary'
import {
  formatSummaryText,
  type FormattedSummary,
  type SummaryNames,
} from '@/features/comparison/summaryText'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const QUESTION_TEXT = 'Overall satisfaction'

const NAMES: SummaryNames = {
  alpha: 'Alfa Förskola',
  beta: 'Beta Förskola',
}

const makeQuestion = (
  overrides: Partial<QuestionSummary> & {
    baseAgreeShare: number
    targetAgreeShare: number
  },
): QuestionSummary => {
  const delta = overrides.targetAgreeShare - overrides.baseAgreeShare
  const classification =
    delta >= 5 ? 'higher' : delta <= -5 ? 'lower' : 'similar'

  return {
    questionText: QUESTION_TEXT,
    delta,
    classification,
    ...overrides,
  }
}

const makeSummary = (question: QuestionSummary): ComparisonSummary => {
  const pair: PairSummary = {
    baseId: 'alpha',
    targetId: 'beta',
    questions: [question],
  }

  return { pairs: [pair] }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('formatSummaryText — sentence generation per classification', () => {
  describe('when the target preschool scores higher than the base', () => {
    it('produces a Swedish sentence naming the target as having higher agree share', () => {
      const question = makeQuestion({
        baseAgreeShare: 60,
        targetAgreeShare: 80,
      })

      const summary = makeSummary(question)
      const result: FormattedSummary = formatSummaryText(summary, NAMES, 'sv')

      expect(result.pairs).toHaveLength(1)
      expect(result.pairs[0]?.sentences).toHaveLength(1)
      expect(result.pairs[0]?.sentences[0]).toBe(
        'Beta Förskola (80%) har högre andel instämmande svar än Alfa Förskola (60%) för "Overall satisfaction".',
      )
    })
  })

  describe('when the target preschool scores lower than the base', () => {
    it('produces a Swedish sentence naming the target as having lower agree share', () => {
      const question = makeQuestion({
        baseAgreeShare: 65,
        targetAgreeShare: 40,
      })

      const summary = makeSummary(question)
      const result: FormattedSummary = formatSummaryText(summary, NAMES, 'sv')

      expect(result.pairs[0]?.sentences[0]).toBe(
        'Beta Förskola (40%) har lägre andel instämmande svar än Alfa Förskola (65%) för "Overall satisfaction".',
      )
    })
  })

  describe('when the target and base preschools have a similar agree share', () => {
    it('produces a symmetric Swedish sentence listing base first then target', () => {
      const question = makeQuestion({
        baseAgreeShare: 73,
        targetAgreeShare: 70,
      })

      const summary = makeSummary(question)
      const result: FormattedSummary = formatSummaryText(summary, NAMES, 'sv')

      expect(result.pairs[0]?.sentences[0]).toBe(
        'Alfa Förskola (73%) och Beta Förskola (70%) har liknande andel instämmande svar för "Overall satisfaction".',
      )
    })
  })

  describe('output structure', () => {
    it('mirrors the pair structure from the input summary', () => {
      const question = makeQuestion({
        baseAgreeShare: 80,
        targetAgreeShare: 80,
      })

      const summary = makeSummary(question)
      const result = formatSummaryText(summary, NAMES, 'sv')

      expect(result.pairs[0]?.baseId).toBe('alpha')
      expect(result.pairs[0]?.targetId).toBe('beta')
    })

    it('returns an empty pairs array when the summary has no pairs', () => {
      const result = formatSummaryText({ pairs: [] }, NAMES, 'sv')

      expect(result.pairs).toHaveLength(0)
    })

    it('falls back to the raw preschool ID when the name is not in the names map', () => {
      const question = makeQuestion({
        baseAgreeShare: 60,
        targetAgreeShare: 80,
      })

      const summary = makeSummary(question)
      const result = formatSummaryText(summary, {}, 'sv')

      expect(result.pairs[0]?.sentences[0]).toContain('beta')
      expect(result.pairs[0]?.sentences[0]).toContain('alpha')
    })
  })
})

// ─── Phase 3: Edge Cases ───────────────────────────────────────────────────────

describe('formatSummaryText — multi-question pair', () => {
  it('produces one sentence per question when a pair has multiple questions', () => {
    const q1 = makeQuestion({
      questionText: 'Question One',
      baseAgreeShare: 60,
      targetAgreeShare: 80,
    })
    const q2 = makeQuestion({
      questionText: 'Question Two',
      baseAgreeShare: 75,
      targetAgreeShare: 70,
    })

    const pair: PairSummary = {
      baseId: 'alpha',
      targetId: 'beta',
      questions: [q1, q2],
    }
    const summary: ComparisonSummary = { pairs: [pair] }

    const result = formatSummaryText(summary, NAMES, 'sv')

    expect(result.pairs).toHaveLength(1)
    expect(result.pairs[0]?.sentences).toHaveLength(2)
    expect(result.pairs[0]?.sentences[0]).toBe(
      'Beta Förskola (80%) har högre andel instämmande svar än Alfa Förskola (60%) för "Question One".',
    )
    expect(result.pairs[0]?.sentences[1]).toBe(
      'Beta Förskola (70%) har lägre andel instämmande svar än Alfa Förskola (75%) för "Question Two".',
    )
  })
})

describe('formatSummaryText — multi-pair summary', () => {
  const NAMES_WITH_GAMMA: SummaryNames = {
    alpha: 'Alfa Förskola',
    beta: 'Beta Förskola',
    gamma: 'Gamma Förskola',
  }

  it('produces one FormattedPair per input pair preserving order and IDs', () => {
    const qAB = makeQuestion({ baseAgreeShare: 60, targetAgreeShare: 80 })
    const qAG = makeQuestion({ baseAgreeShare: 60, targetAgreeShare: 55 })

    const summary: ComparisonSummary = {
      pairs: [
        { baseId: 'alpha', targetId: 'beta', questions: [qAB] },
        { baseId: 'alpha', targetId: 'gamma', questions: [qAG] },
      ],
    }

    const result = formatSummaryText(summary, NAMES_WITH_GAMMA, 'sv')

    expect(result.pairs).toHaveLength(2)
    expect(result.pairs[0]?.baseId).toBe('alpha')
    expect(result.pairs[0]?.targetId).toBe('beta')
    expect(result.pairs[1]?.baseId).toBe('alpha')
    expect(result.pairs[1]?.targetId).toBe('gamma')
  })

  it('generates correct sentences for each pair independently', () => {
    // qAB: delta +20 → higher; qAG: delta -4 → similar (boundary: -5 is 'lower')
    const qAB = makeQuestion({ baseAgreeShare: 60, targetAgreeShare: 80 })
    const qAG = makeQuestion({ baseAgreeShare: 60, targetAgreeShare: 56 })

    const summary: ComparisonSummary = {
      pairs: [
        { baseId: 'alpha', targetId: 'beta', questions: [qAB] },
        { baseId: 'alpha', targetId: 'gamma', questions: [qAG] },
      ],
    }

    const result = formatSummaryText(summary, NAMES_WITH_GAMMA, 'sv')

    expect(result.pairs[0]?.sentences[0]).toBe(
      'Beta Förskola (80%) har högre andel instämmande svar än Alfa Förskola (60%) för "Overall satisfaction".',
    )
    expect(result.pairs[1]?.sentences[0]).toBe(
      'Alfa Förskola (60%) och Gamma Förskola (56%) har liknande andel instämmande svar för "Overall satisfaction".',
    )
  })
})

describe('formatSummaryText — float rounding', () => {
  it('rounds fractional agree-share percentages to the nearest integer in the sentence', () => {
    const question: QuestionSummary = {
      questionText: QUESTION_TEXT,
      baseAgreeShare: 66.7,
      targetAgreeShare: 84.3,
      delta: 17.6,
      classification: 'higher',
    }

    const summary = makeSummary(question)
    const result = formatSummaryText(summary, NAMES, 'sv')

    expect(result.pairs[0]?.sentences[0]).toBe(
      'Beta Förskola (84%) har högre andel instämmande svar än Alfa Förskola (67%) för "Overall satisfaction".',
    )
  })
})

describe('formatSummaryText — locale smoke coverage', () => {
  describe('English locale', () => {
    it('produces an English sentence for the higher classification', () => {
      const question = makeQuestion({
        baseAgreeShare: 60,
        targetAgreeShare: 80,
      })

      const summary = makeSummary(question)
      const result = formatSummaryText(summary, NAMES, 'en')

      expect(result.pairs[0]?.sentences[0]).toBe(
        'Beta Förskola (80%) has a higher share of agree responses than Alfa Förskola (60%) for "Overall satisfaction".',
      )
    })

    it('produces an English sentence for the lower classification', () => {
      const question = makeQuestion({
        baseAgreeShare: 65,
        targetAgreeShare: 40,
      })

      const summary = makeSummary(question)
      const result = formatSummaryText(summary, NAMES, 'en')

      expect(result.pairs[0]?.sentences[0]).toBe(
        'Beta Förskola (40%) has a lower share of agree responses than Alfa Förskola (65%) for "Overall satisfaction".',
      )
    })

    it('produces an English sentence for the similar classification', () => {
      const question = makeQuestion({
        baseAgreeShare: 73,
        targetAgreeShare: 70,
      })

      const summary = makeSummary(question)
      const result = formatSummaryText(summary, NAMES, 'en')

      expect(result.pairs[0]?.sentences[0]).toBe(
        'Alfa Förskola (73%) and Beta Förskola (70%) have a similar share of agree responses for "Overall satisfaction".',
      )
    })
  })

  describe('Arabic locale', () => {
    it('produces an Arabic sentence for the higher classification', () => {
      const question = makeQuestion({
        baseAgreeShare: 60,
        targetAgreeShare: 80,
      })

      const summary = makeSummary(question)
      const result = formatSummaryText(summary, NAMES, 'ar')

      expect(result.pairs[0]?.sentences[0]).toBe(
        'لدى Beta Förskola (80%) نسبة أعلى من الردود المتفقة مقارنةً بـ Alfa Förskola (60%) لسؤال "Overall satisfaction".',
      )
    })

    it('produces an Arabic sentence for the lower classification', () => {
      const question = makeQuestion({
        baseAgreeShare: 65,
        targetAgreeShare: 40,
      })

      const summary = makeSummary(question)
      const result = formatSummaryText(summary, NAMES, 'ar')

      expect(result.pairs[0]?.sentences[0]).toBe(
        'لدى Beta Förskola (40%) نسبة أقل من الردود المتفقة مقارنةً بـ Alfa Förskola (65%) لسؤال "Overall satisfaction".',
      )
    })

    it('produces an Arabic sentence for the similar classification', () => {
      const question = makeQuestion({
        baseAgreeShare: 73,
        targetAgreeShare: 70,
      })

      const summary = makeSummary(question)
      const result = formatSummaryText(summary, NAMES, 'ar')

      expect(result.pairs[0]?.sentences[0]).toBe(
        'لدى Alfa Förskola (73%) و Beta Förskola (70%) نسبة متشابهة من الردود المتفقة لسؤال "Overall satisfaction".',
      )
    })
  })
})
