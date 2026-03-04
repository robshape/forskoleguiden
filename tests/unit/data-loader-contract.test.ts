import { describe, expect, it } from 'vitest'

import {
  getAllPreschoolSurveys,
  getPreschoolIndex,
  getPreschoolSurvey,
  getPreschoolSurveyByYear,
} from '@/lib/data'
import { getMalmoIndex, getMalmoSurveyFilePath } from './helpers/malmo-data'
import { assertResponseShape } from './helpers/survey-assertions'

describe('preschool data loading', () => {
  it('should load the index and individual surveys with correct relationships', () => {
    const index = getPreschoolIndex()
    expect(index.city).toBe('Malmö')
    expect(index.year).toBe(2025)
    expect(index.preschools.length).toBeGreaterThanOrEqual(5)

    // Load a known preschool and verify it matches the index entry
    const knownPreschool = index.preschools[0]
    expect(knownPreschool).toBeDefined()

    const survey = getPreschoolSurvey(knownPreschool.id)
    const helhetsbedomning = survey.questionGroups.find(
      (group) => group.name === 'Helhetsbedömning',
    )
    expect(survey.id).toBe(knownPreschool.id)
    expect(survey.preschoolName).toBe(knownPreschool.name)
    expect(survey.address).toBe(knownPreschool.address)
    expect(survey.surveyYear).toBe(index.year)
    expect(helhetsbedomning).toBeDefined()
    if (!helhetsbedomning) {
      throw new Error('helhetsbedomning group missing')
    }
    expect(helhetsbedomning.questions.length).toBeGreaterThan(0)
    assertResponseShape(helhetsbedomning.questions[0].response)

    const surveyLoadedByYear = getPreschoolSurveyByYear(
      knownPreschool.id,
      index.year,
    )
    expect(surveyLoadedByYear.id).toBe(knownPreschool.id)
    expect(surveyLoadedByYear.preschoolName).toBe(knownPreschool.name)
    expect(surveyLoadedByYear.address).toBe(knownPreschool.address)
    expect(surveyLoadedByYear.surveyYear).toBe(index.year)

    // All surveys load in index order
    const surveys = getAllPreschoolSurveys()
    const expectedOrder = index.preschools.map((preschool) => preschool.id)
    expect(surveys.length).toBe(index.preschools.length)
    expect(surveys.map((s) => s.id)).toEqual(expectedOrder)
  })

  it('should throw a clear error for unknown preschool IDs', () => {
    const missingId = 'nonexistent-preschool-id'
    const index = getMalmoIndex()
    const expectedPath = getMalmoSurveyFilePath(missingId, index.year)

    expect(() => getPreschoolSurvey(missingId)).toThrowError(missingId)
    expect(() => getPreschoolSurvey(missingId)).toThrowError(expectedPath)
    expect(() => getPreschoolSurveyByYear(missingId, index.year)).toThrowError(
      missingId,
    )
    expect(() => getPreschoolSurveyByYear(missingId, index.year)).toThrowError(
      expectedPath,
    )
  })
})
