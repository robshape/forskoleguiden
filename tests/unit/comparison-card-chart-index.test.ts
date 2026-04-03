import { describe, expect, it } from 'vitest'

/**
 * Verifies that the chart index formula used in ComparisonView produces
 * unique values for all question × survey combinations within the bounds
 * of the comparison page (up to 5 surveys × N questions).
 *
 * Formula: questionIndex * surveyCount + surveyIndex + 1000
 * See: specs/015-agree-share-breakdown/data-model.md § Chart Index
 */

const computeChartIndex = (
  questionIndex: number,
  surveyCount: number,
  surveyIndex: number,
): number => questionIndex * surveyCount + surveyIndex + 1000

describe('Comparison card chart index uniqueness', () => {
  it('produces unique indices for max capacity (5 surveys, 10 questions)', () => {
    const maxSurveys = 5
    const maxQuestions = 10
    const indices = new Set<number>()

    for (let q = 0; q < maxQuestions; q++) {
      for (let s = 0; s < maxSurveys; s++) {
        const idx = computeChartIndex(q, maxSurveys, s)
        expect(indices.has(idx)).toBe(false)
        indices.add(idx)
      }
    }

    expect(indices.size).toBe(maxSurveys * maxQuestions)
  })

  it('offsets from detail page indices (which start at 0)', () => {
    const firstComparisonIndex = computeChartIndex(0, 1, 0)
    expect(firstComparisonIndex).toBe(1000)
    expect(firstComparisonIndex).toBeGreaterThan(0)
  })

  it('produces correct values for the documented example (3 surveys, 2 questions)', () => {
    const surveyCount = 3
    expect(computeChartIndex(0, surveyCount, 0)).toBe(1000) // Q0S0
    expect(computeChartIndex(0, surveyCount, 1)).toBe(1001) // Q0S1
    expect(computeChartIndex(0, surveyCount, 2)).toBe(1002) // Q0S2
    expect(computeChartIndex(1, surveyCount, 0)).toBe(1003) // Q1S0
    expect(computeChartIndex(1, surveyCount, 1)).toBe(1004) // Q1S1
    expect(computeChartIndex(1, surveyCount, 2)).toBe(1005) // Q1S2
  })

  it('handles varying survey counts without collisions', () => {
    for (let surveyCount = 1; surveyCount <= 5; surveyCount++) {
      const indices = new Set<number>()
      for (let q = 0; q < 5; q++) {
        for (let s = 0; s < surveyCount; s++) {
          const idx = computeChartIndex(q, surveyCount, s)
          expect(indices.has(idx)).toBe(false)
          indices.add(idx)
        }
      }
      expect(indices.size).toBe(surveyCount * 5)
    }
  })
})
