import { describe, expect, it } from 'vitest'

import {
  getClassTokensFromMatch,
  readProjectFile,
} from './helpers/astro-source'

const footerSource = readProjectFile('src/components/astro/Footer.astro')

describe('Footer shell composition', () => {
  it('applies Phase A footer visual class contract with logical spacing', () => {
    const separationClassTokens = getClassTokensFromMatch(
      footerSource,
      /<div[^>]*class="([^"]+)"[^>]*>/,
      'Expected footer separation container class contract in Footer.astro',
    )

    for (const token of ['border-t', 'border-border']) {
      expect(
        separationClassTokens.has(token),
        `Missing footer separation token: ${token}`,
      ).toBe(true)
    }

    const attributionClassTokens = getClassTokensFromMatch(
      footerSource,
      /<p[^>]*class="([^"]+)"[^>]*>\s*\{t\('attribution\.text',\s*locale\)\}/,
      'Expected footer attribution class contract in Footer.astro',
    )

    for (const token of [
      'mx-auto',
      'w-full',
      'max-w-content',
      'ps-4',
      'pe-4',
      'py-4',
      'text-sm',
      'text-gray-400',
      'ltr:text-left',
      'rtl:text-right',
    ]) {
      expect(
        attributionClassTokens.has(token),
        `Missing footer attribution token: ${token}`,
      ).toBe(true)
    }

    expect(footerSource).not.toMatch(/\bpl-\d+\b/)
    expect(footerSource).not.toMatch(/\bpr-\d+\b/)
    expect(footerSource).not.toMatch(/\bpx-\d+\b/)

    const sourceLinkClassTokens = getClassTokensFromMatch(
      footerSource,
      /<a[^>]*class="([^"]+)"[^>]*>/,
      'Expected footer source link class contract in Footer.astro',
    )

    for (const token of ['text-primary-600', 'underline']) {
      expect(
        sourceLinkClassTokens.has(token),
        `Missing footer source link token: ${token}`,
      ).toBe(true)
    }
  })
})
