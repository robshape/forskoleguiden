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

describe('Step 1.5 scoring utility', () => {
  it('computeAgreeShare returns 85 from 60 + 25', () => {
    const agreeShare = computeAgreeShare({
      completelyAgreePercent: 60,
      partlyAgreePercent: 25,
      neitherAgreeNorDisagreePercent: 10,
      partlyDisagreePercent: 3,
      completelyDisagreePercent: 2,
    })

    expect(agreeShare).toBe(85)
  })

  it('computeOverallScore returns average 85 from agree shares 80 and 90', () => {
    const survey = createSurvey([
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

    expect(computeOverallScore(survey)).toBe(85)
  })

  it('computeOverallScore returns rounded value with one decimal precision', () => {
    const survey = createSurvey([
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

    expect(computeOverallScore(survey)).toBe(84.5)
  })

  it('computeOverallScore returns null when Helhetsbedömning is missing', () => {
    const survey = createSurvey([
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

    expect(computeOverallScore(survey)).toBeNull()
  })

  it('computeOverallScore returns null when Helhetsbedömning group is present but empty', () => {
    const survey = createSurvey([
      {
        name: OVERALL_ASSESSMENT_GROUP,
        questions: [],
      },
    ])

    expect(computeOverallScore(survey)).toBeNull()
  })

  it('sorts scores descending and keeps null scores at the bottom', () => {
    const scores: Array<number | null> = [85, null, 72]

    const sorted = scores.slice().sort(byOverallScoreDesc)

    expect(sorted).toEqual([85, 72, null])
  })

  it('warns in non-production mode for invalid response percentages', () => {
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
