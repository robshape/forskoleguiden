import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import type { PreschoolIndex } from '@/lib/types'

describe('Step 1.2 Malmö index seed data contract', () => {
  it('has preschools array, >=5 entries, required keys, and valid operator types', () => {
    const indexFilePath = resolve(process.cwd(), 'data/malmo/index.json')
    const raw = readFileSync(indexFilePath, 'utf-8')
    const parsed = JSON.parse(raw) as PreschoolIndex

    expect(parsed.city).toBe('Malmö')
    expect(parsed.year).toBe(2025)
    expect(Array.isArray(parsed.preschools)).toBe(true)
    expect(parsed.preschools.length).toBeGreaterThanOrEqual(5)

    const validOperatorTypes = new Set(['municipal', 'independent'])

    for (const [index, entry] of parsed.preschools.entries()) {
      const entryLabel = `entry ${index} (${entry.id || 'unknown-id'})`

      expect(typeof entry.id, `${entryLabel} missing id`).toBe('string')
      expect(entry.id.length, `${entryLabel} has empty id`).toBeGreaterThan(0)

      expect(typeof entry.name, `${entryLabel} missing name`).toBe('string')
      expect(entry.name.length, `${entryLabel} has empty name`).toBeGreaterThan(
        0,
      )

      expect(typeof entry.address, `${entryLabel} missing address`).toBe(
        'string',
      )
      expect(
        entry.address.length,
        `${entryLabel} has empty address`,
      ).toBeGreaterThan(0)
      expect(
        entry.address,
        `${entryLabel} should include street and city`,
      ).toMatch(/,\s*Malmö$/)

      expect(
        typeof entry.operatorType,
        `${entryLabel} missing operatorType`,
      ).toBe('string')
      expect(
        validOperatorTypes.has(entry.operatorType),
        `${entryLabel} has invalid operatorType`,
      ).toBe(true)
    }

    const uniqueAddressCount = new Set(
      parsed.preschools.map((entry) => entry.address),
    ).size
    expect(uniqueAddressCount).toBeGreaterThan(1)
  })
})
