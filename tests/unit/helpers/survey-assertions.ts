import { expect } from 'vitest'
import type { SurveyResponse } from '@/lib/types'

export const expectedResponseKeys = [
  'completelyAgreePercent',
  'partlyAgreePercent',
  'neitherAgreeNorDisagreePercent',
  'partlyDisagreePercent',
  'completelyDisagreePercent',
] as const

/**
 * Asserts that a SurveyResponse has exactly the expected 5 keys with numeric values.
 */
export const assertResponseShape = (response: SurveyResponse) => {
  expect(Object.keys(response).sort()).toEqual(
    expectedResponseKeys.slice().sort(),
  )

  for (const key of expectedResponseKeys) {
    expect(typeof response[key]).toBe('number')
  }
}

/**
 * Full contract assertion: shape + range (0..100 per key) + sum (~100 ±1).
 * Use `contextLabel` to identify which response failed in multi-file test runs.
 */
export const assertResponseContract = (
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
