import { SCORE_TIER_HIGH, SCORE_TIER_MEDIUM } from '@/lib/constants'
import type { PreschoolSurvey, SurveyResponse } from '@/lib/types'

const SCORE_ROUNDING_DECIMALS = 1
const MAX_PERCENT = 100
const SUM_TOLERANCE = 1

export const OVERALL_ASSESSMENT_GROUP = 'Helhetsbedömning'

const roundToDecimals = (value: number, decimals: number) => {
  const multiplier = 10 ** decimals

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}

const warnIfInvalidResponse = (response: SurveyResponse) => {
  const percentages = [
    response.completelyAgreePercent,
    response.partlyAgreePercent,
    response.neitherAgreeNorDisagreePercent,
    response.partlyDisagreePercent,
    response.completelyDisagreePercent,
  ]

  const hasOutOfRangePercent = percentages.some(
    (percentage) =>
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > MAX_PERCENT,
  )
  const totalPercent = percentages.reduce(
    (sum, percentage) => sum + percentage,
    0,
  )
  const hasUnexpectedTotal =
    Math.abs(totalPercent - MAX_PERCENT) > SUM_TOLERANCE

  if (hasOutOfRangePercent || hasUnexpectedTotal) {
    console.warn(
      '[scoring] Invalid SurveyResponse percentages detected while computing agree share',
      { response, totalPercent },
    )
  }
}

export const byOverallScoreDesc = (
  leftScore: number | null,
  rightScore: number | null,
) => {
  if (leftScore === null && rightScore === null) {
    return 0
  }

  if (leftScore === null) {
    return 1
  }

  if (rightScore === null) {
    return -1
  }

  return rightScore - leftScore
}

export const computeAgreeShare = (response: SurveyResponse) => {
  warnIfInvalidResponse(response)

  return response.completelyAgreePercent + response.partlyAgreePercent
}

export const computeOverallScore = (survey: PreschoolSurvey) => {
  const overallAssessmentGroup = survey.questionGroups.find(
    (group) => group.name === OVERALL_ASSESSMENT_GROUP,
  )

  if (
    !overallAssessmentGroup ||
    overallAssessmentGroup.questions.length === 0
  ) {
    return null
  }

  const totalAgreeShare = overallAssessmentGroup.questions.reduce(
    (sum, question) => sum + computeAgreeShare(question.response),
    0,
  )

  return roundToDecimals(
    totalAgreeShare / overallAssessmentGroup.questions.length,
    SCORE_ROUNDING_DECIMALS,
  )
}

export type ScoreTier = 'high' | 'medium' | 'low' | 'none'

export const getScoreTier = (displayScore: number | null): ScoreTier => {
  if (displayScore === null) return 'none'
  if (displayScore >= SCORE_TIER_HIGH) return 'high'
  if (displayScore >= SCORE_TIER_MEDIUM) return 'medium'
  return 'low'
}
