import { describe, expect, it } from 'vitest'

import type { JsonObject } from './helpers/i18n'
import { collectKeyPaths, getByPath, loadLocaleFromDisk } from './helpers/i18n'

describe('locale parity', () => {
  it('should have identical recursive key paths across sv, en, and ar', () => {
    const sv = loadLocaleFromDisk('sv')
    const en = loadLocaleFromDisk('en')
    const ar = loadLocaleFromDisk('ar')

    const svPaths = collectKeyPaths(sv)

    expect(collectKeyPaths(en), 'en.json keys must match sv.json').toEqual(
      svPaths,
    )
    expect(collectKeyPaths(ar), 'ar.json keys must match sv.json').toEqual(
      svPaths,
    )
  })

  it('should keep summary template placeholders aligned across sv, en, and ar', () => {
    const locales = {
      sv: loadLocaleFromDisk('sv'),
      en: loadLocaleFromDisk('en'),
      ar: loadLocaleFromDisk('ar'),
    } satisfies Record<'sv' | 'en' | 'ar', JsonObject>

    for (const key of ['summary.bestForQuestion', 'summary.tiedForQuestion']) {
      for (const [locale, messages] of Object.entries(locales)) {
        const value = getByPath(messages, key)

        expect(value, `${locale} missing ${key}`).toBeDefined()
        expect(typeof value, `${locale} ${key} must be a string`).toBe('string')

        if (typeof value === 'string') {
          expect(value, `${locale} ${key} missing {question}`).toContain(
            '{question}',
          )
        }
      }
    }
  })
})
