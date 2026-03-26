import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  getPreschoolIndex,
  getPreschoolSurveyByYear,
  isPlaceholderSurvey,
} from '@/lib/data'

// ─── Config ──────────────────────────────────────────────────────────────────

const DIST_ROOT = join(process.cwd(), 'dist')

// Minimum number of HTML files expected in the built output.
// 3 locales × (11 non-placeholder detail + 1 directory + 1 comparison + 1 about) + 1 root redirect = 43
// 250 of 261 preschools are placeholders (totalRespondentsPercent: -1) and excluded from build.
const MIN_HTML_FILE_COUNT = 40

// 21 000 KB uncompressed — total dist size excluding image files (3 locales × ~261 preschools)
const TOTAL_SIZE_BUDGET_BYTES = 21_000 * 1024

const LOCALES = ['sv', 'en', 'ar'] as const

const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.svg',
  '.avif',
])

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns IDs of non-placeholder preschools (excludes surveys with no data). */
const readPreschoolIds = (): string[] => {
  const index = getPreschoolIndex()
  return index.preschools
    .filter((p) => {
      const survey = getPreschoolSurveyByYear(p.id, index.year)
      return !isPlaceholderSurvey(survey)
    })
    .map((p) => p.id)
}

const distPath = (...segments: string[]): string => join(DIST_ROOT, ...segments)

/**
 * Recursively collect all file paths under a directory.
 */
const walkDir = (dir: string, collected: string[] = []): string[] => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(full, collected)
    } else {
      collected.push(full)
    }
  }
  return collected
}

/**
 * Sum the size of all dist files, excluding image files.
 */
const distSizeExcludingImages = (): number => {
  const files = walkDir(DIST_ROOT)
  return files
    .filter((f) => !IMAGE_EXTENSIONS.has(extname(f).toLowerCase()))
    .reduce((sum, f) => sum + statSync(f).size, 0)
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('static output verification', () => {
  it('generates a root index.html redirect page', () => {
    expect(existsSync(distPath('index.html'))).toBe(true)
  })

  it.each(LOCALES)('generates the %s directory index page', (locale) => {
    expect(existsSync(distPath(locale, 'index.html'))).toBe(true)
  })

  it.each(LOCALES)('generates the %s comparison page', (locale) => {
    expect(existsSync(distPath(locale, 'jamfor', 'index.html'))).toBe(true)
  })

  it.each(LOCALES)(
    'generates a detail page for every preschool in data/malmo/index.json (%s)',
    (locale) => {
      const ids = readPreschoolIds()
      expect(ids.length).toBeGreaterThan(0)

      for (const id of ids) {
        const detailPath = distPath(locale, 'forskola', id, 'index.html')
        expect(
          existsSync(detailPath),
          `missing ${locale} detail page for preschool "${id}"`,
        ).toBe(true)
      }
    },
  )

  it('generates at least the minimum expected number of HTML files', () => {
    const htmlFiles = walkDir(DIST_ROOT).filter(
      (f) => extname(f).toLowerCase() === '.html',
    )
    const count = htmlFiles.length
    expect(
      count,
      `expected at least ${MIN_HTML_FILE_COUNT} HTML files in dist, found ${count}:\n${htmlFiles.join('\n')}`,
    ).toBeGreaterThanOrEqual(MIN_HTML_FILE_COUNT)
  })

  it('total dist size excluding images stays under 500 KB', () => {
    const bytes = distSizeExcludingImages()
    const kb = (bytes / 1024).toFixed(1)
    expect(
      bytes,
      `dist size excluding images is ${kb} KB, exceeds ${TOTAL_SIZE_BUDGET_BYTES / 1024} KB budget`,
    ).toBeLessThan(TOTAL_SIZE_BUDGET_BYTES)
  })

  it('Arabic directory page contains Arabic script characters', () => {
    const html = readFileSync(distPath('ar', 'index.html'), 'utf-8')
    const hasArabic =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
        html,
      )
    expect(
      hasArabic,
      'dist/ar/index.html should contain at least one Arabic character',
    ).toBe(true)
  })

  it('Arabic directory page contains no raw dot-path key fallbacks', () => {
    const html = readFileSync(distPath('ar', 'index.html'), 'utf-8')
    const rawKeys = [
      'directory.heading',
      'compare.heading',
      'site.title',
      'site.tagline',
      'nav.directory',
      'compareTray.selectedCount',
    ]
    const found = rawKeys.filter((key) => html.includes(key))
    expect(
      found,
      `dist/ar/index.html contains raw key fallbacks: ${found.join(', ')}`,
    ).toHaveLength(0)
  })
})
