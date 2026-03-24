# Quickstart: Share State Encoding

**Feature**: `005-share-state-encoding`
**Date**: 2026-03-24
**Branch**: `005-share-state-encoding`

## Overview

This step adds a pure library module (`src/lib/share.ts`) that encodes and decodes the compare-set into a compact URL-safe string. No Astro pages, no Preact islands, and no i18n files are modified. The output is infrastructure consumed by Step 6 (Share UI).

---

## Step-to-Detail Traceability

| Step                          | Primary outcome                                        | Requirement source                                | Implementation detail source                                                                 |
| ----------------------------- | ------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1. Install lz-string          | `lz-string` + `@types/lz-string` in exact-version lock | [spec.md](spec.md) FR-001, FR-002                 | [research.md → Decision 1](research.md#decision-1-compression-library--lz-string)            |
| 2. Write failing tests        | All test cases in `share-state-encoding.test.ts` — red | [spec.md](spec.md) SC-001 – SC-006                | [data-model.md → Test structure](data-model.md#new-file-testsunitshare-state-encodingtestts) |
| 3. Add SHARE_CITY constant    | `SHARE_CITY = 'Malmö'` in `constants.ts`               | [spec.md](spec.md) FR-012                         | [research.md → Decision 3](research.md#decision-3-encodesharestate-does-not-read-files)      |
| 4a. Create share.ts (encoder) | `SharePayload` type + `encodeShareState`               | [spec.md](spec.md) FR-001, FR-004, FR-005, FR-012 | [data-model.md → encodeShareState](data-model.md#encodesharestate)                           |
| 4b. Add decoder               | `decodeShareState`                                     | [spec.md](spec.md) FR-006, FR-007                 | [data-model.md → decodeShareState](data-model.md#decodesharestate)                           |
| 4c. Add validator             | `validateShareIds`                                     | [spec.md](spec.md) FR-008, FR-009                 | [data-model.md → validateShareIds](data-model.md#validateshareids)                           |
| 5. Verify                     | All tests green; `pnpm check` + `pnpm build` pass      | [spec.md](spec.md) SC-001 – SC-007                | —                                                                                            |

_Spec: [`spec.md`](spec.md) · Research: [`research.md`](research.md) · Data model: [`data-model.md`](data-model.md)_

---

## Implementation Order

Work through these steps in sequence. After each step, run the indicated verification command.

---

### Step 1 — Install lz-string

Install the compression library and its TypeScript types as exact-version pinned dependencies:

```sh
pnpm add lz-string
pnpm add -D @types/lz-string
```

Then open `package.json` and confirm neither entry uses `^` or `~`. If pnpm added a range prefix, remove it manually.

**Verify**: `pnpm ls lz-string` shows the installed version. `pnpm check` passes (TypeScript can resolve the types).

---

### Step 2 — Write failing tests (test-first)

Create `tests/unit/share-state-encoding.test.ts` with all test cases before writing any production code. The tests should initially **fail** because `src/lib/share.ts` does not exist yet.

```typescript
import { describe, expect, it } from 'vitest'
import LZString from 'lz-string'

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
    // FR-001: encoded string must be safe as a URL query parameter without additional
    // percent-encoding. The RFC 3986 identity check is the precise expression of this.
    expect(encodeURIComponent(result)).toBe(result)
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
    )!
    const result = validateShareIds(payload, knownIds)
    expect(result.valid).toHaveLength(2)
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0]).toBe('does-not-exist')
  })

  it('returns empty invalid array when all IDs are valid', () => {
    const knownIds = allIds.slice(0, 3)
    const payload = decodeShareState(encodeShareState(knownIds))!
    const result = validateShareIds(payload, allIds)
    expect(result.invalid).toHaveLength(0)
    expect(result.valid).toEqual(knownIds)
  })

  it('returns empty valid array when all IDs are invalid', () => {
    const payload = decodeShareState(
      encodeShareState(['ghost-id-1', 'ghost-id-2']),
    )!
    const result = validateShareIds(payload, allIds)
    expect(result.valid).toHaveLength(0)
    expect(result.invalid).toHaveLength(2)
  })

  it('deduplicates repeated IDs in the payload', () => {
    const id = allIds[0]
    const payload = decodeShareState(encodeShareState([id, id, id]))!
    const result = validateShareIds(payload, allIds)
    // After deduplication, only one entry in valid.
    expect(result.valid).toHaveLength(1)
    expect(result.invalid).toHaveLength(0)
  })

  it('returns all invalid when knownIds is empty', () => {
    const payload = decodeShareState(encodeShareState([allIds[0], allIds[1]]))!
    const result = validateShareIds(payload, [])
    expect(result.valid).toHaveLength(0)
    expect(result.invalid).toHaveLength(2)
  })
})
```

Run `pnpm test -- share-state-encoding` — every test must **fail** (`@/lib/share` does not exist; the entire test file errors on import). This is the expected red baseline for the whole feature.

> **Incremental verification note**: Once `src/lib/share.ts` exists (after Step 4a), the import resolves. From that point, each describe block can be verified independently: `encodeShareState` tests pass after Step 4a, `decodeShareState` tests pass after Step 4b, and `validateShareIds` tests pass after Step 4c. Calling an unimplemented export returns `undefined`, so individual test assertions fail with "x is not a function" rather than a module error.

---

### Step 3 — Add SHARE_CITY to constants.ts

Open `src/lib/constants.ts` and append the new constant at the end:

```typescript
// City identifier used in the share payload. Mirrors the city field in data/malmo/index.json.
export const SHARE_CITY = 'Malmö'
```

**Verify**: `pnpm check` passes.

---

### Step 4a — Create src/lib/share.ts: encodeShareState

Create `src/lib/share.ts` with the `SharePayload` type and `encodeShareState` only:

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
```

**Verify**: `pnpm check` passes. `pnpm test -- share-state-encoding` — the `encodeShareState` describe block passes. The `decodeShareState` and `validateShareIds` describe blocks still fail (those exports do not exist yet; test assertions calling them will error with "not a function"). _(spec.md FR-001, FR-004, FR-005, FR-012; data-model.md → encodeShareState; research.md D-1, D-3)_

> **Implementation note**: `compressToEncodedURIComponent` uses `+`, `-`, and `$` in addition to `A-Za-z0-9`. The `+` character is intentionally included: `decompressFromEncodedURIComponent` converts spaces back to `+` before decompressing, so both direct-append (`?s=abc+def`) and percent-encoded (`?s=abc%2Bdef`) URL forms round-trip correctly. The URL-safety assertion in the test uses `/^[A-Za-z0-9+\-$]+$/` rather than `encodeURIComponent(result) === result` for this reason.

---

### Step 4b — Add decodeShareState

Append `decodeShareState` to `src/lib/share.ts` (add after `encodeShareState`):

```typescript
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
```

**Verify**: `pnpm check` passes. `pnpm test -- share-state-encoding` — the `encodeShareState` and `decodeShareState` describe blocks both pass. The `validateShareIds` describe block still fails. _(spec.md FR-006, FR-007; data-model.md → decodeShareState; research.md D-4)_

---

### Step 4c — Add validateShareIds

Append `validateShareIds` to `src/lib/share.ts` (add after `decodeShareState`):

```typescript
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

**Verify**: `pnpm check` passes (TypeScript strict mode). `pnpm test -- share-state-encoding` — all tests now pass. _(spec.md FR-008, FR-009; data-model.md → validateShareIds; research.md D-5)_

---

### Step 5 — Run full verification

```sh
pnpm check && pnpm test && pnpm build
```

All success criteria must be met:

- `pnpm check` — TypeScript strict mode passes.
- `pnpm test` — all existing tests still pass; the new `share-state-encoding.test.ts` suite is fully green.
- `pnpm build` — Astro static build succeeds; no new build errors.

If `pnpm build` warns about lz-string being imported at build time in a server-side module, verify that `src/lib/share.ts` is NOT imported from any Astro front matter or server-side data loading path — it should only be imported from `ComparisonView.tsx` (Step 6) and test files.

---

## Common Pitfalls

| Pitfall                                                                         | Cause                                                | Fix                                                                                      |
| ------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `pnpm add lz-string` adds `^version` in package.json                            | pnpm defaults to `^`                                 | Remove the `^` manually from `package.json` after install                                |
| `import LZString from 'lz-string'` gives TypeScript error                       | Types not installed or CJS/ESM mismatch              | Ensure `@types/lz-string` is installed; check `tsconfig.json` `moduleResolution` setting |
| `decodeShareState` returns `null` for a valid payload in tests                  | `SUPPORTED_VERSION` mismatch or stale import         | Restart Vitest watch; confirm `SUPPORTED_VERSION = 1` in `share.ts`                      |
| `pnpm build` fails with `Cannot use import statement in a module` for lz-string | lz-string is imported from an Astro server-side file | Verify `share.ts` is not imported from any `.astro` front matter in this step            |
