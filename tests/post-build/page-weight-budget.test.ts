import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

// ─── Config ──────────────────────────────────────────────────────────────────

const DIST_ROOT = join(process.cwd(), 'dist')
const LOCALES = ['sv', 'en', 'ar'] as const
const ASTRO_ASSETS_DIR = join(DIST_ROOT, '_astro')

// 600 KB uncompressed — scaled from Step 11.3 threshold (100 KB for 11 preschools → 600 KB for ~261)
const PAGE_WEIGHT_BUDGET_BYTES = 600 * 1024

// ─── Helpers ─────────────────────────────────────────────────────────────────

const resolveDistAsset = (href: string): string | null => {
  const match = href.match(/\/_astro\/([^"'?#]+)/)
  if (!match) return null
  return join(ASTRO_ASSETS_DIR, match[1])
}

/**
 * Sum bytes of assets linked via <link rel="stylesheet">,
 * <link rel="modulepreload" as="script">, and <script src="...">.
 *
 * Paths are deduplicated before summing so that files emitted both as a
 * modulepreload link AND as a <script src="..."> (a common Astro pattern) are
 * counted only once.
 *
 * Note: `as="script"` is required on modulepreload links so we only count JS
 * payloads. Astro always emits this attribute on JavaScript modulepreloads;
 * omitting it would accidentally include image/font prefetch links in the
 * budget.
 */
const extractLinkedAssetBytes = (html: string): number => {
  const assetPaths = new Set<string>()

  for (const [, attrs] of html.matchAll(/<link([^>]+)>/gi)) {
    const isStylesheet = /rel=["']stylesheet["']/.test(attrs)
    // Restrict to as="script" — Astro always emits this for JS modulepreloads.
    const isModulePreloadScript =
      /rel=["']modulepreload["']/.test(attrs) && /as=["']script["']/.test(attrs)
    if (!isStylesheet && !isModulePreloadScript) continue
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/)
    if (!hrefMatch) continue
    const filePath = resolveDistAsset(hrefMatch[1])
    if (filePath && existsSync(filePath)) {
      assetPaths.add(filePath)
    }
  }

  for (const [, attrs] of html.matchAll(/<script([^>]+)>/gi)) {
    const srcMatch = attrs.match(/src=["']([^"']+)["']/)
    if (!srcMatch) continue
    const filePath = resolveDistAsset(srcMatch[1])
    if (filePath && existsSync(filePath)) {
      assetPaths.add(filePath)
    }
  }

  let bytes = 0
  for (const filePath of assetPaths) {
    bytes += statSync(filePath).size
  }
  return bytes
}

/**
 * Collect deduplicated file paths for all Astro island JS bundles referenced
 * via `component-url` and `renderer-url` attributes on <astro-island> elements.
 *
 * These bundles are NOT emitted as <link rel="modulepreload"> or <script src>
 * on the /sv/ directory page because Astro defers client:only islands and
 * inlines lazy-load logic. Without this collector the budget misses the JS
 * that the browser actually fetches at runtime.
 */
export const collectIslandAssetPaths = (html: string): Set<string> => {
  const assetPaths = new Set<string>()

  for (const [, attrs] of html.matchAll(/<astro-island([^>]*)>/gi)) {
    for (const attrName of ['component-url', 'renderer-url']) {
      const match = attrs.match(new RegExp(`${attrName}=["']([^"']+)["']`))
      if (!match) continue
      const filePath = resolveDistAsset(match[1])
      if (filePath && existsSync(filePath)) {
        assetPaths.add(filePath)
      }
    }
  }

  return assetPaths
}

/** Sum bytes of Astro island JS bundles (component-url + renderer-url, deduplicated). */
const extractIslandAssetBytes = (html: string): number => {
  let bytes = 0
  for (const filePath of collectIslandAssetPaths(html)) {
    bytes += statSync(filePath).size
  }
  return bytes
}

/** Sum bytes of inline <script> blocks (those with no src attribute). */
const extractInlineScriptBytes = (html: string): number => {
  let bytes = 0
  for (const [, attrs, content] of html.matchAll(
    /<script([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    if (/\bsrc\s*=/.test(attrs)) continue
    bytes += Buffer.byteLength(content, 'utf8')
  }
  return bytes
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe.each(LOCALES)('/%s/ page-weight budget', (locale) => {
  const INDEX_PATH = join(DIST_ROOT, locale, 'index.html')

  it('island asset collector finds component-url and renderer-url JS bundles', () => {
    expect(
      existsSync(INDEX_PATH),
      `dist/${locale}/index.html not found — run "pnpm build" before this test suite`,
    ).toBe(true)

    const html = readFileSync(INDEX_PATH, 'utf8')
    const islandPaths = collectIslandAssetPaths(html)

    expect(
      islandPaths.size,
      `expected at least one Astro island JS bundle for /${locale}/`,
    ).toBeGreaterThan(0)

    for (const filePath of islandPaths) {
      expect(
        existsSync(filePath),
        `island asset not found on disk: ${filePath}`,
      ).toBe(true)
    }
  })

  it('page payload stays under the budget including HTML, linked CSS, linked JS, island JS bundles (inline scripts are already counted inside HTML bytes)', () => {
    expect(
      existsSync(INDEX_PATH),
      `dist/${locale}/index.html not found — run "pnpm build" before this test suite`,
    ).toBe(true)

    const html = readFileSync(INDEX_PATH, 'utf8')
    const htmlBytes = Buffer.byteLength(html, 'utf8')
    const linkedAssetBytes = extractLinkedAssetBytes(html)
    const islandAssetBytes = extractIslandAssetBytes(html)
    // Inline scripts live inside the HTML file so their bytes are already
    // captured by htmlBytes. We compute them only for the diagnostic breakdown.
    const inlineScriptBytes = extractInlineScriptBytes(html)
    const totalBytes = htmlBytes + linkedAssetBytes + islandAssetBytes

    expect(
      totalBytes,
      `/${locale}/ page payload is ${(totalBytes / 1024).toFixed(1)} KB — budget is ${(PAGE_WEIGHT_BUDGET_BYTES / 1024).toFixed(0)} KB. ` +
        `Breakdown: HTML ${(htmlBytes / 1024).toFixed(1)} KB (incl. ${(inlineScriptBytes / 1024).toFixed(1)} KB inline scripts), ` +
        `linked assets ${(linkedAssetBytes / 1024).toFixed(1)} KB, ` +
        `island JS ${(islandAssetBytes / 1024).toFixed(1)} KB`,
    ).toBeLessThan(PAGE_WEIGHT_BUDGET_BYTES)
  })
})
