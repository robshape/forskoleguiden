import { describe, expect, it } from 'vitest'

import sv from '@/i18n/sv.json'

import { getByPath, type JsonObject } from './helpers/i18n'

describe('Swedish translation keys', () => {
  it('should have all required namespaces, key paths, and approved Swedish copy', () => {
    // Phase 1 namespaces must exist as objects
    for (const namespace of [
      'site',
      'locale',
      'nav',
      'directory',
      'compareTray',
      'compare',
      'responses',
      'summary',
      'attribution',
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
      'directory.removeFromCompare',
      'directory.compareButtonAriaLabel',
      'directory.noData',
      'directory.noOverallScore',
      'directory.scorePercent',
      'directory.scoreBadge.agreeShare',
      'directory.scoreBadge.overallAssessment',
      'compare.heading',
      'compare.summaryHeading',
      'compare.emptyStateTitle',
      'compare.emptyStateBody',
      'compare.singleSelectionPrompt',
      'compare.questionColumnLabel',
      'compare.actions.backToDirectory',
      'compare.actions.backToComparison',
      'compare.actions.clearSelection',
      'compare.chartAriaLabel',
      'compare.noscriptMessage',
      'survey.results',
      'compareTray.showComparison',
      'compareTray.clear',
      'responses.completelyAgree',
      'responses.partlyAgree',
      'responses.neitherAgreeNorDisagree',
      'responses.partlyDisagree',
      'responses.completelyDisagree',
      'summary.bestForQuestion',
      'summary.tiedForQuestion',
      'attribution.text',
      'nav.directory',
      'nav.compare',
      'nav.languageSwitcherAriaLabel',
      'locale.sv',
      'locale.en',
      'locale.ar',
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
    expect(getByPath(sv as JsonObject, 'directory.sort.ranking')).toBe(
      'Resultat',
    )
    expect(getByPath(sv as JsonObject, 'directory.sort.groupLabel')).toBe(
      'Sortering',
    )
    expect(getByPath(sv as JsonObject, 'directory.addedToCompare')).toBe(
      'Tillagd',
    )
    expect(getByPath(sv as JsonObject, 'responses.partlyDisagree')).toBe(
      'Instämmer delvis inte',
    )
  })

  it('should include required template placeholders in summary and tray keys', () => {
    // summary.bestForQuestion must contain {name}, {percent}, {question}
    // summary.tiedForQuestion must contain {names}, {question}
    const bestForQuestion = getByPath(
      sv as JsonObject,
      'summary.bestForQuestion',
    )
    expect(
      typeof bestForQuestion,
      'summary.bestForQuestion must be a string',
    ).toBe('string')
    if (typeof bestForQuestion === 'string') {
      expect(
        bestForQuestion,
        'summary.bestForQuestion missing {name}',
      ).toContain('{name}')
      expect(
        bestForQuestion,
        'summary.bestForQuestion missing {percent}',
      ).toContain('{percent}')
      expect(
        bestForQuestion,
        'summary.bestForQuestion missing {question}',
      ).toContain('{question}')
    }

    const tiedForQuestion = getByPath(
      sv as JsonObject,
      'summary.tiedForQuestion',
    )
    expect(
      typeof tiedForQuestion,
      'summary.tiedForQuestion must be a string',
    ).toBe('string')
    if (typeof tiedForQuestion === 'string') {
      expect(
        tiedForQuestion,
        'summary.tiedForQuestion missing {names}',
      ).toContain('{names}')
      expect(
        tiedForQuestion,
        'summary.tiedForQuestion missing {question}',
      ).toContain('{question}')
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
