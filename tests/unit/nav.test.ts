import { describe, expect, it } from 'vitest'

import {
  getClassTokens,
  getClassTokensFromMatch,
  readProjectFile,
} from './helpers/astro-source'

const navSource = readProjectFile('src/components/astro/Nav.astro')

describe('Nav shell composition', () => {
  it('uses locale-based translation key for language placeholder in Nav', () => {
    expect(navSource).toMatch(
      /import\s+\{\s*t\s*,\s*type\s+Locale\s*\}\s+from\s+['"]@\/i18n\/utils['"]|import\s+\{\s*type\s+Locale\s*,\s*t\s*\}\s+from\s+['"]@\/i18n\/utils['"]/,
    )
    expect(navSource).toMatch(/t\('nav\.ariaLabel',\s*locale\)/)
    expect(navSource).toMatch(/t\('nav\.languagePlaceholder',\s*locale\)/)
  })

  it('applies Phase A nav visual shell class contract', () => {
    const navClassTokens = getClassTokens(navSource, 'nav')

    for (const token of ['bg-surface', 'border-b', 'border-border']) {
      expect(navClassTokens.has(token), `Missing nav token: ${token}`).toBe(
        true,
      )
    }

    const containerClassTokens = getClassTokensFromMatch(
      navSource,
      /<div[^>]*class="([^"]+)"[^>]*>/,
      'Expected nav inner container class contract in Nav.astro',
    )

    for (const token of [
      'mx-auto',
      'flex',
      'w-full',
      'max-w-content',
      'items-center',
      'gap-2',
      'px-4',
      'py-4',
    ]) {
      expect(
        containerClassTokens.has(token),
        `Missing nav container token: ${token}`,
      ).toBe(true)
    }

    const siteLinkClassTokens = getClassTokensFromMatch(
      navSource,
      /<a[^>]*class="([^"]+)"[^>]*>\s*Förskoleguiden\s*<\/a>/,
      'Expected site name link class contract in Nav.astro',
    )

    for (const token of ['text-xl', 'font-bold', 'text-start']) {
      expect(
        siteLinkClassTokens.has(token),
        `Missing site link token: ${token}`,
      ).toBe(true)
    }

    expect(siteLinkClassTokens.has('ltr:text-left')).toBe(false)
    expect(siteLinkClassTokens.has('rtl:text-right')).toBe(false)

    const languageClassTokens = getClassTokensFromMatch(
      navSource,
      /<span[^>]*class="([^"]+)"[^>]*>\s*\{t\('nav\.languagePlaceholder',\s*locale\)\}\s*<\/span>/,
      'Expected language placeholder class contract in Nav.astro',
    )

    for (const token of [
      'bg-gray-100',
      'rounded-full',
      'px-4',
      'py-1',
      'text-sm',
      'font-semibold',
      'ms-auto',
    ]) {
      expect(
        languageClassTokens.has(token),
        `Missing language placeholder token: ${token}`,
      ).toBe(true)
    }

    expect(languageClassTokens.has('ltr:ml-auto')).toBe(false)
    expect(languageClassTokens.has('rtl:mr-auto')).toBe(false)
  })

  it('does not contain city picker or year in nav (moved to CityYearSelector)', () => {
    expect(navSource).not.toContain('Malmö')
    expect(navSource).not.toContain('Stockholm')
    expect(navSource).not.toContain('Göteborg')
    expect(navSource).not.toContain('2025')
  })

  it('avoids physical left/right padding utilities in Nav classes', () => {
    expect(navSource).not.toMatch(/\bpl-\d+\b/)
    expect(navSource).not.toMatch(/\bpr-\d+\b/)
  })
})
