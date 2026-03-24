# Research: Share State Encoding

**Feature**: `005-share-state-encoding`
**Date**: 2026-03-24

## Decision Log

### Decision 1: Compression library — lz-string

**Decision**: Use `lz-string` with the `compressToEncodedURIComponent` / `decompressFromEncodedURIComponent` pair.

**Rationale**: lz-string was identified in the Phase 1 implementation plan and re-confirmed in Phase 2. It is purpose-built for this use case: compressing short text strings into URL-safe encodings that survive copy-paste in messaging apps and email clients. The library has no runtime dependencies, works identically in Node.js and browser environments, and has been stable for years. The `EncodedURIComponent` variant specifically avoids characters that require percent-encoding in URLs (`+`, `/`, `=`), keeping the output compact and safely embeddable as a raw query parameter value.

**Alternative considered: Base64 + JSON without compression** — Rejected. A raw Base64-encoded JSON payload for 5 typical Malmö preschool IDs (average slug length ~25 chars) would be roughly 200–250 characters before the base URL. This is fine in isolation but offers no headroom if IDs become longer or the payload gains optional fields in future schema versions. Compression costs negligible bundle size (lz-string is ~2 KB minified) and ensures the 2,000-character budget holds comfortably even as the dataset evolves.

**Alternative considered: native `CompressionStream` API** — Rejected. `CompressionStream` is async (Promise-based) and is not available in Node.js 18 test environments reliably. Making `encodeShareState` async would propagate `async` through the entire call chain in the Preact island, adding unnecessary complexity for what is effectively a small string operation.

---

### Decision 2: Payload schema — versioned flat object

**Decision**: The `SharePayload` type is `{ v: number; city: string; year: number; ids: string[] }`. Version 1 is the initial schema.

**Rationale**: Including a version field from the start costs only a few bytes in the compressed payload and prevents a migration nightmare if the schema needs to change (e.g., adding a `preschoolType` discriminator or switching city). The `city` and `year` fields are metadata that make the payload self-describing — a link shared today can still be decoded in 2027 even if the active survey year has advanced, because the payload carries its own context. The `ids` field is the core data: the selected preschool slugs.

**Locale deliberately omitted**: Locale is encoded in the URL path (`/sv/jamfor/?s=`, `/en/jamfor/?s=`). Including locale in the payload would couple the UI language preference to the shareable data, which is incorrect — a Swedish parent might send a link to an Arabic-speaking parent who uses the Arabic route. Each locale path decodes the same payload independently.

**Alternative considered: including preschool names in the payload** — Rejected. Names are redundant — the comparison page already maps IDs to full survey data. Including names would inflate the payload by ~500 characters for 5 preschools, potentially approaching the URL length budget. IDs are the canonical key; names are display data.

---

### Decision 3: `encodeShareState` does not read files

**Decision**: `encodeShareState(ids: string[]): string` uses `SURVEY_YEAR` and `SHARE_CITY` constants from `src/lib/constants.ts` to populate `year` and `city` fields. It does NOT call `getPreschoolIndex()` or any file-reading utility.

**Rationale**: The encoder is called from `ComparisonView.tsx`, a Preact island that runs in the browser. Browser environments cannot access the Node.js `fs` module or `readFileSync`. Keeping the encoder free of Node.js I/O makes it safely importable in any execution context (Node.js tests, browser island, Astro SSR build) without environment guards. The constants are build-time values that are identical to the values in `data/malmo/index.json` by definition — no runtime cross-check is needed.

**`SHARE_CITY` constant**: A new constant `SHARE_CITY = 'Malmö'` is added to `src/lib/constants.ts`. This mirrors the `city` field in `data/malmo/index.json` without requiring a file read. If a second city is added in the future, the encoder API will need to change anyway (it would need a `city` parameter), so hard-coding the single current city as a constant is appropriate for this scope.

---

### Decision 4: `decodeShareState` returns `null` on any failure

**Decision**: `decodeShareState(encoded: string): SharePayload | null` wraps the entire decode/decompress/parse/validate pipeline in a try-catch and returns `null` on any failure. It MUST NOT throw.

**Rationale**: The decoder is called in `ComparisonView.tsx` from a URL query parameter — external, untrusted input. Any entry point accepting untrusted data must be hardened against all malformed inputs. A thrown exception from inside a Preact island would crash the island and show a blank comparison page with no fallback UI. Returning `null` gives the caller a clear, typed signal to handle gracefully (show an error state, re-direct to the directory, etc.). This is consistent with the "defensive coding at system boundaries" principle from the project constitution.

**Version validation**: If `payload.v !== 1` (the only current supported version), return `null`. This prevents future clients accidentally processing schema-v2 payloads as schema-v1, which could silently misread fields.

**Payload structure validation**: After JSON.parse, check: `typeof payload === 'object'`, `typeof payload.v === 'number'`, `typeof payload.city === 'string'`, `typeof payload.year === 'number'`, `Array.isArray(payload.ids)`, and all elements of `ids` are strings. If any check fails, return `null`. This ensures the returned `SharePayload` always satisfies the TypeScript type contract at runtime.

---

### Decision 5: `validateShareIds` accepts `knownIds` as a parameter

**Decision**: `validateShareIds(payload: SharePayload, knownIds: readonly string[]): { valid: string[], invalid: string[] }` does NOT load the preschool index internally.

**Rationale**: The function is called from `ComparisonView.tsx` (browser) in Step 6. Internal loading would require `readFileSync` (Node.js only), making the function incompatible with the browser environment. The Astro comparison page, which renders `ComparisonView`, already loads the preschool index at build time. Step 6 will pass `allPreschoolIds` (derived from `getPreschoolIndex().preschools.map(p => p.id)`) as a prop to `ComparisonView`. This is the cleanest data flow: the page-level Astro component is responsible for data loading; the Preact island receives what it needs as props.

For unit tests, the test helper `getMalmoIndex()` provides the real index, and the test can call `getPreschoolIndex().preschools.map(p => p.id)` directly.

**Deduplication**: `validateShareIds` uses a `Set<string>` for `knownIds` lookup and deduplicates `payload.ids` before classification. This prevents a payload with repeated IDs from inflating either output array.

---

### Decision 6: Test file — new dedicated file

**Decision**: Tests go in a new file `tests/unit/share-state-encoding.test.ts`.

**Rationale**: `src/lib/share.ts` is a new self-contained module with its own domain (URL-state serialization). Placing its tests in a new file scoped to the behaviour of that module is cleaner than appending to a loosely related existing test file. The test file name follows the project convention: behavior-and-domain-descriptive.

**Test subjects**: Tests use real Malmö preschool IDs loaded via `getMalmoIndex()` from `tests/unit/helpers/malmo-data.ts` for the URL-length and round-trip fidelity tests. This ensures the character budget assertion is grounded in the actual dataset. Synthetic IDs are used only for targeted failure-mode tests (corrupted string, missing ID validation) where the specific ID value doesn't matter.

---

### Decision 7: `encodeShareState` does not clip to `MAX_COMPARE`

**Decision**: The encoder accepts any `string[]` and encodes it as-is. It does not enforce that `ids.length <= MAX_COMPARE`.

**Rationale**: The compare store (`src/lib/state.ts`) already enforces `MAX_COMPARE` — a caller who has more than 5 IDs has bypassed the store, which is a bug in the caller. Having the encoder silently clip would mask that bug. The function is low-level and should do exactly one thing: encode what it receives. If the caller is incorrect, the comparison page downstream will show more than 5 preschools (which the UI can handle), making the bug visible and debuggable.

---

## No Blockers

All clarifications from the specification are resolved. No external APIs, no service dependencies, no architectural unknowns. Implementation requires:

1. Running `pnpm add lz-string` + `pnpm add -D @types/lz-string`
2. Adding `SHARE_CITY` to `src/lib/constants.ts`
3. Creating `src/lib/share.ts` (~60 lines of pure functions)
4. Writing unit tests in `tests/unit/share-state-encoding.test.ts`

No Astro pages, Preact islands, or i18n files are touched in this step.
