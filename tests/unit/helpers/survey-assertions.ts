import { expect } from 'vitest'

import type { SurveyResponse } from '@/lib/types'

export const expectedResponseKeys = [
  'completelyAgreePercent',
  'partlyAgreePercent',
  'neitherAgreeNorDisagreePercent',
  'partlyDisagreePercent',
  'completelyDisagreePercent',
] as const

export const assertResponseShape = (response: SurveyResponse) => {
  expect(Object.keys(response).sort()).toEqual(
    expectedResponseKeys.slice().sort(),
  )

  for (const key of expectedResponseKeys) {
    expect(typeof response[key]).toBe('number')
  }
}
