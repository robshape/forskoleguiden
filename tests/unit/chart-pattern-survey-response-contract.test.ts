import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { RESPONSE_SERIES } from '@/lib/chart-patterns'
import { RESPONSE_ROWS } from '@/lib/survey-responses'
import type { SurveyResponse } from '@/lib/types'
import { collectKeyPaths } from './helpers/i18n'

// All five canonical SurveyResponse percentage fields.
const EXPECTED_FIELDS: (keyof SurveyResponse)[] = [
  'completelyAgreePercent',
  'partlyAgreePercent',
  'neitherAgreeNorDisagreePercent',
  'partlyDisagreePercent',
  'completelyDisagreePercent',
]

describe('survey response row and chart pattern contracts', () => {
  it('RESPONSE_ROWS has exactly 5 entries matching the SurveyResponse fields in canonical order', () => {
    expect(RESPONSE_ROWS).toHaveLength(5)
    const fields = RESPONSE_ROWS.map((r) => r.field)
    expect(fields).toEqual(EXPECTED_FIELDS)
  })

  it('RESPONSE_ROWS fields are unique', () => {
    const fields = RESPONSE_ROWS.map((r) => r.field)
    expect(new Set(fields).size).toBe(fields.length)
  })

  it('RESPONSE_ROWS i18n keys are unique and non-empty', () => {
    const keys = RESPONSE_ROWS.map((r) => r.i18nKey)
    expect(keys.every((k) => k.length > 0)).toBe(true)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('RESPONSE_ROWS i18n keys resolve in all three locales', () => {
    const localeFiles = ['sv', 'en', 'ar'] as const
    for (const locale of localeFiles) {
      const json = JSON.parse(
        readFileSync(
          resolve(process.cwd(), `src/i18n/${locale}.json`),
          'utf-8',
        ),
      )
      const allKeys = collectKeyPaths(json)
      for (const row of RESPONSE_ROWS) {
        expect(allKeys, `${row.i18nKey} missing in ${locale}.json`).toContain(
          row.i18nKey,
        )
      }
    }
  })

  it('RESPONSE_SERIES has the same length as RESPONSE_ROWS', () => {
    expect(RESPONSE_SERIES).toHaveLength(RESPONSE_ROWS.length)
  })

  it('RESPONSE_SERIES fields match RESPONSE_ROWS fields in the same order', () => {
    const seriesFields = RESPONSE_SERIES.map((s) => s.field)
    const rowFields = RESPONSE_ROWS.map((r) => r.field)
    expect(seriesFields).toEqual(rowFields)
  })

  it('RESPONSE_SERIES pattern types are all unique', () => {
    const types = RESPONSE_SERIES.map((s) => s.pattern.type)
    expect(new Set(types).size).toBe(types.length)
  })

  it('every RESPONSE_SERIES entry has a pattern with a non-empty bg color', () => {
    for (const series of RESPONSE_SERIES) {
      expect(series.pattern.bg.length).toBeGreaterThan(0)
    }
  })
})
