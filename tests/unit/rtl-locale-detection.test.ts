import { describe, expect, it } from 'vitest'

import { isRtlLocale } from '../../src/lib/locale-switch'

describe('isRtlLocale', () => {
  it('returns true for arabic', () => {
    expect(isRtlLocale('ar')).toBe(true)
  })

  it('returns false for swedish and english', () => {
    expect(isRtlLocale('sv')).toBe(false)
    expect(isRtlLocale('en')).toBe(false)
  })
})
