import { describe, expect, it } from 'vitest'

import { t } from '@/i18n/utils'

import { collectKeyPaths, getByPath, loadLocaleFromDisk } from './helpers/i18n'

const ARABIC_CHAR_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/

// Keys whose Arabic values intentionally contain no Arabic characters:
// - locale.sv / locale.en: native-script locale labels ("Svenska", "English")
// - directory.compareButtonAriaLabel / directory.scorePercent: placeholder-only templates ("{action}: {name}", "{score}%")
const ARABIC_SCRIPT_ALLOWLIST = new Set([
  'locale.sv',
  'locale.en',
  'directory.compareButtonAriaLabel',
  'directory.scorePercent',
])

describe('arabic translation quality', () => {
  it('should resolve every Arabic key to a non-empty string without raw-key fallback', () => {
    const ar = loadLocaleFromDisk('ar')
    const keyPaths = collectKeyPaths(ar)
    const failures: string[] = []

    for (const keyPath of keyPaths) {
      const resolved = t(keyPath, 'ar')

      if (!resolved || resolved.length === 0) {
        failures.push(`${keyPath}: resolved to empty string`)
      } else if (resolved === keyPath) {
        failures.push(`${keyPath}: resolved to raw key path (fallback)`)
      }
    }

    expect(
      failures,
      `Arabic keys with missing or fallback translations:\n${failures.join('\n')}`,
    ).toHaveLength(0)
  })

  it('should contain Arabic script characters in every user-facing value except allowlisted keys', () => {
    const ar = loadLocaleFromDisk('ar')
    const keyPaths = collectKeyPaths(ar)
    const failures: string[] = []

    for (const keyPath of keyPaths) {
      if (ARABIC_SCRIPT_ALLOWLIST.has(keyPath)) {
        continue
      }

      const value = getByPath(ar, keyPath)

      if (typeof value !== 'string') {
        failures.push(`${keyPath}: value is not a string`)
        continue
      }

      if (!ARABIC_CHAR_REGEX.test(value)) {
        failures.push(`${keyPath}: "${value}" contains no Arabic characters`)
      }
    }

    expect(
      failures,
      `Arabic keys without Arabic script characters:\n${failures.join('\n')}`,
    ).toHaveLength(0)
  })
})
