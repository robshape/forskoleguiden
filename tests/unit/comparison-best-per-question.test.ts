import { describe, expect, it } from 'vitest'

import {
  computeBestPerQuestion,
  type QuestionBest,
} from '@/features/comparison/summary'
import {
  formatBestPerQuestionText,
  type SummaryNames,
} from '@/features/comparison/summaryText'
import { OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import type { PreschoolSurvey } from '@/lib/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeSurveyWith = (
  id: string,
  questions: Array<{ text: string; agreeShare: number }>,
): PreschoolSurvey => ({
  id,
  preschoolName: `Förskolan ${id}`,
  address: 'Testvägen 1, Malmö',
  surveyYear: 2025,
  totalRespondentsPercent: 80,
  questionGroups: [
    {
      name: OVERALL_ASSESSMENT_GROUP,
      questions: questions.map(({ text, agreeShare }) => ({
        text,
        response: {
          completelyAgreePercent: agreeShare,
          partlyAgreePercent: 0,
          neitherAgreeNorDisagreePercent: 100 - agreeShare,
          partlyDisagreePercent: 0,
          completelyDisagreePercent: 0,
        },
      })),
    },
  ],
})

const NAMES: SummaryNames = {
  alpha: 'Alfa Förskola',
  beta: 'Beta Förskola',
  gamma: 'Gamma Förskola',
  delta: 'Delta Förskola',
  epsilon: 'Epsilon Förskola',
}

// ─── computeBestPerQuestion tests ────────────────────────────────────────────

describe('computeBestPerQuestion', () => {
  it('returns empty questions given fewer than two surveys', () => {
    const survey = makeSurveyWith('alpha', [{ text: 'Q1', agreeShare: 80 }])
    expect(computeBestPerQuestion([survey]).questions).toHaveLength(0)
    expect(computeBestPerQuestion([]).questions).toHaveLength(0)
  })

  it('identifies the clear best school per question when the gap exceeds threshold', () => {
    const surveyA = makeSurveyWith('alpha', [
      { text: 'Q1', agreeShare: 80 },
      { text: 'Q2', agreeShare: 60 },
    ])
    const surveyB = makeSurveyWith('beta', [
      { text: 'Q1', agreeShare: 70 },
      { text: 'Q2', agreeShare: 90 },
    ])

    const result = computeBestPerQuestion([surveyA, surveyB])

    expect(result.questions).toHaveLength(2)
    expect(result.questions[0].bestId).toBe('alpha')
    expect(result.questions[0].bestAgreeShare).toBe(80)
    expect(result.questions[0].tiedWithBest).toHaveLength(0)
    expect(result.questions[1].bestId).toBe('beta')
    expect(result.questions[1].bestAgreeShare).toBe(90)
    expect(result.questions[1].tiedWithBest).toHaveLength(0)
  })

  it('marks schools as tied when within the 5pp threshold of the best', () => {
    const surveyA = makeSurveyWith('alpha', [{ text: 'Q1', agreeShare: 80 }])
    const surveyB = makeSurveyWith('beta', [{ text: 'Q1', agreeShare: 77 }])

    const result = computeBestPerQuestion([surveyA, surveyB])

    expect(result.questions[0].bestId).toBe('alpha')
    expect(result.questions[0].tiedWithBest).toHaveLength(1)
    expect(result.questions[0].tiedWithBest[0].id).toBe('beta')
    expect(result.questions[0].tiedWithBest[0].agreeShare).toBe(77)
  })

  it('handles the exact 5pp boundary as not tied (delta = threshold)', () => {
    const surveyA = makeSurveyWith('alpha', [{ text: 'Q1', agreeShare: 80 }])
    const surveyB = makeSurveyWith('beta', [{ text: 'Q1', agreeShare: 75 }])

    const result = computeBestPerQuestion([surveyA, surveyB])

    // 80 - 75 = 5, which is NOT less than 5, so NOT tied
    expect(result.questions[0].tiedWithBest).toHaveLength(0)
  })

  it('produces one entry per question regardless of the number of surveys', () => {
    const surveys = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'].map(
      (id, i) =>
        makeSurveyWith(id, [
          { text: 'Q1', agreeShare: 70 + i * 3 },
          { text: 'Q2', agreeShare: 90 - i * 5 },
          { text: 'Q3', agreeShare: 50 + i },
        ]),
    )

    const result = computeBestPerQuestion(surveys)

    // Always 3 entries — one per question — not C(5,2) = 10 pairs
    expect(result.questions).toHaveLength(3)
  })

  it('identifies different winners for different questions across five surveys', () => {
    const surveys = [
      makeSurveyWith('alpha', [
        { text: 'Q1', agreeShare: 60 },
        { text: 'Q2', agreeShare: 95 },
      ]),
      makeSurveyWith('beta', [
        { text: 'Q1', agreeShare: 90 },
        { text: 'Q2', agreeShare: 50 },
      ]),
      makeSurveyWith('gamma', [
        { text: 'Q1', agreeShare: 65 },
        { text: 'Q2', agreeShare: 70 },
      ]),
      makeSurveyWith('delta', [
        { text: 'Q1', agreeShare: 70 },
        { text: 'Q2', agreeShare: 80 },
      ]),
      makeSurveyWith('epsilon', [
        { text: 'Q1', agreeShare: 75 },
        { text: 'Q2', agreeShare: 60 },
      ]),
    ]

    const result = computeBestPerQuestion(surveys)

    expect(result.questions[0].bestId).toBe('beta') // Q1: 90
    expect(result.questions[1].bestId).toBe('alpha') // Q2: 95
  })

  it('returns empty questions when the reference group is missing', () => {
    const survey: PreschoolSurvey = {
      id: 'alpha',
      preschoolName: 'Alfa',
      address: 'Testvägen 1',
      surveyYear: 2025,
      totalRespondentsPercent: 80,
      questionGroups: [],
    }
    const surveyB = makeSurveyWith('beta', [{ text: 'Q1', agreeShare: 80 }])

    const result = computeBestPerQuestion([survey, surveyB])

    expect(result.questions).toHaveLength(0)
  })
})

// ─── formatBestPerQuestionText tests ─────────────────────────────────────────

describe('formatBestPerQuestionText', () => {
  it('produces a Swedish sentence for a clear winner', () => {
    const summary = {
      questions: [
        {
          questionText: 'Overall satisfaction',
          bestId: 'alpha',
          bestAgreeShare: 85,
          tiedWithBest: [],
        } satisfies QuestionBest,
      ],
    }

    const result = formatBestPerQuestionText(summary, NAMES, 'sv')

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(
      'Alfa Förskola (85%) fick högst resultat för "Overall satisfaction".',
    )
  })

  it('produces a Swedish sentence for two tied schools', () => {
    const summary = {
      questions: [
        {
          questionText: 'Overall satisfaction',
          bestId: 'alpha',
          bestAgreeShare: 85,
          tiedWithBest: [{ id: 'beta', agreeShare: 82 }],
        } satisfies QuestionBest,
      ],
    }

    const result = formatBestPerQuestionText(summary, NAMES, 'sv')

    expect(result[0]).toBe(
      'Alfa Förskola (85%) och Beta Förskola (82%) fick liknande resultat för "Overall satisfaction".',
    )
  })

  it('produces a Swedish sentence for three tied schools', () => {
    const summary = {
      questions: [
        {
          questionText: 'Q1',
          bestId: 'alpha',
          bestAgreeShare: 85,
          tiedWithBest: [
            { id: 'beta', agreeShare: 83 },
            { id: 'gamma', agreeShare: 81 },
          ],
        } satisfies QuestionBest,
      ],
    }

    const result = formatBestPerQuestionText(summary, NAMES, 'sv')

    expect(result[0]).toBe(
      'Alfa Förskola (85%), Beta Förskola (83%) och Gamma Förskola (81%) fick liknande resultat för "Q1".',
    )
  })

  it('produces an English sentence for a clear winner', () => {
    const summary = {
      questions: [
        {
          questionText: 'Overall satisfaction',
          bestId: 'alpha',
          bestAgreeShare: 85,
          tiedWithBest: [],
        } satisfies QuestionBest,
      ],
    }

    const result = formatBestPerQuestionText(summary, NAMES, 'en')

    expect(result[0]).toBe(
      'Alfa Förskola (85%) scored highest on "Overall satisfaction".',
    )
  })

  it('produces an English sentence for tied schools', () => {
    const summary = {
      questions: [
        {
          questionText: 'Overall satisfaction',
          bestId: 'alpha',
          bestAgreeShare: 85,
          tiedWithBest: [{ id: 'beta', agreeShare: 82 }],
        } satisfies QuestionBest,
      ],
    }

    const result = formatBestPerQuestionText(summary, NAMES, 'en')

    expect(result[0]).toBe(
      'Alfa Förskola (85%) and Beta Förskola (82%) scored similarly on "Overall satisfaction".',
    )
  })

  it('produces an Arabic sentence for a clear winner', () => {
    const summary = {
      questions: [
        {
          questionText: 'Overall satisfaction',
          bestId: 'alpha',
          bestAgreeShare: 85,
          tiedWithBest: [],
        } satisfies QuestionBest,
      ],
    }

    const result = formatBestPerQuestionText(summary, NAMES, 'ar')

    expect(result[0]).toBe(
      'Alfa Förskola (85%) حصل على أعلى نتيجة في "Overall satisfaction".',
    )
  })

  it('rounds fractional agree-share percentages', () => {
    const summary = {
      questions: [
        {
          questionText: 'Q1',
          bestId: 'alpha',
          bestAgreeShare: 84.7,
          tiedWithBest: [],
        } satisfies QuestionBest,
      ],
    }

    const result = formatBestPerQuestionText(summary, NAMES, 'sv')

    expect(result[0]).toBe('Alfa Förskola (85%) fick högst resultat för "Q1".')
  })

  it('returns empty array when summary has no questions', () => {
    const result = formatBestPerQuestionText({ questions: [] }, NAMES, 'sv')
    expect(result).toHaveLength(0)
  })

  it('falls back to raw ID when name is missing from the names map', () => {
    const summary = {
      questions: [
        {
          questionText: 'Q1',
          bestId: 'unknown-id',
          bestAgreeShare: 85,
          tiedWithBest: [],
        } satisfies QuestionBest,
      ],
    }

    const result = formatBestPerQuestionText(summary, {}, 'sv')

    expect(result[0]).toContain('unknown-id')
  })
})
