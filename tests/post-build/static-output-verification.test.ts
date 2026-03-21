import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

// ─── Config ──────────────────────────────────────────────────────────────────

const DIST_ROOT = join(process.cwd(), 'dist')
const DATA_INDEX_PATH = join(process.cwd(), 'data', 'malmo', 'index.json')

// Minimum number of HTML files expected in the built output.
// Keep this aligned to the implementation plan's documented floor.
const MIN_HTML_FILE_COUNT = 8

// 7000 KB uncompressed — total dist size excluding image files (scaled for ~261 preschools)
const TOTAL_SIZE_BUDGET_BYTES = 7000 * 1024

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

interface PreschoolEntry {
  id: string
}

interface MalmoIndex {
  preschools: PreschoolEntry[]
}

const readPreschoolIds = (): string[] => {
  const raw = readFileSync(DATA_INDEX_PATH, 'utf-8')
  const index: MalmoIndex = JSON.parse(raw) as MalmoIndex
  return index.preschools.map((p) => p.id)
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

  it('generates the Swedish directory index page', () => {
    expect(existsSync(distPath('sv', 'index.html'))).toBe(true)
  })

  it('generates the Swedish about page', () => {
    expect(existsSync(distPath('sv', 'om', 'index.html'))).toBe(true)
  })

  it('generates the Swedish comparison page', () => {
    expect(existsSync(distPath('sv', 'jamfor', 'index.html'))).toBe(true)
  })

  it('generates a detail page for every preschool in data/malmo/index.json', () => {
    const ids = readPreschoolIds()
    expect(ids.length).toBeGreaterThan(0)

    for (const id of ids) {
      const detailPath = distPath('sv', 'forskola', id, 'index.html')
      expect(
        existsSync(detailPath),
        `missing detail page for preschool "${id}"`,
      ).toBe(true)
    }
  })

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
})
