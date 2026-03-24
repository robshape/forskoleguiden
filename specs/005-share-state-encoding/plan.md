# Implementation Plan: Share State Encoding

**Branch**: `005-share-state-encoding` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/005-share-state-encoding/spec.md`

## Summary

Create a pure library module (`src/lib/share.ts`) that encodes the compare set into a versioned, compressed, URL-safe string and decodes it back. No Astro pages, no Preact islands, no i18n keys, and no UI are touched in this step — this is infrastructure that Step 6 (Share UI) and Step 7 (Email Shortlist) build on.

Three changes are made to the source tree:

1. **`src/lib/constants.ts`** — add `SHARE_CITY = 'Malmö'` so the encoder can populate the `city` field without file I/O.
2. **`src/lib/share.ts`** — new module exporting `SharePayload`, `encodeShareState`, `decodeShareState`, and `validateShareIds`.
3. **`tests/unit/share-state-encoding.test.ts`** — unit tests covering all three functions, written test-first.

Package changes: `lz-string` (prod) and `@types/lz-string` (dev), both pinned to exact versions.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js (test environment), browser (production — Preact island)
**Primary Dependencies**: `lz-string` (new), `src/lib/constants`, `src/lib/state` (for `MAX_COMPARE` in tests)
**Storage**: No files written; no DOM touched; no sessionStorage accessed
**Testing**: Vitest (unit tests only — no e2e tests are added in this step)
**Target Platform**: Dual — Node.js (Vitest unit tests) and browser (Preact island in Step 6)
**Project Type**: Static site (Astro SSG with Preact islands)
**Performance Goals**: No page-weight impact — `share.ts` is only imported by the Preact island (Step 6). Bundle size contribution of lz-string is ~2 KB minified/gzipped.
**Constraints**: Zero Node.js `fs` or `process` usage in `share.ts` (must be browser-safe); zero side effects on import; TypeScript strict mode compliance; all dependencies pinned to exact versions per project convention.
**Scale/Scope**: 1 new source file (~60 lines), 1 updated source file (1 constant), 1 new test file (~15 test cases), 2 package additions.

## Constitution Check

_GATE: Must pass before implementation._

| Principle               | Status  | Notes                                                                                                                                                                                            |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Performance by Default  | ✅ PASS | `share.ts` is not imported at build time by Astro pages — only by `ComparisonView.tsx` (Step 6). lz-string adds ~2 KB to the Preact island bundle. Page-weight budget is not impacted this step. |
| Accessibility First     | ✅ PASS | No UI in this step. Not applicable.                                                                                                                                                              |
| Data Integrity          | ✅ PASS | `decodeShareState` validates all fields before returning. No invalid payload is returned as a `SharePayload`.                                                                                    |
| Testing Standards       | ✅ PASS | Tests are written before implementation (test-first). All three functions have unit tests covering happy path, edge cases, and failure modes.                                                    |
| Architecture Discipline | ✅ PASS | Pure functions only. No new abstractions beyond what the spec requires. No file I/O in the library. Clear separation: encoder uses constants, decoder validates, validator is pure logic.        |
| Internationalization    | ✅ PASS | No user-facing text in this step. The payload carries raw IDs; locale is URL-path-level.                                                                                                         |
| Privacy by Design       | ✅ PASS | The payload contains only preschool IDs (public slugs), `city`, `year`, and `v`. No personal data. No external requests.                                                                         |

**Post-design re-check**: All gates green. Changes are additive and isolated to a new module.

## Project Structure

### Documentation (this feature)

```text
specs/005-share-state-encoding/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── tasks.md             # Phase 2 output (/speckit.tasks)
└── checklists/
    └── requirements.md  # Phase 0 quality gate
```

### Source Code (touched files only)

```text
src/
└── lib/
    ├── constants.ts      # Updated: add SHARE_CITY = 'Malmö'
    └── share.ts          # New: SharePayload type + encodeShareState + decodeShareState + validateShareIds

tests/
└── unit/
    └── share-state-encoding.test.ts  # New: unit tests for all three functions

package.json              # Updated: add lz-string (prod) + @types/lz-string (dev), exact versions
pnpm-lock.yaml            # Updated automatically by pnpm
```

No other files are touched.

## Implementation Sequence

### Phase 1 — Dependencies and Baseline

Install `lz-string` and verify the baseline (no regressions before touching any source files).

### Phase 2 — Failing Tests (Test-First)

Write all unit tests that will initially fail. Do NOT write any production code until the failing test file is in place.

### Phase 3 — Constants

Add `SHARE_CITY` to `src/lib/constants.ts`. This is a prerequisite for `share.ts`.

### Phase 4 — Library Module

Create `src/lib/share.ts` with the three exported functions and the `SharePayload` type.

### Phase 5 — Verification

Run `pnpm check` + `pnpm test` + `pnpm build` to confirm all success criteria.
