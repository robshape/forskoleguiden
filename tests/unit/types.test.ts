import { describe, expect, it } from 'vitest'

import type { PreschoolIndex, PreschoolSurvey } from '@/lib/types'
import { assertResponseShape } from './helpers/survey-assertions'

describe('Step 1.1 data interface contracts', () => {
  it('matches required PreschoolSurvey and SurveyResponse key sets', () => {
    const sampleSurvey: PreschoolSurvey = {
      id: 'testforskola',
      preschoolName: 'Testförskolan',
      address: 'Testgatan 1, Malmö',
      surveyYear: 2025,
      totalRespondentsPercent: 64,
      questionGroups: [
        {
          name: 'Helhetsbedömning',
          questions: [
            {
              text: 'Mitt barn är tryggt i förskolan',
              response: {
                completelyAgreePercent: 58,
                partlyAgreePercent: 24,
                neitherAgreeNorDisagreePercent: 10,
                partlyDisagreePercent: 5,
                completelyDisagreePercent: 3,
              },
            },
            {
              text: 'Jag skulle rekommendera mitt barns förskola till en annan förälder',
              response: {
                completelyAgreePercent: 63,
                partlyAgreePercent: 21,
                neitherAgreeNorDisagreePercent: 8,
                partlyDisagreePercent: 4,
                completelyDisagreePercent: 4,
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
      'totalRespondentsPercent',
      'questionGroups',
    ]

    expect(Object.keys(sampleSurvey).sort()).toEqual(
      expectedTopLevelKeys.sort(),
    )

    for (const group of sampleSurvey.questionGroups) {
      for (const question of group.questions) {
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
