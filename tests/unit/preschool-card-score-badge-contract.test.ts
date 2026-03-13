import { describe, expect, it } from 'vitest'

import { SCORE_TIER_HIGH, SCORE_TIER_MEDIUM } from '@/lib/constants'

// Mirrors the score badge tone logic in PreschoolCard.astro.
// Extracting it here ensures the thresholds are exercised in unit tests
// even though the Astro component itself is not directly testable.
const getScoreBadgeTone = (displayScore: number | null) => {
  if (displayScore === null) return 'none'
  if (displayScore >= SCORE_TIER_HIGH) return 'high'
  if (displayScore >= SCORE_TIER_MEDIUM) return 'medium'
  return 'low'
}

describe('preschool card score badge tier classification', () => {
  it('classifies null score as none', () => {
    expect(getScoreBadgeTone(null)).toBe('none')
  })

  it('classifies score at SCORE_TIER_HIGH boundary as high', () => {
    expect(getScoreBadgeTone(SCORE_TIER_HIGH)).toBe('high')
  })

  it('classifies score above SCORE_TIER_HIGH as high', () => {
    expect(getScoreBadgeTone(95)).toBe('high')
  })

  it('classifies score just below SCORE_TIER_HIGH as medium', () => {
    expect(getScoreBadgeTone(SCORE_TIER_HIGH - 1)).toBe('medium')
  })

  it('classifies score at SCORE_TIER_MEDIUM boundary as medium', () => {
    expect(getScoreBadgeTone(SCORE_TIER_MEDIUM)).toBe('medium')
  })

  it('classifies score just below SCORE_TIER_MEDIUM as low', () => {
    expect(getScoreBadgeTone(SCORE_TIER_MEDIUM - 1)).toBe('low')
  })

  it('classifies zero score as low', () => {
    expect(getScoreBadgeTone(0)).toBe('low')
  })

  it('exports SCORE_TIER_HIGH as 80 and SCORE_TIER_MEDIUM as 65', () => {
    expect(SCORE_TIER_HIGH).toBe(80)
    expect(SCORE_TIER_MEDIUM).toBe(65)
    expect(SCORE_TIER_HIGH).toBeGreaterThan(SCORE_TIER_MEDIUM)
  })
})
