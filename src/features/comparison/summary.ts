import { computeAgreeShare, OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import type { PreschoolSurvey } from '@/lib/types'

export type SummaryClassification = 'higher' | 'lower' | 'similar'

export type QuestionSummary = {
  questionText: string
  baseAgreeShare: number
  targetAgreeShare: number
  delta: number
  classification: SummaryClassification
}

export type PairSummary = {
  baseId: string
  targetId: string
  questions: QuestionSummary[]
}

export type ComparisonSummary = {
  pairs: PairSummary[]
}

const DELTA_THRESHOLD = 5

const classifyDelta = (delta: number): SummaryClassification => {
  if (delta >= DELTA_THRESHOLD) return 'higher'
  if (delta <= -DELTA_THRESHOLD) return 'lower'
  return 'similar'
}

export const computeSummary = (
  surveys: PreschoolSurvey[],
): ComparisonSummary => {
  if (surveys.length < 2) {
    return { pairs: [] }
  }

  const referenceGroup = surveys[0]?.questionGroups.find(
    (group) => group.name === OVERALL_ASSESSMENT_GROUP,
  )

  if (!referenceGroup) {
    return { pairs: [] }
  }

  const pairs: PairSummary[] = []

  for (let i = 0; i < surveys.length - 1; i++) {
    for (let j = i + 1; j < surveys.length; j++) {
      const base = surveys[i]
      const target = surveys[j]

      const baseGroup = base.questionGroups.find(
        (g) => g.name === OVERALL_ASSESSMENT_GROUP,
      )

      if (!baseGroup) continue

      const targetGroup = target.questionGroups.find(
        (g) => g.name === OVERALL_ASSESSMENT_GROUP,
      )

      const questions: QuestionSummary[] = referenceGroup.questions.flatMap(
        (referenceQuestion) => {
          const baseQuestion = baseGroup.questions.find(
            (q) => q.text === referenceQuestion.text,
          )
          const targetQuestion = targetGroup?.questions.find(
            (q) => q.text === referenceQuestion.text,
          )

          if (!baseQuestion || !targetQuestion) return []

          const baseAgreeShare = computeAgreeShare(baseQuestion.response)
          const targetAgreeShare = computeAgreeShare(targetQuestion.response)
          const delta = targetAgreeShare - baseAgreeShare

          return [
            {
              questionText: referenceQuestion.text,
              baseAgreeShare,
              targetAgreeShare,
              delta,
              classification: classifyDelta(delta),
            },
          ]
        },
      )

      if (questions.length === 0) continue

      pairs.push({
        baseId: base.id,
        targetId: target.id,
        questions,
      })
    }
  }

  return { pairs }
}
