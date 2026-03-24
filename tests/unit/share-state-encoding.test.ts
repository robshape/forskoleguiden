import LZString from 'lz-string'
import { describe, expect, it } from 'vitest'

import { getBasePath } from '@/lib/base-path'
import { getPreschoolIndex } from '@/lib/data'
import {
  decodeShareState,
  encodeShareState,
  validateShareIds,
} from '@/lib/share'
import { MAX_COMPARE } from '@/lib/state'

// Load real preschool IDs once for the entire test suite.
const allIds = getPreschoolIndex().preschools.map((p) => p.id)
const fiveIds = allIds.slice(0, MAX_COMPARE)

describe('encodeShareState', () => {
  it('produces a non-empty URL-safe string for up to MAX_COMPARE real preschool IDs', () => {
    const result = encodeShareState(fiveIds)
    expect(result.length).toBeGreaterThan(0)
    // FR-001: encoded string must be safe as a URL query parameter.
    // lz-string's compressToEncodedURIComponent uses A-Za-z0-9, +, -, and $ as its
    // alphabet. The + character is safe: decompressFromEncodedURIComponent converts
    // spaces back to + before decompressing, so both direct-append (?s=abc+def) and
    // percent-encoded (?s=abc%2Bdef) URL forms round-trip correctly.
    expect(result).toMatch(/^[A-Za-z0-9+\-$]+$/)
  })

  it('encoded URL stays under 2,000 characters with 5 real preschool IDs', () => {
    const encoded = encodeShareState(fiveIds)
    const base = getBasePath()
    const fullUrl = `https://example.com${base}/sv/jamfor/?s=${encoded}`
    expect(fullUrl.length).toBeLessThan(2000)
  })

  it('does not throw for an empty ids array', () => {
    expect(() => encodeShareState([])).not.toThrow()
    expect(encodeShareState([])).toBeTruthy()
  })

  it('does not throw for an array longer than MAX_COMPARE', () => {
    const manyIds = allIds.slice(0, MAX_COMPARE + 2)
    expect(() => encodeShareState(manyIds)).not.toThrow()
    expect(encodeShareState(manyIds)).toBeTruthy()
  })
})

describe('decodeShareState', () => {
  it('round-trips: decoded ids match encoded ids exactly', () => {
    const original = fiveIds
    const encoded = encodeShareState(original)
    const decoded = decodeShareState(encoded)
    expect(decoded).not.toBeNull()
    expect(decoded!.ids).toEqual(original)
  })

  it('returns null for a corrupted string', () => {
    expect(decodeShareState('not-valid-lzstring-garbage!!!')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(decodeShareState('')).toBeNull()
  })

  it('returns null for a future schema version', () => {
    const futurePayload = JSON.stringify({
      v: 99,
      city: 'Malmö',
      year: 2025,
      ids: ['a'],
    })
    const futureEncoded = LZString.compressToEncodedURIComponent(futurePayload)
    expect(decodeShareState(futureEncoded)).toBeNull()
  })

  it('returns null for a string that decompresses to non-JSON text', () => {
    const nonJsonEncoded = LZString.compressToEncodedURIComponent(
      'this is not json { ]',
    )
    expect(decodeShareState(nonJsonEncoded)).toBeNull()
  })

  it('returns null for a payload missing required fields', () => {
    const incomplete = LZString.compressToEncodedURIComponent(
      JSON.stringify({ v: 1, city: 'Malmö' }), // missing year and ids
    )
    expect(decodeShareState(incomplete)).toBeNull()
  })
})

describe('validateShareIds', () => {
  it('classifies 2 valid and 1 invalid ID correctly', () => {
    const knownIds = allIds.slice(0, 5)
    const payload = decodeShareState(
      encodeShareState([knownIds[0], knownIds[1], 'does-not-exist']),
    )
    expect(payload).not.toBeNull()
    const result = validateShareIds(payload!, knownIds)
    expect(result.valid).toHaveLength(2)
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0]).toBe('does-not-exist')
  })

  it('returns empty invalid array when all IDs are valid', () => {
    const knownIds = allIds.slice(0, 3)
    const payload = decodeShareState(encodeShareState(knownIds))
    expect(payload).not.toBeNull()
    const result = validateShareIds(payload!, allIds)
    expect(result.invalid).toHaveLength(0)
    expect(result.valid).toEqual(knownIds)
  })

  it('returns empty valid array when all IDs are invalid', () => {
    const payload = decodeShareState(
      encodeShareState(['ghost-id-1', 'ghost-id-2']),
    )
    expect(payload).not.toBeNull()
    const result = validateShareIds(payload!, allIds)
    expect(result.valid).toHaveLength(0)
    expect(result.invalid).toHaveLength(2)
  })

  it('deduplicates repeated IDs in the payload', () => {
    const id = allIds[0]
    const payload = decodeShareState(encodeShareState([id, id, id]))
    expect(payload).not.toBeNull()
    const result = validateShareIds(payload!, allIds)
    // After deduplication, only one entry in valid.
    expect(result.valid).toHaveLength(1)
    expect(result.invalid).toHaveLength(0)
  })

  it('returns all invalid when knownIds is empty', () => {
    const payload = decodeShareState(encodeShareState([allIds[0], allIds[1]]))
    expect(payload).not.toBeNull()
    const result = validateShareIds(payload!, [])
    expect(result.valid).toHaveLength(0)
    expect(result.invalid).toHaveLength(2)
  })
})
