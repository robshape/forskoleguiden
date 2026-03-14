import { describe, expect, it } from 'vitest'

import { getMalmoIndex } from './helpers/malmo-data'

describe('Malmö preschool index data', () => {
  it('should contain at least 5 preschools with valid IDs, names, addresses, and operator types', () => {
    const parsed = getMalmoIndex()

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
