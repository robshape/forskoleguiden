# Data Model: Share State Encoding

**Feature**: `005-share-state-encoding`
**Date**: 2026-03-24

## New Type: SharePayload

**File**: `src/lib/share.ts` (new file)

```typescript
export type SharePayload = {
  v: number // Schema version. Currently only version 1 is supported.
  city: string // City identifier. Matches PreschoolIndex.city (e.g. 'Malmö').
  year: number // Survey year. Matches PreschoolIndex.year (e.g. 2025).
  ids: string[] // Selected preschool IDs (slugs). Max length MAX_COMPARE at call time.
}
```

**Validation rules**:

- `v` MUST equal `1` for the decoder to return a non-null result in this version of the feature.
- `city` MUST be a non-empty string. The decoder validates `typeof city === 'string'`.
- `year` MUST be a number. The decoder validates `typeof year === 'number'`.
- `ids` MUST be an array. The decoder validates `Array.isArray(ids)`. Each element MUST be a string.
- The TypeScript type does not enforce `ids.length <= MAX_COMPARE` — callers are responsible.

**Version compatibility policy**:

- `v: 1` is the initial schema. All decoders in this feature support only `v: 1`.
- If `v` is any other value, `decodeShareState` returns `null` immediately (unsupported version).
- Future schema changes MUST increment `v`. Additive changes (new optional fields in `v: 2`) do not require migrating `v: 1` links — they simply return `null` in the old decoder.

---

## New Constant: SHARE_CITY

**File**: `src/lib/constants.ts` (updated)

```typescript
export const SHARE_CITY = 'Malmö'
```

Mirrors the `city` field in `data/malmo/index.json`. Used by `encodeShareState` to populate the payload without file I/O. If the project expands to a second city, the encoder API will need a `city` parameter — at that point `SHARE_CITY` is deprecated and removed.

---

## Function Signatures

**File**: `src/lib/share.ts` (new file)

### `encodeShareState`

```typescript
export const encodeShareState = (ids: string[]): string => { ... }
```

**Input**: An array of preschool ID strings. May be empty. Should not exceed `MAX_COMPARE` in normal use.

**Output**: A non-empty URL-safe string. Safe to embed as a query parameter value without additional percent-encoding (`?s=<output>`).

**Side effects**: None. Pure function.

**Behaviour**:

1. Build a `SharePayload`: `{ v: 1, city: SHARE_CITY, year: SURVEY_YEAR, ids }`.
2. `JSON.stringify` the payload.
3. `LZString.compressToEncodedURIComponent(json)` → returns the encoded string.
4. Return the encoded string. (lz-string's `compressToEncodedURIComponent` guarantees a non-empty result for any string input.)

---

### `decodeShareState`

```typescript
export const decodeShareState = (encoded: string): SharePayload | null => { ... }
```

**Input**: A string — potentially from an untrusted URL query parameter. May be empty, corrupted, or from a future schema version.

**Output**: A validated `SharePayload` object, or `null` if decoding fails for any reason.

**Side effects**: None. Pure function.

**Behaviour**:

1. Wrap all logic in a try-catch; on any exception, return `null`.
2. Call `LZString.decompressFromEncodedURIComponent(encoded)`. If the result is `null` or empty, return `null`.
3. `JSON.parse` the decompressed string. If it throws, return `null`.
4. Validate the parsed object:
   - `typeof parsed === 'object' && parsed !== null` — else `null`.
   - `typeof parsed.v === 'number' && parsed.v === 1` — else `null` (unsupported version).
   - `typeof parsed.city === 'string'` — else `null`.
   - `typeof parsed.year === 'number'` — else `null`.
   - `Array.isArray(parsed.ids) && parsed.ids.every(id => typeof id === 'string')` — else `null`.
5. Return the validated payload as `SharePayload`.

---

### `validateShareIds`

```typescript
export const validateShareIds = (
  payload: SharePayload,
  knownIds: readonly string[],
): { valid: string[]; invalid: string[] } => { ... }
```

**Input**:

- `payload` — a decoded `SharePayload` (not null; caller must have already decoded successfully).
- `knownIds` — the list of preschool IDs in the current index. Passed by the caller; not loaded internally.

**Output**: `{ valid: string[], invalid: string[] }` — each unique ID from `payload.ids` classified into exactly one of the two arrays.

**Side effects**: None. Pure function.

**Behaviour**:

1. Deduplicate `payload.ids` using a `Set<string>` to avoid repeated IDs appearing in either output array.
2. Build a `Set<string>` from `knownIds` for O(1) lookup.
3. For each unique ID, check if it is in the known-IDs set.
4. Return `{ valid: [...idsFoundInIndex], invalid: [...idsNotFoundInIndex] }`.

---

## Updated File: src/lib/constants.ts

**Change**: Add `SHARE_CITY` constant.

```typescript
// City identifier used in the share payload. Mirrors the city field in data/malmo/index.json.
export const SHARE_CITY = 'Malmö'
```

No other changes to `constants.ts`.

---

## New File: src/lib/share.ts

Full module structure (implementation detail for reference; exact code produced during implementation):

```typescript
import LZString from 'lz-string'

import { SHARE_CITY, SURVEY_YEAR } from '@/lib/constants'

export type SharePayload = {
  v: number
  city: string
  year: number
  ids: string[]
}

const SUPPORTED_VERSION = 1

export const encodeShareState = (ids: string[]): string => {
  const payload: SharePayload = {
    v: SUPPORTED_VERSION,
    city: SHARE_CITY,
    year: SURVEY_YEAR,
    ids,
  }
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload))
}

export const decodeShareState = (encoded: string): SharePayload | null => {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded)
    if (!decompressed) return null
    const parsed: unknown = JSON.parse(decompressed)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).v !== 'number' ||
      (parsed as Record<string, unknown>).v !== SUPPORTED_VERSION ||
      typeof (parsed as Record<string, unknown>).city !== 'string' ||
      typeof (parsed as Record<string, unknown>).year !== 'number' ||
      !Array.isArray((parsed as Record<string, unknown>).ids) ||
      !(parsed as { ids: unknown[] }).ids.every((id) => typeof id === 'string')
    ) {
      return null
    }
    return parsed as SharePayload
  } catch {
    return null
  }
}

export const validateShareIds = (
  payload: SharePayload,
  knownIds: readonly string[],
): { valid: string[]; invalid: string[] } => {
  const knownSet = new Set(knownIds)
  const uniqueIds = [...new Set(payload.ids)]
  const valid: string[] = []
  const invalid: string[] = []
  for (const id of uniqueIds) {
    if (knownSet.has(id)) {
      valid.push(id)
    } else {
      invalid.push(id)
    }
  }
  return { valid, invalid }
}
```

---

## New File: tests/unit/share-state-encoding.test.ts

**Purpose**: Unit tests for `src/lib/share.ts`. All tests are pure — no DOM, no file I/O beyond the existing `getMalmoIndex()` helper.

**Test structure overview**:

```typescript
import { describe, expect, it } from 'vitest'

import { MAX_COMPARE } from '@/lib/state'
import {
  decodeShareState,
  encodeShareState,
  validateShareIds,
} from '@/lib/share'
import { getPreschoolIndex } from '@/lib/data'
import { getBasePath } from '@/lib/base-path'

describe('encodeShareState', () => {
  it(
    'produces a non-empty URL-safe string for up to MAX_COMPARE real preschool IDs',
    it(
      'encoded string passes RFC 3986 identity check: encodeURIComponent(encoded) === encoded',
    ),
  )
  it('encoded URL stays under 2,000 characters with 5 real preschool IDs')
  it('does not throw for an empty ids array')
  it('encodes a single ID to a decodable payload')
  it('does not throw for an array longer than MAX_COMPARE')
})

describe('decodeShareState', () => {
  it('round-trips: decoded ids match encoded ids exactly')
  it('returns null for a corrupted string')
  it('returns null for an empty string')
  it('returns null for a future schema version')
  it('returns null for a string that decompresses to non-JSON')
  it('returns null for a payload missing required fields')
})

describe('validateShareIds', () => {
  it('classifies 2 valid and 1 invalid ID correctly')
  it('returns empty invalid array when all IDs are valid')
  it('returns empty valid array when all IDs are invalid')
  it('deduplicates repeated IDs in the payload')
  it('returns all invalid when knownIds is empty')
})
```

---

## Data Flow Diagram

```text
encodeShareState(ids)
       │
       │  { v:1, city: SHARE_CITY, year: SURVEY_YEAR, ids }
       │  JSON.stringify → LZString.compressToEncodedURIComponent
       ▼
  encoded string  ← URL query parameter  ?s=<encoded>
       │
       │  LZString.decompressFromEncodedURIComponent → JSON.parse → validate
       ▼
decodeShareState(encoded)
       │
       │  returns SharePayload | null
       ▼
validateShareIds(payload, allPreschoolIds)
       │
       │  knownIds Set lookup + deduplication
       ▼
  { valid: string[], invalid: string[] }
       │
       ▼
  ComparisonView.tsx (Step 6)
  → populate compareIds store with valid IDs
  → show warning if invalid.length > 0
```

---

## Touched Files Summary

| File                                      | Change                                                    |
| ----------------------------------------- | --------------------------------------------------------- |
| `src/lib/constants.ts`                    | Add `SHARE_CITY = 'Malmö'`                                |
| `src/lib/share.ts`                        | **New file** — `SharePayload` type + 3 exported functions |
| `tests/unit/share-state-encoding.test.ts` | **New file** — unit tests for all three functions         |
| `package.json`                            | Add `lz-string` (prod, exact version)                     |
| `package.json`                            | Add `@types/lz-string` (dev, exact version)               |
| `pnpm-lock.yaml`                          | Updated by pnpm automatically                             |
