import { resolve } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getAllPreschoolSurveys,
  getPreschoolIndex,
  getPreschoolSurvey,
} from '@/lib/data'
import { getMalmoIndex, getMalmoSurveyFilePath } from './helpers/malmo-data'
import { assertResponseShape } from './helpers/survey-assertions'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Step 1.4 data-loading utility', () => {
  it('returns preschool index from getPreschoolIndex', () => {
    const index = getPreschoolIndex()

    expect(index.city).toBe('Malmö')
    expect(index.year).toBe(2025)
    expect(index.preschools.length).toBeGreaterThanOrEqual(5)
  })

  it('returns known preschool survey from getPreschoolSurvey', () => {
    const index = getMalmoIndex()
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
      return
    }

    expect(helhetsbedomning.questions.length).toBeGreaterThan(0)
    assertResponseShape(helhetsbedomning.questions[0].response)
  })

  it('throws clear error for unknown preschool id', () => {
    const missingId = 'nonexistent-preschool-id'
    const index = getMalmoIndex()
    const expectedPath = getMalmoSurveyFilePath(missingId, index.year)

    expect(() => getPreschoolSurvey(missingId)).toThrowError(missingId)
    expect(() => getPreschoolSurvey(missingId)).toThrowError(expectedPath)
  })

  it('returns all surveys from getAllPreschoolSurveys in index order', () => {
    const index = getMalmoIndex()
    const surveys = getAllPreschoolSurveys()
    const expectedOrder = index.preschools.map((preschool) => preschool.id)

    expect(surveys.length).toBe(index.preschools.length)
    expect(surveys.map((survey) => survey.id)).toEqual(expectedOrder)
  })

  it('reads Malmö index exactly once when loading all surveys', () => {
    const indexPathSuffix = resolve('data/malmo/index.json')

    return (async () => {
      vi.resetModules()
      const actualFs =
        await vi.importActual<typeof import('node:fs')>('node:fs')
      const readFileSyncSpy = vi.fn(actualFs.readFileSync)

      vi.doMock('node:fs', () => ({
        ...actualFs,
        readFileSync: readFileSyncSpy,
      }))

      try {
        const dataModule = await import('@/lib/data')

        dataModule.getAllPreschoolSurveys()

        const indexReadCount = readFileSyncSpy.mock.calls.filter(([filePath]) =>
          String(filePath).endsWith(indexPathSuffix),
        ).length

        expect(indexReadCount).toBe(1)
      } finally {
        vi.doUnmock('node:fs')
        vi.resetModules()
      }
    })()
  })
})
