import { describe, expect, it } from 'vitest'

import type {
  PreschoolIndex,
  PreschoolSurvey,
  SurveyResponse,
} from '@/lib/types'

const expectedResponseKeys = [
  'completelyAgreePercentage',
  'partlyAgreePercentage',
  'neitherAgreeNorDisagreePercentage',
  'partlyDisagreePercentage',
  'completelyDisagreePercentage',
] as const

const assertResponseShape = (response: SurveyResponse) => {
  expect(Object.keys(response).sort()).toEqual(
    expectedResponseKeys.slice().sort(),
  )

  for (const key of expectedResponseKeys) {
    expect(typeof response[key]).toBe('number')
  }
}

describe('Step 1.1 data interface contracts', () => {
  it('matches required PreschoolSurvey and SurveyResponse key sets', () => {
    const sampleSurvey: PreschoolSurvey = {
      id: 'testforskola',
      preschoolName: 'Testförskolan',
      address: 'Testgatan 1, Malmö',
      surveyYear: 2025,
      questionGroups: [
        {
          name: 'Helhetsbedömning',
          questions: [
            {
              text: 'Mitt barn är tryggt i förskolan',
              totalRespondents: 120,
              response: {
                completelyAgreePercentage: 58,
                partlyAgreePercentage: 24,
                neitherAgreeNorDisagreePercentage: 10,
                partlyDisagreePercentage: 5,
                completelyDisagreePercentage: 3,
              },
            },
            {
              text: 'Jag skulle rekommendera mitt barns förskola till en annan förälder',
              totalRespondents: 117,
              response: {
                completelyAgreePercentage: 63,
                partlyAgreePercentage: 21,
                neitherAgreeNorDisagreePercentage: 8,
                partlyDisagreePercentage: 4,
                completelyDisagreePercentage: 4,
              },
            },
          ],
        },
      ],
    }

    const expectedTopLevelKeys = [
      'id',
      'preschoolName',
      'address',
      'surveyYear',
      'questionGroups',
    ]

    expect(Object.keys(sampleSurvey).sort()).toEqual(
      expectedTopLevelKeys.sort(),
    )

    for (const group of sampleSurvey.questionGroups) {
      for (const question of group.questions) {
        expect(typeof question.totalRespondents).toBe('number')
        assertResponseShape(question.response)
      }
    }
  })

  it('matches required PreschoolIndex and PreschoolIndexEntry key sets', () => {
    const sampleIndex: PreschoolIndex = {
      city: 'Malmö',
      year: 2025,
      preschools: [
        {
          id: 'testforskola-municipal',
          name: 'Testförskolan Kommunal',
          address: 'Kommunalgatan 1, Malmö',
          operatorType: 'municipal',
        },
        {
          id: 'testforskola-independent',
          name: 'Testförskolan Fristående',
          address: 'Friståendegatan 2, Malmö',
          operatorType: 'independent',
        },
      ],
    }

    expect(Object.keys(sampleIndex).sort()).toEqual(
      ['city', 'year', 'preschools'].sort(),
    )

    const expectedIndexEntryKeys = ['id', 'name', 'address', 'operatorType']
    const validOperatorTypes = new Set(['municipal', 'independent'])

    for (const entry of sampleIndex.preschools) {
      expect(Object.keys(entry).sort()).toEqual(
        expectedIndexEntryKeys.slice().sort(),
      )
      expect(validOperatorTypes.has(entry.operatorType)).toBe(true)
    }
  })
})
