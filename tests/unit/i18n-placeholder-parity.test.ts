import { describe, expect, it } from 'vitest'

import {
  collectKeyPaths,
  extractPlaceholders,
  getByPath,
  loadLocaleFromDisk,
} from './helpers/i18n'

describe('interpolation placeholder parity', () => {
  it('should have identical placeholder token sets across sv, en, and ar for every key', () => {
    const sv = loadLocaleFromDisk('sv')
    const en = loadLocaleFromDisk('en')
    const ar = loadLocaleFromDisk('ar')

    const keyPaths = collectKeyPaths(sv)
    const failures: string[] = []

    for (const keyPath of keyPaths) {
      const svValue = getByPath(sv, keyPath)
      const enValue = getByPath(en, keyPath)
      const arValue = getByPath(ar, keyPath)

      if (
        typeof svValue !== 'string' ||
        typeof enValue !== 'string' ||
        typeof arValue !== 'string'
      ) {
        continue
      }

      const svTokens = extractPlaceholders(svValue)
      const enTokens = extractPlaceholders(enValue)
      const arTokens = extractPlaceholders(arValue)

      const svSet = JSON.stringify(svTokens)
      const enSet = JSON.stringify(enTokens)
      const arSet = JSON.stringify(arTokens)

      if (enSet !== svSet) {
        failures.push(`${keyPath}: en has ${enSet} but sv has ${svSet}`)
      }

      if (arSet !== svSet) {
        failures.push(`${keyPath}: ar has ${arSet} but sv has ${svSet}`)
      }
    }

    expect(
      failures,
      `Placeholder mismatches across locales:\n${failures.join('\n')}`,
    ).toHaveLength(0)
  })
})
