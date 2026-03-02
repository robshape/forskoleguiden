import { describe, expect, it } from 'vitest'

import {
  getClassTokensFromMatch,
  readProjectFile,
} from './helpers/astro-source'

const footerSource = readProjectFile('src/components/astro/Footer.astro')

describe('Footer/attribution shell composition', () => {
  it('applies attribution container class contract with logical spacing', () => {
    const containerClassTokens = getClassTokensFromMatch(
      footerSource,
      /<div[^>]*class="([^"]+)"[^>]*>/,
      'Expected attribution container class contract in Footer.astro',
    )

    for (const token of [
      'mx-auto',
      'w-full',
      'max-w-content',
      'flex',
      'flex-col',
      'gap-1',
      'ps-4',
      'pe-4',
      'py-4',
      'text-sm',
      'text-gray-400',
      'ltr:text-left',
      'rtl:text-right',
    ]) {
      expect(
        containerClassTokens.has(token),
        `Missing attribution container token: ${token}`,
      ).toBe(true)
    }

    // No border-t on attribution — it's page content, not a footer separator
    expect(footerSource).not.toContain('border-t')
    expect(footerSource).not.toContain('border-border')

    expect(footerSource).not.toMatch(/\bpl-\d+\b/)
    expect(footerSource).not.toMatch(/\bpr-\d+\b/)
    expect(footerSource).not.toMatch(/\bpx-\d+\b/)
  })

  it('renders attribution text and link as separate lines', () => {
    // Text is in its own <p>
    expect(footerSource).toMatch(
      /<p>\s*\{t\('attribution\.text',\s*locale\)\}\s*<\/p>/,
    )

    // Link is a standalone <a>, not nested inside the <p>
    const sourceLinkClassTokens = getClassTokensFromMatch(
      footerSource,
      /<a[^>]*class="([^"]+)"[^>]*>/,
      'Expected attribution source link class contract in Footer.astro',
    )

    for (const token of ['text-primary-600', 'underline']) {
      expect(
        sourceLinkClassTokens.has(token),
        `Missing attribution source link token: ${token}`,
      ).toBe(true)
    }
  })

  it('opens source link in a new tab with target="_blank"', () => {
    expect(footerSource).toMatch(/<a[^>]*target="_blank"[^>]*>/)
  })
})
