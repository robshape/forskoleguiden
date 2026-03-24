# Tasks: Share State Encoding

**Input**: Design documents from `specs/005-share-state-encoding/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are included — the spec requires a unit test suite covering all three functions (SC-001 – SC-006). Tests are written before production code per the project constitution.

**Organization**: Tasks are sequential within each phase (dependencies exist between phases). No UI, no Astro pages, no i18n files, no Preact islands in this step.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes exact file paths

---

## Phase 1: Dependency Installation

**Purpose**: Install `lz-string` and its types, verify the baseline build is unchanged.

- [x] T001 Install `lz-string` as a production dependency: `pnpm add lz-string` — then manually remove any `^` or `~` prefix from the version in `package.json` if pnpm added one _(quickstart Step 1; spec.md FR-001; plan.md Phase 1)_
- [x] T002 Install `@types/lz-string` as a dev dependency: `pnpm add -D @types/lz-string` — confirm exact version in `package.json` and remove `^`/`~` if present _(quickstart Step 1; plan.md Phase 1 — run after T001 completes; do not parallelise)_
- [x] T003 Run `pnpm check` — TypeScript compiles cleanly with the new types _(quickstart Step 1 → Verify; quickstart → Common Pitfalls)_
- [x] T004 Run `pnpm build` — Astro build produces the same output as before; no regressions _(plan.md Phase 1 baseline; quickstart → Common Pitfalls)_

**Checkpoint**: lz-string installed and typed. Verify `package.json` has no `^` or `~` on `lz-string` or `@types/lz-string` (T018 in Phase 7 is a final re-confirmation). Existing build is green. No source files touched. Proceed to failing tests.

---

## Phase 2: Failing Tests — Write Before Implementation

**Purpose**: Write all test assertions that will initially fail. Per the project constitution, production code comes after the failing test harness is in place.

- [x] T005 [US1, US2, US3] Create `tests/unit/share-state-encoding.test.ts` with all test cases described in `quickstart.md → Step 2` and `data-model.md → New File: tests/unit/share-state-encoding.test.ts` — the file should import `encodeShareState`, `decodeShareState`, and `validateShareIds` from `@/lib/share` _(quickstart Step 2; data-model.md → Test structure)_
- [x] T006 Run `pnpm test -- share-state-encoding` — every test **fails** (`@/lib/share` does not exist yet; the entire test file errors on import); this is the expected red baseline for the whole feature _(quickstart Step 2 → Verify)_

**Checkpoint**: Failing test suite confirmed. No production file has been created. The red baseline is in place.

---

## Phase 3: Constants Update

**Purpose**: Add the `SHARE_CITY` constant so `share.ts` can import it without file I/O.

- [x] T007 [US1] Add `export const SHARE_CITY = 'Malmö'` at the end of `src/lib/constants.ts` with a one-line JSDoc comment _(quickstart Step 3; spec.md FR-012; research.md D-3; data-model.md → New Constant: SHARE_CITY)_
- [x] T008 Run `pnpm check` — TypeScript strict mode passes with the new export _(quickstart Step 3 → Verify)_

**Checkpoint**: `SHARE_CITY` is exported. `constants.ts` is complete.

---

## Phase 4: User Story 1 — Encoder (Priority: P1) 🎯 MVP

**Goal**: `encodeShareState(ids)` encodes the compare set into a compact URL-safe string.

**Independent Test**: `pnpm test -- share-state-encoding` — the `encodeShareState` describe block passes; URL-budget and URL-safety assertions are green. _(spec.md US-1; SC-001)_

### Implementation for User Story 1

- [x] T009 [US1] Create `src/lib/share.ts`: export `SharePayload` type; implement `encodeShareState(ids: string[]): string` using `LZString.compressToEncodedURIComponent(JSON.stringify({ v: 1, city: SHARE_CITY, year: SURVEY_YEAR, ids }))` _(quickstart Step 4a; spec.md FR-001, FR-004, FR-005, FR-012; data-model.md → encodeShareState)_
- [x] T010 [US1] Run `pnpm test -- share-state-encoding` — the `encodeShareState` describe block now passes; the `decodeShareState` and `validateShareIds` describe blocks still fail (those exports are not yet implemented) _(SC-001; quickstart Step 4a → Verify)_

**Checkpoint**: US1 independently verifiable. A parent's compare set can be encoded to a URL-safe string under the character budget.

---

## Phase 5: User Story 2 — Decoder (Priority: P1)

**Goal**: `decodeShareState(encoded)` recovers the original IDs from an encoded string, or returns `null` for any invalid input.

**Independent Test**: `pnpm test -- share-state-encoding` — the `decodeShareState` describe block passes; round-trip, corrupted string, empty string, future version, non-JSON, and missing-fields cases are all green. _(spec.md US-2; SC-002, SC-003)_

### Implementation for User Story 2

- [x] T011 [US2] Add `decodeShareState(encoded: string): SharePayload | null` to `src/lib/share.ts`: wrap all logic in try-catch; call `LZString.decompressFromEncodedURIComponent`; return `null` if decompression returns falsy; call `JSON.parse`; validate all fields including `v === 1`; return typed payload or `null` _(quickstart Step 4b; spec.md FR-006, FR-007; data-model.md → decodeShareState; research.md D-4)_
- [x] T012 [US2] Run `pnpm test -- share-state-encoding` — the `encodeShareState` and `decodeShareState` describe blocks now both pass; `validateShareIds` still fails _(SC-002, SC-003; quickstart Step 4b → Verify)_

**Checkpoint**: US2 independently verifiable. A shared link is reliably decoded; corrupted or future-version inputs return `null` without throwing.

---

## Phase 6: User Story 3 — ID Validator (Priority: P2)

**Goal**: `validateShareIds(payload, knownIds)` classifies decoded IDs into valid and invalid, enabling Step 6's UI to warn parents about stale preschool links.

**Independent Test**: `pnpm test -- share-state-encoding` — the `validateShareIds` describe block passes; all classification, deduplication, and empty-index cases are green. _(spec.md US-3; SC-004)_

### Implementation for User Story 3

- [x] T013 [US3] Add `validateShareIds(payload: SharePayload, knownIds: readonly string[]): { valid: string[]; invalid: string[] }` to `src/lib/share.ts`: use `new Set(knownIds)` for lookup; deduplicate `payload.ids` via `new Set`; classify each unique ID _(quickstart Step 4c; spec.md FR-008, FR-009; data-model.md → validateShareIds; research.md D-5)_
- [x] T014 [US3] Run `pnpm test -- share-state-encoding` — all three describe blocks now pass; the full test file is green _(SC-004; quickstart Step 4c → Verify)_

**Checkpoint**: All three functions implemented. Full unit test suite is green.

---

## Phase 7: Full Verification

**Purpose**: Confirm all success criteria and no regressions across the full project quality gate subset.

- [x] T015 [P] Run `pnpm check` — TypeScript strict mode passes across the entire project _(SC-005; quickstart Step 5)_
- [x] T016 [P] Run `pnpm test` — all existing unit tests still pass; new `share-state-encoding.test.ts` is fully green _(SC-006; quickstart Step 5)_
- [x] T017 Run `pnpm build` — Astro static build succeeds; `dist/` output is functionally unchanged _(SC-007; quickstart Step 5; quickstart → Common Pitfalls)_
- [x] T018 [P] Verify `package.json` has no `^` or `~` on `lz-string` or `@types/lz-string` entries _(project convention: exact versions)_

**Checkpoint**: Feature complete. All success criteria met. Branch is ready for PR and `pnpm validate` in CI.

---

## Dependencies

User story completion order — each phase depends on all earlier phases being complete:

```text
Phase 1 (deps + baseline)
  └─► Phase 2 (failing tests — whole file errors until T009 creates share.ts)
        └─► Phase 3 (SHARE_CITY constant — required by encodeShareState)
              └─► Phase 4 US1 (encoder — T009 creates share.ts; T010 verifies encodeShareState)
                    └─► Phase 5 US2 (decoder — appended to share.ts; T012 verifies decodeShareState)
                          └─► Phase 6 US3 (validator — appended to share.ts; T014 full suite green)
                                └─► Phase 7 (full project verification)
```

All three user stories are sequential (each function builds on top of the same file). There is no scope for story-level parallelism here — `share.ts` is a single growing module.

**Parallel opportunities within phases**:

- T003 (`pnpm check`) is independent of T004 (`pnpm build`) — but both depend on T002; run them sequentially after T002 to avoid confusing output.
- T015 (`pnpm check`), T016 (`pnpm test`), and T018 (version-pin verification) are independent of each other after T014 and can be run concurrently.
- T017 (`pnpm build`) depends on T015 and T016 being green first.

---

## Implementation Strategy

**MVP scope**: Phase 4 (US1 — encoder) is the minimal deliverable. `encodeShareState` produces the URL-safe string; `decodeShareState` and `validateShareIds` extend it. If time-boxing is needed, US1 can be shipped alone and US2+US3 added in a follow-up.

**Incremental delivery**:

1. **P1 only** (encoders + decoder) — Phases 1–5 — delivers shareable links and recovery. Minimum viable for the Step 6 UI.
2. **P1 + P2** (all three functions) — Phases 1–6 — adds stale-ID validation. Required for the full Step 6 warning state.
3. **Full feature** — Phases 1–7 — all functions implemented and verified end-to-end.

**Total tasks**: 18 tasks across 7 phases.

| Story           | Tasks     | Priority     |
| --------------- | --------- | ------------ |
| US1 (encoder)   | T009–T010 | P1 — MVP     |
| US2 (decoder)   | T011–T012 | P1           |
| US3 (validator) | T013–T014 | P2           |
| Setup / infra   | T001–T008 | prerequisite |
| Verification    | T015–T018 | gate         |
