import { describe, expect, it } from 'vitest'

import { getAllPreschoolSurveys, isPlaceholderSurvey } from '@/lib/data'

describe('placeholder survey filtering', () => {
  it('should identify placeholder surveys with totalRespondentsPercent of -1', () => {
    const allSurveys = getAllPreschoolSurveys()
    const placeholder = allSurveys.find(
      (survey) => survey.totalRespondentsPercent === -1,
    )

    expect(
      placeholder,
      'expected at least one placeholder survey in the dataset',
    ).toBeDefined()
    expect(isPlaceholderSurvey(placeholder!)).toBe(true)
  })

  it('should not identify valid surveys as placeholders', () => {
    const allSurveys = getAllPreschoolSurveys()
    const validSurvey = allSurveys.find(
      (survey) => survey.totalRespondentsPercent > 0,
    )

    expect(validSurvey).toBeDefined()
    expect(isPlaceholderSurvey(validSurvey!)).toBe(false)
  })

  it('should return only non-placeholder surveys from getAllPreschoolSurveys when filtered', () => {
    const allSurveys = getAllPreschoolSurveys()
    const validSurveys = allSurveys.filter(
      (survey) => !isPlaceholderSurvey(survey),
    )

    expect(validSurveys.length).toBeGreaterThan(0)
    expect(validSurveys.length).toBeLessThanOrEqual(allSurveys.length)

    for (const survey of validSurveys) {
      expect(survey.totalRespondentsPercent).not.toBe(-1)
    }
  })

  it('should confirm at least one placeholder exists in the dataset', () => {
    const allSurveys = getAllPreschoolSurveys()
    const placeholders = allSurveys.filter(isPlaceholderSurvey)

    expect(placeholders.length).toBeGreaterThan(0)
  })
})
