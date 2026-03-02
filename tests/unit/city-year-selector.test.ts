import { describe, expect, it } from 'vitest'

import {
  getClassTokensFromMatch,
  readProjectFile,
} from './helpers/astro-source'

const selectorSource = readProjectFile(
  'src/components/astro/CityYearSelector.astro',
)

describe('CityYearSelector shell composition', () => {
  it('renders a section with heading, city list, and survey year', () => {
    expect(selectorSource).toMatch(/t\('cityYear\.heading',\s*locale\)/)
    expect(selectorSource).toMatch(/t\('cityYear\.surveyYear',\s*locale\)/)
    // Uses SURVEY_YEAR constant, not a hardcoded literal
    expect(selectorSource).toContain('SURVEY_YEAR')
    expect(selectorSource).toMatch(
      /import\s*\{\s*SURVEY_YEAR\s*\}\s*from\s*['"]@\/lib\/constants['"]/,
    )
  })

  it('uses <section> with aria-label for the city/year region', () => {
    expect(selectorSource).toMatch(/<section[^>]*aria-label=/)
  })

  it('renders heading with uppercase tracking-wide styling', () => {
    const headingClassTokens = getClassTokensFromMatch(
      selectorSource,
      /<p[^>]*class="([^"]+)"[^>]*>\s*\{t\('cityYear\.heading'/,
      'Expected heading class contract in CityYearSelector.astro',
    )

    for (const token of [
      'text-sm',
      'font-semibold',
      'text-gray-500',
      'uppercase',
      'tracking-wide',
    ]) {
      expect(
        headingClassTokens.has(token),
        `Missing heading token: ${token}`,
      ).toBe(true)
    }
  })

  it('applies uniform city button sizing with min-width and centering', () => {
    const activeButtonClassTokens = getClassTokensFromMatch(
      selectorSource,
      /<button[^>]*aria-current="true"[^>]*class="([^"]+)"[^>]*>/,
      'Expected active city button class contract in CityYearSelector.astro',
    )

    for (const token of [
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-lg',
      'bg-primary-600',
      'text-white',
      'text-sm',
      'font-semibold',
    ]) {
      expect(
        activeButtonClassTokens.has(token),
        `Missing active city button token: ${token}`,
      ).toBe(true)
    }

    // Uniform min-width on buttons
    expect(selectorSource).toContain('min-w-[6.25rem]')
  })

  it('renders disabled city buttons with correct styling', () => {
    const disabledChipPattern =
      /<button[\s\S]*?disabled[\s\S]*?class="([^"]+)"[\s\S]*?>[\s\S]*?<\/button>/g

    const disabledMatches = [...selectorSource.matchAll(disabledChipPattern)]

    expect(disabledMatches.length).toBe(2)

    for (const match of disabledMatches) {
      const disabledTokens = new Set(
        (match[1] ?? '')
          .split(/\s+/)
          .map((token) => token.trim())
          .filter(Boolean),
      )

      for (const token of [
        'bg-gray-100',
        'text-gray-400',
        'rounded-lg',
        'cursor-not-allowed',
        'inline-flex',
        'items-center',
        'justify-center',
      ]) {
        expect(
          disabledTokens.has(token),
          `Missing disabled ${match[2]} chip token: ${token}`,
        ).toBe(true)
      }
    }
  })

  it('renders survey year with bold emphasis using SURVEY_YEAR constant', () => {
    expect(selectorSource).toMatch(
      /<strong[^>]*class="font-bold"[^>]*>\{SURVEY_YEAR\}/,
    )
  })

  it('uses i18n keys for city names instead of hardcoded strings', () => {
    expect(selectorSource).toMatch(/t\('cityYear\.cities\.malmo',\s*locale\)/)
    expect(selectorSource).toMatch(
      /t\('cityYear\.cities\.stockholm',\s*locale\)/,
    )
    expect(selectorSource).toMatch(
      /t\('cityYear\.cities\.goteborg',\s*locale\)/,
    )
    // No hardcoded city names
    expect(selectorSource).not.toMatch(/>[\s]*Malmö[\s]*</)
    expect(selectorSource).not.toMatch(/>[\s]*Stockholm[\s]*</)
    expect(selectorSource).not.toMatch(/>[\s]*Göteborg[\s]*</)
  })
})
