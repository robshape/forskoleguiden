# Feature Specification: Share State Encoding

**Feature Branch**: `005-share-state-encoding`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Step 5 (5.1 to 5.5) from Phase 2: create the library infrastructure for encoding the compare set into a URL-safe, versioned, compressed string and decoding it back — enabling shareable comparison links. No UI in this step; Step 6 adds the UI."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Parent Generates a Shareable Link (Priority: P1)

A parent has selected up to five preschools for comparison. They want to copy a link to share with their partner or save for later. The link must encode their full selection, survive copy-paste, and stay short enough to be shared in a message or email without truncation. The parent cannot be expected to manually manage or decode the link — the encoding must be transparent and automatic.

**Why this priority**: This is the foundational library primitive that all sharing behaviour in Step 6 depends on. Without a correct, compact encoder, the share feature cannot ship. A broken or oversized payload makes the entire sharing flow unusable.

**Independent Test**: Can be tested entirely in unit tests by calling `encodeShareState()` with known IDs and asserting the result is a non-empty URL-safe string under the character budget. No browser or built site is needed.

**Acceptance Scenarios**:

1. **Given** a parent has selected 5 preschools, **When** `encodeShareState()` is called with those 5 IDs, **Then** it returns a non-empty string containing only URL-safe characters.
2. **Given** the encoded string is appended as `?s=<encoded>` to the comparison page URL, **When** the total URL is measured, **Then** it does not exceed 2,000 characters.
3. **Given** a parent has selected 0 preschools (empty list), **When** `encodeShareState()` is called, **Then** it returns a valid encoded string without throwing an error.
4. **Given** a parent has selected 1 preschool, **When** `encodeShareState()` is called, **Then** the result encodes a payload with `ids` containing exactly that 1 preschool ID.

---

### User Story 2 — Partner Opens a Shared Link and Sees the Same Selection (Priority: P1)

A partner receives a shared link. When they open it, the system decodes the URL parameter and faithfully restores the full list of selected preschool IDs. If the link has been corrupted in transit (truncated in a messaging app, modified by a URL shortener, or hand-edited), the system returns a safe null value rather than crashing, so the UI can show a helpful error state.

**Why this priority**: Decoding is the reciprocal of encoding and equally essential. A link that cannot be decoded reliably destroys the value of the sharing feature entirely. The graceful null-return for invalid inputs prevents unhandled exceptions from surfacing to parents.

**Independent Test**: Can be tested entirely in unit tests by calling `encodeShareState()` then `decodeShareState()` and asserting the round-trip output matches the input; and by calling `decodeShareState()` with corrupted strings and asserting `null` is returned.

**Acceptance Scenarios**:

1. **Given** a valid encoded string produced by `encodeShareState()`, **When** `decodeShareState()` is called, **Then** it returns a `SharePayload` whose `ids` match the original IDs exactly (round-trip fidelity).
2. **Given** a corrupted or truncated string, **When** `decodeShareState()` is called, **Then** it returns `null` without throwing.
3. **Given** an empty string, **When** `decodeShareState()` is called, **Then** it returns `null` without throwing.
4. **Given** an encoded payload with an unrecognised version number (e.g., `v: 99`), **When** `decodeShareState()` is called, **Then** it returns `null` (unknown schema version; graceful degradation).
5. **Given** a string that decompresses successfully but is not valid JSON, **When** `decodeShareState()` is called, **Then** it returns `null`.
6. **Given** a string that decompresses and parses as JSON but the payload structure is missing required fields, **When** `decodeShareState()` is called, **Then** it returns `null`.

---

### User Story 3 — System Identifies Stale IDs in an Old Shared Link (Priority: P2)

A parent opens an old shared link from several months ago. One of the five preschools in the link has been removed from the index (renamed or decommissioned). The system cleanly separates valid IDs (found in the current preschool index) from stale IDs (no longer present), so the UI in Step 6 can inform the parent which preschools could not be restored without discarding the entire selection.

**Why this priority**: This is a quality-of-experience safeguard rather than a core requirement. The sharing feature functions correctly even if validation is skipped (Step 6 can show only the valid preschools without explaining the gap). However, explicit validation makes the UI's error messages possible and prevents silent data loss.

**Independent Test**: Can be tested entirely in unit tests by calling `validateShareIds()` with a payload containing a mix of known-good and known-bad IDs and asserting the `valid` and `invalid` arrays contain the expected entries.

**Acceptance Scenarios**:

1. **Given** a payload with 3 IDs where 2 exist in the index and 1 does not, **When** `validateShareIds()` is called, **Then** `valid` contains 2 entries and `invalid` contains 1 entry.
2. **Given** a payload where all IDs exist in the index, **When** `validateShareIds()` is called, **Then** `invalid` is empty.
3. **Given** a payload where no IDs exist in the index, **When** `validateShareIds()` is called, **Then** `valid` is empty.
4. **Given** a payload with duplicate IDs, **When** `validateShareIds()` is called, **Then** each ID is reported in `valid` or `invalid` only once (deduplication).

---

### Edge Cases

- Encoding or decoding `ids` arrays longer than `MAX_COMPARE` (5) must not crash; `encodeShareState` clips or the caller is responsible — the function must handle any array length without throwing.
- `decodeShareState` must not throw under any input, including `undefined`-like values if the parameter is inadvertently passed as an empty or whitespace-only string.
- `validateShareIds` receives a `knownIds` list that may itself be empty (e.g., if the index hasn't loaded). In that case, all decoded IDs are considered invalid.
- lz-string's `decompressFromEncodedURIComponent` can return `null` when passed a string it cannot decompress; the decoder must handle `null` returns from the library without propagating them.
- The encoder uses the build-time `SURVEY_YEAR` constant and a `SHARE_CITY` constant rather than reading from a file. This keeps the encoder usable in browser (Preact island) contexts where `readFileSync` is unavailable.
- A `SharePayload` with `ids: []` (empty array) is structurally valid. Decoding it must succeed and return a payload; the UI decides whether an empty selection is meaningful.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `encodeShareState(ids: string[]): string` MUST accept an array of preschool ID strings and return a non-empty string that is safe to use as a URL query parameter value without additional percent-encoding.
- **FR-002**: The encoded output produced by `encodeShareState` MUST be decodable by `decodeShareState` to recover the original `ids` array exactly (round-trip fidelity).
- **FR-003**: The full comparison page URL including `?s=<encoded>` MUST stay under 2,000 characters for a payload containing up to `MAX_COMPARE` (5) preschool IDs from the Malmö 2025 dataset.
- **FR-004**: `encodeShareState` MUST NOT throw for any input array, including an empty array or an array exceeding `MAX_COMPARE`.
- **FR-005**: The payload schema MUST include a version field (`v: number`) starting at version `1`. Future schema versions MUST increment this field.
- **FR-006**: `decodeShareState(encoded: string): SharePayload | null` MUST return `null` — and MUST NOT throw — for any input that fails to decode, decompress, parse as valid JSON, or validate against the expected schema structure.
- **FR-007**: `decodeShareState` MUST return `null` for any payload whose `v` field is not a currently supported version number (currently only `1`).
- **FR-008**: `validateShareIds(payload: SharePayload, knownIds: readonly string[]): { valid: string[], invalid: string[] }` MUST classify each ID in `payload.ids` as either `valid` (present in `knownIds`) or `invalid` (absent), with no ID appearing in both arrays. Elements in each output array MUST preserve the relative insertion order from `payload.ids` (after deduplication).
- **FR-009**: `validateShareIds` MUST deduplicate IDs in `payload.ids` — each unique ID appears at most once in either the `valid` or `invalid` output array.
- **FR-010**: All three functions (`encodeShareState`, `decodeShareState`, `validateShareIds`) MUST be exported from `src/lib/share.ts` and MUST be usable in both Node.js test environments (Vitest) and browser environments (Preact island context) without runtime errors.
- **FR-011**: The `SharePayload` type MUST be exported from `src/lib/share.ts` and MUST be consumable by TypeScript in strict mode without type errors.
- **FR-012**: The encoder MUST use the `SURVEY_YEAR` constant from `src/lib/constants.ts` and a new `SHARE_CITY` constant (also in `src/lib/constants.ts`) to populate the `year` and `city` fields of the payload — it MUST NOT call `getPreschoolIndex()` or read files.

### Key Entities

- **SharePayload**: A versioned, typed data object (`v`, `city`, `year`, `ids`) serialised to JSON and compressed into a URL-safe string by lz-string.
- **Encoded share string**: The URL-safe output of `compressToEncodedURIComponent` applied to the serialised `SharePayload`. Carried as the `?s=` query parameter in the shareable link.
- **Valid ID**: A preschool ID present in `knownIds` at the time `validateShareIds` is called.
- **Invalid/stale ID**: A preschool ID present in `payload.ids` but absent from `knownIds` — typically a preschool that was removed or renamed after the link was created.
- **SHARE_CITY**: A new constant (`'Malmö'`) exported from `src/lib/constants.ts` that the encoder uses for the `city` field of the payload.

## Clarifications

### Session 2026-03-24

- Q: Should `validateShareIds` load the preschool index internally or accept `knownIds` as a parameter? → A: Accept `knownIds: readonly string[]` as a parameter. The function is called from `ComparisonView.tsx` (browser) in Step 6; internal file loading would require `readFileSync` (Node.js only) and break browser compatibility. The caller provides the ID list.
- Q: Should `encodeShareState` clip `ids` to `MAX_COMPARE` automatically? → A: No — the function encodes what it receives. The caller (the compare store) already enforces `MAX_COMPARE`. Adding a second enforcement point would obscure bugs in the caller rather than surfacing them.
- Q: Is locale included in the share payload? → A: No. Locale is part of the URL path (`/sv/jamfor/`, `/en/jamfor/`). Omitting it from the payload keeps it smaller and avoids encoding UI preferences into shared data.
- Q: How should the failure-mode tests access LZString to construct malformed encoded payloads? → A: Static top-level import — `import LZString from 'lz-string'` at the top of the test file alongside the share functions. No dynamic `await import()` or async `it` callbacks needed.
- Q: What ordering should valid and invalid arrays in `validateShareIds` follow? → A: Insertion order preserved — each unique ID appears in the relative order it was encountered in `payload.ids` after deduplication. Produced naturally by iterating `new Set(payload.ids)`.
- Q: Which assertion method best verifies FR-001 (encoded string is URL-query-parameter safe)? → A: **Corrected during implementation (2026-03-24)**: The original answer specified `expect(encodeURIComponent(encoded)).toBe(encoded)` (RFC 3986 identity check), but `compressToEncodedURIComponent` uses `+`, `-`, and `$` in its output alphabet. `encodeURIComponent` encodes `+` as `%2B`, causing the RFC 3986 check to fail. The correct assertion is `expect(result).toMatch(/^[A-Za-z0-9+\-$]+$/)`. The `+` character is safe: `decompressFromEncodedURIComponent` internally converts spaces back to `+` before decompressing, so both direct-append (`?s=abc+def`) and percent-encoded (`?s=abc%2Bdef`) URL forms round-trip correctly.
- Q: Where should the `SHARE_CITY = 'Malmö'` constant live? → A: Shared constant in `src/lib/constants.ts` (current spec). Consistent with the `SURVEY_YEAR` pattern; available to future consumers like `email.ts` in Step 7 without requiring a cross-import from `share.ts`.

## Assumptions

- lz-string's `compressToEncodedURIComponent` / `decompressFromEncodedURIComponent` functions produce and consume strings safe for use as URL query parameter values without additional encoding.
- Real Malmö 2025 preschool IDs are short slug strings (e.g., `almgardens-forskola`, `al-salamah-sprakforskola`). Up to 5 such IDs in a JSON payload will compress to well under the 2,000-character URL budget.
- Version `1` is the only supported schema version in this feature. Older or newer versions are not forward-compatible at this stage.
- The `SURVEY_YEAR` constant in `src/lib/constants.ts` matches the year in `data/malmo/index.json`. No runtime cross-check is needed.
- `src/lib/share.ts` is a pure library module with no side effects on import; it does not read files, access the DOM, or modify global state.
- Unit tests for this feature use real preschool IDs sourced from `data/malmo/index.json` via the existing `getMalmoIndex()` test helper to ensure realistic payload sizes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: `encodeShareState` called with 5 real Malmö preschool IDs produces a string matching `/^[A-Za-z0-9+\-$]+$/` (lz-string's URI-safe alphabet — `+` is handled by `decompressFromEncodedURIComponent` via space↔+ conversion); appending `${basePath}/sv/jamfor/?s=` yields a URL under 2,000 characters.
- **SC-002**: `decodeShareState(encodeShareState(ids))` returns a `SharePayload` whose `ids` field is deeply equal to the original `ids` array for any valid input — round-trip fidelity confirmed by unit test.
- **SC-003**: `decodeShareState` returns `null` for a corrupted string, an empty string, a future version number, and a syntactically invalid JSON payload — all four cases verified by unit test.
- **SC-004**: `validateShareIds` with 3 IDs (2 valid, 1 invalid) returns `{ valid: [<2 ids>], invalid: [<1 id>] }` — verified by unit test with real index data.
- **SC-005**: `pnpm check` passes (TypeScript strict mode) with the new `src/lib/share.ts` module and the updated `src/lib/constants.ts`.
- **SC-006**: `pnpm test` passes with all new unit tests in `tests/unit/share-state-encoding.test.ts` green.
- **SC-007**: `pnpm build` succeeds — no new build-time imports or side effects break the Astro static build.
