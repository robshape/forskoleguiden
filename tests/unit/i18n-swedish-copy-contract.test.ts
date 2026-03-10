import { describe, expect, it } from 'vitest'

import sv from '@/i18n/sv.json'

import { getByPath, type JsonObject } from './helpers/i18n'

describe('Swedish translation keys', () => {
  it('should have all required namespaces, key paths, and approved Swedish copy', () => {
    // Phase 1 namespaces must exist as objects
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
      'cityYear',
    ]) {
      const value = getByPath(sv as JsonObject, namespace)

      expect(value, `Missing namespace: ${namespace}`).toBeDefined()
      expect(typeof value, `Namespace must be object: ${namespace}`).toBe(
        'object',
      )
    }

    // Every required dot-path must resolve to a non-empty string
    const requiredPaths = [
      'site.title',
      'site.tagline',
      'directory.heading',
      'directory.sort.ranking',
      'directory.sort.alphabetical',
      'directory.sort.groupLabel',
      'directory.sort.label',
      'directory.operatorType.municipal',
      'directory.operatorType.independent',
      'directory.listAriaLabel',
      'directory.addToCompare',
      'directory.addedToCompare',
      'directory.compareButtonAriaLabel',
      'directory.noOverallScore',
      'directory.scorePercent',
      'directory.scoreBadge.agreeShare',
      'directory.scoreBadge.overallAssessment',
      'compare.heading',
      'compare.emptyStateTitle',
      'compare.emptyStateBody',
      'compare.singleSelectionPrompt',
      'compare.questionColumnLabel',
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
      'about.heading',
      'about.text',
      'about.body',
      'nav.directory',
      'nav.compare',
      'nav.about',
      'cityYear.heading',
      'cityYear.surveyYear',
      'cityYear.cities.malmo',
      'cityYear.cities.stockholm',
      'cityYear.cities.goteborg',
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

    // Approved Swedish copy for specific keys
    expect(getByPath(sv as JsonObject, 'directory.sort.ranking')).toBe('Betyg')
    expect(getByPath(sv as JsonObject, 'directory.sort.groupLabel')).toBe(
      'Sortering',
    )
    expect(getByPath(sv as JsonObject, 'directory.addedToCompare')).toBe(
      'Tillagd',
    )
    expect(getByPath(sv as JsonObject, 'responses.partlyDisagree')).toBe(
      'Instämmer inte delvis',
    )
  })

  it('should include required template placeholders in summary and tray keys', () => {
    // summary.higher / lower / similar must contain {left}, {right}, {question}
    for (const key of ['summary.higher', 'summary.lower', 'summary.similar']) {
      const value = getByPath(sv as JsonObject, key)

      expect(typeof value, `${key} must be a string`).toBe('string')

      if (typeof value === 'string') {
        expect(value, `${key} missing {left}`).toContain('{left}')
        expect(value, `${key} missing {right}`).toContain('{right}')
        expect(value, `${key} missing {question}`).toContain('{question}')
      }
    }

    // compareTray.selectedCount must contain {count}
    const selectedCount = getByPath(
      sv as JsonObject,
      'compareTray.selectedCount',
    )

    expect(
      selectedCount,
      'compareTray.selectedCount must be defined',
    ).toBeDefined()
    expect(
      typeof selectedCount,
      'compareTray.selectedCount must be a string',
    ).toBe('string')

    if (typeof selectedCount === 'string') {
      expect(
        selectedCount,
        'compareTray.selectedCount missing {count}',
      ).toContain('{count}')
    }

    // attribution.text must contain {year}
    const attributionText = getByPath(sv as JsonObject, 'attribution.text')

    expect(attributionText, 'attribution.text must be defined').toBeDefined()
    expect(typeof attributionText, 'attribution.text must be a string').toBe(
      'string',
    )

    if (typeof attributionText === 'string') {
      expect(attributionText, 'attribution.text missing {year}').toContain(
        '{year}',
      )
    }
  })
})
