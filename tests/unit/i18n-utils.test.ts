import { describe, expect, it } from 'vitest'

import sv from '@/i18n/sv.json'
import { getLocaleFromURL, t } from '@/i18n/utils'

describe('i18n utilities', () => {
  it('should extract the correct locale from various URL formats', () => {
    // Recognizes each supported locale from a pathname string
    expect(getLocaleFromURL('/sv/')).toBe('sv')
    expect(getLocaleFromURL('/en/compare')).toBe('en')
    expect(getLocaleFromURL('/ar/')).toBe('ar')

    // Defaults to Swedish when the path has no locale prefix
    expect(getLocaleFromURL('/')).toBe('sv')

    // Also accepts a URL object, not just a string
    expect(getLocaleFromURL(new URL('https://x.test/en/compare'))).toBe('en')
  })

  it('should resolve translation keys and fall back gracefully', () => {
    // Returns the translated string for a valid dot-path key
    expect(t('site.title', 'sv')).toBe(sv.site.title)

    // Replaces template placeholders when params are provided
    expect(t('directory.scorePercent', 'sv', { score: 87.5 })).toBe('87.5 %')

    // Leaves unresolved placeholders untouched when param is missing
    expect(t('summary.higher', 'sv', { left: 'A', right: 'B' })).toContain(
      '{question}',
    )

    // Falls back to the raw key string when the key does not exist
    expect(t('nonexistent.key', 'sv')).toBe('nonexistent.key')

    // Falls back to the raw key string when the lookup resolves to a non-string (object)
    expect(t('site', 'sv')).toBe('site')
  })
})
