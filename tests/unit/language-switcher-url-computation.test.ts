import { describe, expect, it } from 'vitest'

import { buildLocaleSwitchUrl } from '../../src/lib/locale-switch'

const BASE = '/forskoleguiden'

describe('buildLocaleSwitchUrl: locale segment replacement', () => {
  it('replaces /sv/ with /en/ on the directory root', () => {
    expect(buildLocaleSwitchUrl(`${BASE}/sv/`, 'en', BASE)).toBe(`${BASE}/en/`)
  })

  it('replaces /sv/ with /ar/ on the directory root', () => {
    expect(buildLocaleSwitchUrl(`${BASE}/sv/`, 'ar', BASE)).toBe(`${BASE}/ar/`)
  })

  it('replaces locale on a preschool detail path and preserves the slug', () => {
    expect(
      buildLocaleSwitchUrl(`${BASE}/sv/forskola/alma-forskola/`, 'en', BASE),
    ).toBe(`${BASE}/en/forskola/alma-forskola/`)
  })

  it('replaces locale on a comparison path', () => {
    expect(buildLocaleSwitchUrl(`${BASE}/sv/jamfor/`, 'ar', BASE)).toBe(
      `${BASE}/ar/jamfor/`,
    )
  })

  it('handles switching from /ar/ to /sv/ on the comparison page', () => {
    expect(buildLocaleSwitchUrl(`${BASE}/ar/jamfor/`, 'sv', BASE)).toBe(
      `${BASE}/sv/jamfor/`,
    )
  })

  it('handles switching from /en/ to /sv/ on a detail page', () => {
    expect(
      buildLocaleSwitchUrl(
        `${BASE}/en/forskola/almgardens-forskola/`,
        'sv',
        BASE,
      ),
    ).toBe(`${BASE}/sv/forskola/almgardens-forskola/`)
  })

  it('handles recognised locale paths without a trailing slash', () => {
    expect(buildLocaleSwitchUrl(`${BASE}/sv`, 'en', BASE)).toBe(`${BASE}/en`)
  })
})

describe('buildLocaleSwitchUrl: fallback when no known locale in path', () => {
  it('falls back to target locale root when path has no locale segment', () => {
    expect(buildLocaleSwitchUrl(`${BASE}/`, 'en', BASE)).toBe(`${BASE}/en/`)
  })

  it('falls back when pathname is only the base path', () => {
    expect(buildLocaleSwitchUrl(BASE, 'sv', BASE)).toBe(`${BASE}/sv/`)
  })

  it('falls back when first segment is unrecognised', () => {
    expect(buildLocaleSwitchUrl(`${BASE}/unknown/page/`, 'ar', BASE)).toBe(
      `${BASE}/ar/`,
    )
  })
})

describe('buildLocaleSwitchUrl: edge cases', () => {
  it('handles empty base path (dev mode / no base)', () => {
    expect(buildLocaleSwitchUrl('/sv/jamfor/', 'en', '')).toBe('/en/jamfor/')
  })

  it('preserves trailing slash in target path', () => {
    const result = buildLocaleSwitchUrl(`${BASE}/sv/`, 'en', BASE)
    expect(result).toMatch(/\/$/)
  })

  it('handles deeply nested paths correctly', () => {
    expect(
      buildLocaleSwitchUrl(
        `${BASE}/sv/forskola/some-long-slug-here/`,
        'ar',
        BASE,
      ),
    ).toBe(`${BASE}/ar/forskola/some-long-slug-here/`)
  })
})
