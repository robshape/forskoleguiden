import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import type { PreschoolSurvey } from '@/lib/types'

import { getMalmoIndex, getMalmoSurveyFilePath } from './helpers/malmo-data'
import { assertResponseContract } from './helpers/survey-assertions'

const CANONICAL_HELHETSBEDOMNING_QUESTIONS = [
  'Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola',
  'Jag skulle rekommendera mitt barns förskola till en annan förälder',
]

describe('Malmö survey data files', () => {
  it('should have a survey file for every preschool in the index', () => {
    const index = getMalmoIndex()

    for (const preschool of index.preschools) {
      const surveyFilePath = getMalmoSurveyFilePath(preschool.id, index.year)

      expect(
        existsSync(surveyFilePath),
        `Missing survey file for index id \"${preschool.id}\" at ${surveyFilePath}`,
      ).toBe(true)
    }
  })

  it('should have valid Helhetsbedömning questions with correct response percentages in each survey', () => {
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

      // Placeholder surveys use -1 for totalRespondentsPercent — skip data validation
      const isPlaceholder = survey.totalRespondentsPercent === -1

      if (!isPlaceholder) {
        expect(
          survey.totalRespondentsPercent,
          `${surveyFilePath} totalRespondents must be > 0`,
        ).toBeGreaterThan(0)
      }

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

      expect(
        helhetsbedomning.questions.map((question) => question.text),
        `${surveyFilePath} Helhetsbedömning questions must match the canonical ordered question texts`,
      ).toEqual(CANONICAL_HELHETSBEDOMNING_QUESTIONS)

      if (!isPlaceholder) {
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
    }
  })
})
