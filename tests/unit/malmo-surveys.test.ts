import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'
import type { PreschoolSurvey, SurveyResponse } from '@/lib/types'
import { getMalmoIndex, getMalmoSurveyFilePath } from './helpers/malmo-data'

const expectedResponseKeys = [
  'completelyAgreePercent',
  'partlyAgreePercent',
  'neitherAgreeNorDisagreePercent',
  'partlyDisagreePercent',
  'completelyDisagreePercent',
] as const

const assertResponseContract = (
  response: SurveyResponse,
  contextLabel: string,
) => {
  expect(
    Object.keys(response).sort(),
    `${contextLabel} must contain exactly 5 response percentage keys`,
  ).toEqual(expectedResponseKeys.slice().sort())

  const totalPercentage = expectedResponseKeys.reduce((sum, key) => {
    const value = response[key]

    expect(typeof value, `${contextLabel} ${key} must be numeric`).toBe(
      'number',
    )
    expect(
      value,
      `${contextLabel} ${key} must be within 0..100`,
    ).toBeGreaterThanOrEqual(0)
    expect(
      value,
      `${contextLabel} ${key} must be within 0..100`,
    ).toBeLessThanOrEqual(100)

    return sum + value
  }, 0)

  expect(
    totalPercentage,
    `${contextLabel} percentages must sum to 99..101`,
  ).toBeGreaterThanOrEqual(99)
  expect(
    totalPercentage,
    `${contextLabel} percentages must sum to 99..101`,
  ).toBeLessThanOrEqual(101)
}

describe('Step 1.3 Malmö survey seed data contract', () => {
  it('has one survey file per preschool id in index', () => {
    const index = getMalmoIndex()

    for (const preschool of index.preschools) {
      const surveyFilePath = getMalmoSurveyFilePath(preschool.id, index.year)

      expect(
        existsSync(surveyFilePath),
        `Missing survey file for index id \"${preschool.id}\" at ${surveyFilePath}`,
      ).toBe(true)
    }
  })

  it('keeps Helhetsbedömning group and response integrity for each existing survey file', () => {
    const index = getMalmoIndex()

    for (const preschool of index.preschools) {
      const surveyFilePath = getMalmoSurveyFilePath(preschool.id, index.year)

      expect(
        existsSync(surveyFilePath),
        `Missing survey file for index id "${preschool.id}" at ${surveyFilePath}`,
      ).toBe(true)

      const raw = readFileSync(surveyFilePath, 'utf-8')
      const survey = JSON.parse(raw) as PreschoolSurvey

      expect(survey.id, `${surveyFilePath} id must match index id`).toBe(
        preschool.id,
      )
      expect(
        survey.preschoolName,
        `${surveyFilePath} preschoolName must match index name`,
      ).toBe(preschool.name)
      expect(
        survey.address,
        `${surveyFilePath} address must match index address`,
      ).toBe(preschool.address)
      expect(
        survey.surveyYear,
        `${surveyFilePath} surveyYear must match index year`,
      ).toBe(index.year)
      expect(
        survey.totalRespondentsPercent,
        `${surveyFilePath} totalRespondents must be > 0`,
      ).toBeGreaterThan(0)

      const helhetsbedomning = survey.questionGroups.find(
        (group) => group.name === 'Helhetsbedömning',
      )

      expect(
        helhetsbedomning,
        `${surveyFilePath} must include group named Helhetsbedömning`,
      ).toBeDefined()

      if (!helhetsbedomning) {
        continue
      }

      expect(
        helhetsbedomning.questions.length,
        `${surveyFilePath} Helhetsbedömning must contain exactly 2 questions`,
      ).toBe(2)

      for (const [
        questionIndex,
        question,
      ] of helhetsbedomning.questions.entries()) {
        assertResponseContract(
          question.response,
          `${surveyFilePath} question ${questionIndex + 1}`,
        )
      }
    }
  })
})
