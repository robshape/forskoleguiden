import { computeAgreeShare, OVERALL_ASSESSMENT_GROUP } from '@/lib/scoring'
import type { PreschoolSurvey } from '@/lib/types'

/** Agree-share percentage-point gap within which schools are considered tied */
const DELTA_THRESHOLD = 5

export type QuestionBest = {
  questionText: string
  bestId: string
  bestAgreeShare: number
  /** Other schools within DELTA_THRESHOLD of the best score */
  tiedWithBest: Array<{ id: string; agreeShare: number }>
}

export type BestPerQuestionSummary = {
  questions: QuestionBest[]
}

export const computeBestPerQuestion = (
  surveys: PreschoolSurvey[],
): BestPerQuestionSummary => {
  if (surveys.length < 2) return { questions: [] }

  const referenceGroup = surveys[0]?.questionGroups.find(
    (g) => g.name === OVERALL_ASSESSMENT_GROUP,
  )
  if (!referenceGroup) return { questions: [] }

  const questions: QuestionBest[] = referenceGroup.questions.flatMap(
    (refQuestion) => {
      const scores: Array<{ id: string; agreeShare: number }> = []

      for (const survey of surveys) {
        const group = survey.questionGroups.find(
          (g) => g.name === OVERALL_ASSESSMENT_GROUP,
        )
        const q = group?.questions.find((c) => c.text === refQuestion.text)
        if (q) {
          scores.push({
            id: survey.id,
            agreeShare: computeAgreeShare(q.response),
          })
        }
      }

      if (scores.length === 0) return []

      scores.sort((a, b) => b.agreeShare - a.agreeShare)

      const best = scores[0]
      const tiedWithBest = scores
        .slice(1)
        .filter((s) => best.agreeShare - s.agreeShare < DELTA_THRESHOLD)

      return [
        {
          questionText: refQuestion.text,
          bestId: best.id,
          bestAgreeShare: best.agreeShare,
          tiedWithBest,
        },
      ]
    },
  )

  return { questions }
}
