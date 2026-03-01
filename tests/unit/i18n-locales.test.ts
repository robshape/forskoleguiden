import { describe, expect, it } from 'vitest'
import {
  collectKeyPaths,
  loadLocaleFromDisk,
  type JsonObject,
} from './helpers/i18n'

describe('Step 2.2 locale parity contract', () => {
  it('catches nested-key mismatches that top-level checks miss', () => {
    const baseline: JsonObject = {
      section: {
        nestedA: 'value-a',
      },
    }
    const mutated: JsonObject = {
      section: {
        nestedB: 'value-b',
      },
    }

    expect(Object.keys(mutated).sort()).toEqual(Object.keys(baseline).sort())
    expect(collectKeyPaths(mutated)).not.toEqual(collectKeyPaths(baseline))
  })

  it('matches recursive key paths across sv/en/ar locales', () => {
    const sv = loadLocaleFromDisk('sv')
    const en = loadLocaleFromDisk('en')
    const ar = loadLocaleFromDisk('ar')

    const svPaths = collectKeyPaths(sv)
    const enPaths = collectKeyPaths(en)
    const arPaths = collectKeyPaths(ar)

    expect(
      enPaths,
      'Recursive key paths must match sv.json for en.json',
    ).toEqual(svPaths)
    expect(
      arPaths,
      'Recursive key paths must match sv.json for ar.json',
    ).toEqual(svPaths)
  })
})
