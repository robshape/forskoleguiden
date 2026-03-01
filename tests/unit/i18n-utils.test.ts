import { describe, expect, it } from 'vitest'

import sv from '@/i18n/sv.json'
import { getLocaleFromURL, t } from '@/i18n/utils'

describe('Step 2.3 i18n utilities contract', () => {
  describe('getLocaleFromURL', () => {
    it("returns 'sv' for /sv/", () => {
      expect(getLocaleFromURL('/sv/')).toBe('sv')
    })

    it("returns 'en' for /en/compare", () => {
      expect(getLocaleFromURL('/en/compare')).toBe('en')
    })

    it("returns 'ar' for /ar/", () => {
      expect(getLocaleFromURL('/ar/')).toBe('ar')
    })

    it("defaults to 'sv' for root path /", () => {
      expect(getLocaleFromURL('/')).toBe('sv')
    })

    it('accepts URL objects', () => {
      expect(getLocaleFromURL(new URL('https://x.test/en/compare'))).toBe('en')
    })
  })

  describe('t', () => {
    it('returns Swedish title for site.title in sv locale', () => {
      expect(t('site.title', 'sv')).toBe(sv.site.title)
    })

    it('falls back to the key for missing key paths', () => {
      expect(t('nonexistent.key', 'sv')).toBe('nonexistent.key')
    })

    it('falls back to the key when lookup resolves to non-string', () => {
      expect(t('site', 'sv')).toBe('site')
    })
  })
})
