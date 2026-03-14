import { describe, expect, it } from 'vitest'

import { computeSummary } from '@/features/comparison/summary'
import { OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import type { PreschoolSurvey } from '@/lib/types'

const makeSurvey = (id: string, agreeShare: number): PreschoolSurvey => ({
  id,
  preschoolName: `Förskolan ${id}`,
  address: 'Testvägen 1, Malmö',
  surveyYear: 2025,
  totalRespondentsPercent: 80,
  questionGroups: [
    {
      name: OVERALL_ASSESSMENT_GROUP,
      questions: [
        {
          text: 'Overall satisfaction',
          response: {
            completelyAgreePercent: agreeShare,
            partlyAgreePercent: 0,
            neitherAgreeNorDisagreePercent: 100 - agreeShare,
            partlyDisagreePercent: 0,
            completelyDisagreePercent: 0,
          },
        },
      ],
    },
  ],
})

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

describe('computeSummary', () => {
  describe('given two surveys with a 6-point agree-share delta on one question', () => {
    it('classifies the target as higher and stores directional delta fields for the pair', () => {
      const surveyA = makeSurvey('school-a', 74)
      const surveyB = makeSurvey('school-b', 80)

      const summary = computeSummary([surveyA, surveyB])

      expect(summary.pairs).toHaveLength(1)

      const [pair] = summary.pairs
      expect(pair.baseId).toBe('school-a')
      expect(pair.targetId).toBe('school-b')
      expect(pair.questions).toHaveLength(1)

      const [question] = pair.questions
      expect(question.questionText).toBe('Overall satisfaction')
      expect(question.baseAgreeShare).toBe(74)
      expect(question.targetAgreeShare).toBe(80)
      expect(question.delta).toBe(6)
      expect(question.classification).toBe('higher')
    })
  })

  describe('threshold classification behavior', () => {
    it('classifies as higher when delta equals the 5-point threshold exactly', () => {
      const surveyA = makeSurvey('school-a', 70)
      const surveyB = makeSurvey('school-b', 75)

      const summary = computeSummary([surveyA, surveyB])

      const [{ questions }] = summary.pairs
      expect(questions[0].delta).toBe(5)
      expect(questions[0].classification).toBe('higher')
    })

    it('classifies as lower when delta equals -5 exactly', () => {
      const surveyA = makeSurvey('school-a', 75)
      const surveyB = makeSurvey('school-b', 70)

      const summary = computeSummary([surveyA, surveyB])

      const [{ questions }] = summary.pairs
      expect(questions[0].delta).toBe(-5)
      expect(questions[0].classification).toBe('lower')
    })

    it('classifies as similar when delta is 4 (one below the positive threshold)', () => {
      const surveyA = makeSurvey('school-a', 70)
      const surveyB = makeSurvey('school-b', 74)

      const summary = computeSummary([surveyA, surveyB])

      const [{ questions }] = summary.pairs
      expect(questions[0].delta).toBe(4)
      expect(questions[0].classification).toBe('similar')
    })

    it('classifies as similar when delta is -4 (one above the negative threshold)', () => {
      const surveyA = makeSurvey('school-a', 74)
      const surveyB = makeSurvey('school-b', 70)

      const summary = computeSummary([surveyA, surveyB])

      const [{ questions }] = summary.pairs
      expect(questions[0].delta).toBe(-4)
      expect(questions[0].classification).toBe('similar')
    })
  })

  describe('three-school pairwise combinations', () => {
    it('generates all three unique pairs (A-B, A-C, B-C) for three surveys', () => {
      const surveyA = makeSurvey('school-a', 70)
      const surveyB = makeSurvey('school-b', 80)
      const surveyC = makeSurvey('school-c', 60)

      const summary = computeSummary([surveyA, surveyB, surveyC])

      expect(summary.pairs).toHaveLength(3)

      const pairIds = summary.pairs.map((p) => `${p.baseId}-${p.targetId}`)
      expect(pairIds).toContain('school-a-school-b')
      expect(pairIds).toContain('school-a-school-c')
      expect(pairIds).toContain('school-b-school-c')
    })

    it('computes correct classifications for each pair in a three-school comparison', () => {
      // A=70, B=76 → B relative to A: delta=+6 (higher)
      // A=70, C=65 → C relative to A: delta=-5 (lower)
      // B=76, C=65 → C relative to B: delta=-11 (lower)
      const surveyA = makeSurvey('school-a', 70)
      const surveyB = makeSurvey('school-b', 76)
      const surveyC = makeSurvey('school-c', 65)

      const summary = computeSummary([surveyA, surveyB, surveyC])

      const pairAB = summary.pairs.find(
        (p) => p.baseId === 'school-a' && p.targetId === 'school-b',
      )
      const pairAC = summary.pairs.find(
        (p) => p.baseId === 'school-a' && p.targetId === 'school-c',
      )
      const pairBC = summary.pairs.find(
        (p) => p.baseId === 'school-b' && p.targetId === 'school-c',
      )

      expect(pairAB?.questions[0].classification).toBe('higher')
      expect(pairAC?.questions[0].classification).toBe('lower')
      expect(pairBC?.questions[0].classification).toBe('lower')
    })
  })

  describe('multiple Helhetsbedömning questions', () => {
    it('computes a question-level summary for every question in the group', () => {
      // Q1: base=70, target=76 → delta=+6 (higher)
      // Q2: base=80, target=77 → delta=-3 (similar)
      const surveyA = makeSurveyWith('school-a', [
        { text: 'Overall satisfaction', agreeShare: 70 },
        { text: 'Recommend to others', agreeShare: 80 },
      ])
      const surveyB = makeSurveyWith('school-b', [
        { text: 'Overall satisfaction', agreeShare: 76 },
        { text: 'Recommend to others', agreeShare: 77 },
      ])

      const summary = computeSummary([surveyA, surveyB])

      const [pair] = summary.pairs
      expect(pair.questions).toHaveLength(2)

      const q1 = pair.questions.find(
        (q) => q.questionText === 'Overall satisfaction',
      )
      const q2 = pair.questions.find(
        (q) => q.questionText === 'Recommend to others',
      )

      expect(q1?.delta).toBe(6)
      expect(q1?.classification).toBe('higher')
      expect(q2?.delta).toBe(-3)
      expect(q2?.classification).toBe('similar')
    })

    it('generates all unique pairs each with question-level summaries for three surveys with two questions', () => {
      const surveyA = makeSurveyWith('school-a', [
        { text: 'Overall satisfaction', agreeShare: 60 },
        { text: 'Recommend to others', agreeShare: 70 },
      ])
      const surveyB = makeSurveyWith('school-b', [
        { text: 'Overall satisfaction', agreeShare: 65 },
        { text: 'Recommend to others', agreeShare: 75 },
      ])
      const surveyC = makeSurveyWith('school-c', [
        { text: 'Overall satisfaction', agreeShare: 60 },
        { text: 'Recommend to others', agreeShare: 66 },
      ])

      const summary = computeSummary([surveyA, surveyB, surveyC])

      expect(summary.pairs).toHaveLength(3)

      for (const pair of summary.pairs) {
        expect(pair.questions).toHaveLength(2)
      }

      const pairBC = summary.pairs.find(
        (p) => p.baseId === 'school-b' && p.targetId === 'school-c',
      )
      // B Q1=65, C Q1=60 → delta=-5 (lower)
      // B Q2=75, C Q2=66 → delta=-9 (lower)
      expect(pairBC?.questions[0].classification).toBe('lower')
      expect(pairBC?.questions[1].classification).toBe('lower')
    })
  })

  describe('edge cases and invariants', () => {
    it('returns empty pairs given zero surveys', () => {
      const summary = computeSummary([])

      expect(summary.pairs).toHaveLength(0)
    })

    it('returns empty pairs given one survey', () => {
      const surveyA = makeSurvey('school-a', 75)

      const summary = computeSummary([surveyA])

      expect(summary.pairs).toHaveLength(0)
    })

    it('returns empty pairs when the first selected survey has no Helhetsbedömning group', () => {
      const surveyA: PreschoolSurvey = {
        id: 'school-a',
        preschoolName: 'Förskolan school-a',
        address: 'Testvägen 1, Malmö',
        surveyYear: 2025,
        totalRespondentsPercent: 80,
        questionGroups: [],
      }
      const surveyB = makeSurvey('school-b', 75)
      const surveyC = makeSurvey('school-c', 80)

      const summary = computeSummary([surveyA, surveyB, surveyC])

      expect(summary.pairs).toHaveLength(0)
    })

    it('omits the pair when the target survey has no Helhetsbedömning group', () => {
      const surveyA = makeSurvey('school-a', 75)
      const surveyB: PreschoolSurvey = {
        id: 'school-b',
        preschoolName: 'Förskolan school-b',
        address: 'Testvägen 1, Malmö',
        surveyYear: 2025,
        totalRespondentsPercent: 80,
        questionGroups: [],
      }

      const summary = computeSummary([surveyA, surveyB])

      expect(summary.pairs).toHaveLength(0)
    })

    it('omits the pair when no question labels match between the two surveys', () => {
      const surveyA = makeSurveyWith('school-a', [
        { text: 'Overall satisfaction', agreeShare: 70 },
      ])
      const surveyB = makeSurveyWith('school-b', [
        { text: 'Completely different question', agreeShare: 80 },
      ])

      const summary = computeSummary([surveyA, surveyB])

      expect(summary.pairs).toHaveLength(0)
    })

    it('limits every pair to the first selected survey question set', () => {
      const surveyA = makeSurveyWith('school-a', [
        { text: 'Overall satisfaction', agreeShare: 70 },
      ])
      const surveyB = makeSurveyWith('school-b', [
        { text: 'Overall satisfaction', agreeShare: 76 },
        { text: 'Only visible for later surveys', agreeShare: 82 },
      ])
      const surveyC = makeSurveyWith('school-c', [
        { text: 'Overall satisfaction', agreeShare: 80 },
        { text: 'Only visible for later surveys', agreeShare: 84 },
      ])

      const summary = computeSummary([surveyA, surveyB, surveyC])

      expect(summary.pairs).toHaveLength(3)

      const pairBC = summary.pairs.find(
        (pair) => pair.baseId === 'school-b' && pair.targetId === 'school-c',
      )

      expect(pairBC?.questions).toHaveLength(1)
      expect(pairBC?.questions[0].questionText).toBe('Overall satisfaction')
    })

    it('includes a pair but only the matched questions when question labels partially overlap', () => {
      const surveyA = makeSurveyWith('school-a', [
        { text: 'Overall satisfaction', agreeShare: 70 },
        { text: 'Only in A', agreeShare: 80 },
      ])
      const surveyB = makeSurveyWith('school-b', [
        { text: 'Overall satisfaction', agreeShare: 76 },
        { text: 'Only in B', agreeShare: 90 },
      ])

      const summary = computeSummary([surveyA, surveyB])

      expect(summary.pairs).toHaveLength(1)
      expect(summary.pairs[0].questions).toHaveLength(1)
      expect(summary.pairs[0].questions[0].questionText).toBe(
        'Overall satisfaction',
      )
    })
  })
})
