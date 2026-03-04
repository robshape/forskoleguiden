import { describe, expect, it } from 'vitest'
import { collectKeyPaths, loadLocaleFromDisk } from './helpers/i18n'

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
})
