import { describe, expect, it } from 'vitest'

import { SCORE_TIER_HIGH, SCORE_TIER_MEDIUM } from '@/lib/constants'
import { getScoreTier } from '@/lib/scoring'

describe('preschool card score badge tier classification', () => {
  it('classifies null score as none', () => {
    expect(getScoreTier(null)).toBe('none')
  })

  it('classifies score at SCORE_TIER_HIGH boundary as high', () => {
    expect(getScoreTier(SCORE_TIER_HIGH)).toBe('high')
  })

  it('classifies score above SCORE_TIER_HIGH as high', () => {
    expect(getScoreTier(95)).toBe('high')
  })

  it('classifies score just below SCORE_TIER_HIGH as medium', () => {
    expect(getScoreTier(SCORE_TIER_HIGH - 1)).toBe('medium')
  })

  it('classifies score at SCORE_TIER_MEDIUM boundary as medium', () => {
    expect(getScoreTier(SCORE_TIER_MEDIUM)).toBe('medium')
  })

  it('classifies score just below SCORE_TIER_MEDIUM as low', () => {
    expect(getScoreTier(SCORE_TIER_MEDIUM - 1)).toBe('low')
  })

  it('classifies zero score as low', () => {
    expect(getScoreTier(0)).toBe('low')
  })

  it('exports SCORE_TIER_HIGH as 80 and SCORE_TIER_MEDIUM as 65', () => {
    expect(SCORE_TIER_HIGH).toBe(80)
    expect(SCORE_TIER_MEDIUM).toBe(65)
    expect(SCORE_TIER_HIGH).toBeGreaterThan(SCORE_TIER_MEDIUM)
  })
})
