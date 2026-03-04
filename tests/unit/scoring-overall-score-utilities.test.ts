import { describe, expect, it, vi } from 'vitest'

import {
  byOverallScoreDesc,
  computeAgreeShare,
  computeOverallScore,
  OVERALL_ASSESSMENT_GROUP,
} from '@/lib/scoring'
import type { PreschoolSurvey } from '@/lib/types'

const createSurvey = (
  questionGroups: PreschoolSurvey['questionGroups'],
): PreschoolSurvey => ({
  id: 'test-preschool',
  preschoolName: 'Testförskolan',
  address: 'Testvägen 1, Malmö',
  surveyYear: 2025,
  totalRespondentsPercent: 80,
  questionGroups,
})

describe('scoring utilities', () => {
  it('should compute agree shares and overall scores with correct rounding', () => {
    // computeAgreeShare sums completely + partly agree percentages
    const agreeShare = computeAgreeShare({
      completelyAgreePercent: 60,
      partlyAgreePercent: 25,
      neitherAgreeNorDisagreePercent: 10,
      partlyDisagreePercent: 3,
      completelyDisagreePercent: 2,
    })
    expect(agreeShare).toBe(85)

    // computeOverallScore averages agree shares across questions in Helhetsbedömning
    // Two questions with agree shares 80 (60+20) and 90 (70+20) → average 85
    const surveyWithTwoQuestions = createSurvey([
      {
        name: OVERALL_ASSESSMENT_GROUP,
        questions: [
          {
            text: 'Question 1',
            response: {
              completelyAgreePercent: 60,
              partlyAgreePercent: 20,
              neitherAgreeNorDisagreePercent: 10,
              partlyDisagreePercent: 5,
              completelyDisagreePercent: 5,
            },
          },
          {
            text: 'Question 2',
            response: {
              completelyAgreePercent: 70,
              partlyAgreePercent: 20,
              neitherAgreeNorDisagreePercent: 5,
              partlyDisagreePercent: 3,
              completelyDisagreePercent: 2,
            },
          },
        ],
      },
    ])
    expect(computeOverallScore(surveyWithTwoQuestions)).toBe(85)

    // Rounding: agree shares 80 (60+20) and 89 (69+20) → average 84.5
    const surveyWithRounding = createSurvey([
      {
        name: OVERALL_ASSESSMENT_GROUP,
        questions: [
          {
            text: 'Question 1',
            response: {
              completelyAgreePercent: 60,
              partlyAgreePercent: 20,
              neitherAgreeNorDisagreePercent: 10,
              partlyDisagreePercent: 5,
              completelyDisagreePercent: 5,
            },
          },
          {
            text: 'Question 2',
            response: {
              completelyAgreePercent: 69,
              partlyAgreePercent: 20,
              neitherAgreeNorDisagreePercent: 6,
              partlyDisagreePercent: 3,
              completelyDisagreePercent: 2,
            },
          },
        ],
      },
    ])
    expect(computeOverallScore(surveyWithRounding)).toBe(84.5)
  })

  it('should return null when the Helhetsbedömning group is missing or empty', () => {
    // Missing group entirely
    const surveyMissingGroup = createSurvey([
      {
        name: 'Trygghet och trivsel',
        questions: [
          {
            text: 'Question 1',
            response: {
              completelyAgreePercent: 60,
              partlyAgreePercent: 25,
              neitherAgreeNorDisagreePercent: 10,
              partlyDisagreePercent: 3,
              completelyDisagreePercent: 2,
            },
          },
        ],
      },
    ])
    expect(computeOverallScore(surveyMissingGroup)).toBeNull()

    // Group exists but has zero questions
    const surveyEmptyGroup = createSurvey([
      {
        name: OVERALL_ASSESSMENT_GROUP,
        questions: [],
      },
    ])
    expect(computeOverallScore(surveyEmptyGroup)).toBeNull()
  })

  it('should sort scores descending with nulls at the bottom', () => {
    const scores: Array<number | null> = [85, null, 72]
    const sorted = scores.slice().sort(byOverallScoreDesc)
    expect(sorted).toEqual([85, 72, null])
  })

  it('should warn for invalid response percentages in non-production', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    computeAgreeShare({
      completelyAgreePercent: -1,
      partlyAgreePercent: 50,
      neitherAgreeNorDisagreePercent: 20,
      partlyDisagreePercent: 10,
      completelyDisagreePercent: 5,
    })

    expect(warnSpy).toHaveBeenCalledTimes(
      process.env.NODE_ENV === 'production' ? 0 : 1,
    )

    warnSpy.mockRestore()
  })
})
