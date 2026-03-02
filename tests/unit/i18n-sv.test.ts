import { describe, expect, it } from 'vitest'

import sv from '@/i18n/sv.json'

import { getByPath, type JsonObject } from './helpers/i18n'

describe('Step 2.1 Swedish i18n contract', () => {
  it('loads sv.json as an object with required Phase 1 namespaces', () => {
    expect(sv).toBeDefined()
    expect(typeof sv).toBe('object')

    for (const namespace of [
      'site',
      'nav',
      'directory',
      'compareTray',
      'compare',
      'responses',
      'summary',
      'attribution',
      'about',
    ]) {
      const value = getByPath(sv as JsonObject, namespace)

      expect(value, `Missing namespace: ${namespace}`).toBeDefined()
      expect(typeof value, `Namespace must be object: ${namespace}`).toBe(
        'object',
      )
    }
  })

  it('contains required Phase 1 key paths and labels', () => {
    const requiredPaths = [
      'site.title',
      'site.tagline',
      'directory.heading',
      'directory.sort.ranking',
      'directory.sort.alphabetical',
      'directory.operatorType.municipal',
      'directory.operatorType.independent',
      'directory.addToCompare',
      'compare.heading',
      'compare.emptyStateTitle',
      'compare.emptyStateBody',
      'compare.actions.backToDirectory',
      'compare.actions.clearSelection',
      'compareTray.showComparison',
      'compareTray.clear',
      'responses.completelyAgree',
      'responses.partlyAgree',
      'responses.neitherAgreeNorDisagree',
      'responses.partlyDisagree',
      'responses.completelyDisagree',
      'summary.higher',
      'summary.lower',
      'summary.similar',
      'attribution.text',
      'attribution.sourceLinkLabel',
      'about.heading',
      'about.text',
      'nav.directory',
      'nav.compare',
      'nav.about',
    ]

    for (const path of requiredPaths) {
      const value = getByPath(sv as JsonObject, path)

      expect(value, `Missing key path: ${path}`).toBeDefined()
      expect(typeof value, `Key path must be string: ${path}`).toBe('string')

      if (typeof value === 'string') {
        expect(
          value.trim().length,
          `Key path must be non-empty string: ${path}`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it('uses approved Swedish copy for sort ranking and partly disagree response', () => {
    expect(getByPath(sv as JsonObject, 'directory.sort.ranking')).toBe(
      'Rankning',
    )
    expect(getByPath(sv as JsonObject, 'responses.partlyDisagree')).toBe(
      'Instämmer inte delvis',
    )
  })

  it('summary.higher includes required placeholders', () => {
    const higher = getByPath(sv as JsonObject, 'summary.higher')

    expect(typeof higher).toBe('string')

    if (typeof higher === 'string') {
      expect(higher).toContain('{left}')
      expect(higher).toContain('{right}')
      expect(higher).toContain('{question}')
    }
  })

  it('summary.lower includes required placeholders', () => {
    const lower = getByPath(sv as JsonObject, 'summary.lower')

    expect(typeof lower).toBe('string')

    if (typeof lower === 'string') {
      expect(lower).toContain('{left}')
      expect(lower).toContain('{right}')
      expect(lower).toContain('{question}')
    }
  })

  it('summary.similar includes required placeholders', () => {
    const similar = getByPath(sv as JsonObject, 'summary.similar')

    expect(typeof similar).toBe('string')

    if (typeof similar === 'string') {
      expect(similar).toContain('{left}')
      expect(similar).toContain('{right}')
      expect(similar).toContain('{question}')
    }
  })

  it('includes compare tray count placeholder', () => {
    const selectedCount = getByPath(
      sv as JsonObject,
      'compareTray.selectedCount',
    )

    expect(selectedCount).toBeDefined()
    expect(typeof selectedCount).toBe('string')

    if (typeof selectedCount === 'string') {
      expect(selectedCount).toContain('{count}')
    }
  })
})
