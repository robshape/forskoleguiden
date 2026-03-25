# Implementation Plan: Share UI

**Branch**: `006-share-ui` | **Date**: 2026-03-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-share-ui/spec.md`

## Summary

Add share UI to the comparison page. The share button generates a compressed URL via the existing `encodeShareState()` from `src/lib/share.ts`, copies it to the clipboard with confirmation feedback, and falls back to a read-only text field when the Clipboard API is unavailable. On the comparison page, incoming `?s=` query parameters trigger share restoration: the payload is decoded via `decodeShareState()`, validated via `validateShareIds()`, and the compare set is populated — replacing any local state. Stale IDs produce a dismissable warning; corrupted payloads produce an error with a directory link. After successful restoration, the `?s=` parameter is stripped from the address bar via `history.replaceState()`.

## Technical Context

**Language/Version**: TypeScript (strict mode, `astro/tsconfigs/strict`)
**Primary Dependencies**: Astro (static output), Preact (islands), nanostores + @nanostores/preact, Tailwind CSS v4 (@tailwindcss/vite), lz-string (already installed for share encoding)
**Storage**: sessionStorage (client-side compare state persistence), no server-side storage
**Testing**: Vitest (unit, node env), Playwright + @axe-core/playwright (e2e), post-build verification tests
**Target Platform**: Static site on GitHub Pages, mobile-first (iPhone 13 mini viewport)
**Project Type**: Static web application (MPA with Preact islands)
**Performance Goals**: 100 KB uncompressed page-weight budget, Lighthouse perf ≥ 0.90, a11y ≥ 0.95, ~3–5 KB total island JS budget
**Constraints**: Share URLs < 2,000 chars, MAX_COMPARE = 5, zero runtime APIs, no external CDNs
**Scale/Scope**: ~100 preschools, 3 locales (sv/en/ar), 4 page types (directory, detail, comparison, about)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                  | Status  | Notes                                                                                                                                                                                                                                                                                                                             |
| -------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Performance by Default  | ✅ PASS | No new islands required. Share button is a lightweight Preact component rendered inside existing `ComparisonView` island. Clipboard API + `history.replaceState()` are native browser APIs — no new dependencies.                                              |
| II. Accessibility First    | ✅ PASS | Confirmation/warning/error messages use ARIA live regions (`role="status"` / `role="alert"`). Share button is keyboard accessible (native `<button>`). Fallback text field uses `<input readonly>` with dismiss button. All interactive elements meet 44×44 px touch target minimum.                                              |
| III. Data Integrity        | ✅ PASS | No changes to data pipeline. Share restoration validates IDs against preschool index at build time (survey data passed as props). `validateShareIds()` already has unit tests.                                                                                                                                                    |
| IV. Testing Standards      | ✅ PASS | Unit tests for new state action (`setCompareIds`), share URL construction, and URL param stripping. E2e tests for share button copy flow (mock clipboard), restoration from `?s=` param, stale-ID warning, error state. BDD-style test names.                                                              |
| V. Architecture Discipline | ✅ PASS | Share button on comparison page lives inside existing `ComparisonView` Preact island (no new island). URL restoration logic lives in `ComparisonView` via `useEffect`. Share URL construction utility in `src/lib/share.ts` (existing). |
| VI. Internationalization   | ✅ PASS | All share UI text uses i18n keys under `compare.share.*` namespace. Keys added to all three locale files (sv/en/ar). Key parity enforced by existing unit test.                                                                                                                                             |
| VII. Privacy by Design     | ✅ PASS | No server-side storage. Share state encoded in URL. No tracking. Clipboard API is a local browser operation. `history.replaceState()` modifies address bar locally only.                                                                                                                                                          |

**Gate result**: All 7 principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/006-share-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── share.ts              # EXISTING — encodeShareState(), decodeShareState(), validateShareIds()
│   ├── state.ts              # MODIFY  — add setCompareIds() bulk-set action
│   └── clipboard.ts          # NEW     — copyToClipboard() wrapper with fallback detection
├── components/
│   ├── preact/
│   │   ├── ComparisonView.tsx  # MODIFY — add share button, restoration logic (useEffect), warning/error states
│   │   └── ShareFeedback.tsx   # NEW    — confirmation toast, warning banner, error banner, clipboard fallback
│   └── astro/
│       └── pages/
│           └── ComparisonPage.astro  # MODIFY — pass new share-related i18n props to ComparisonView
├── i18n/
│   ├── sv.json           # MODIFY — add compare.share.* keys
│   ├── en.json           # MODIFY — add compare.share.* keys
│   └── ar.json           # MODIFY — add compare.share.* keys

tests/
├── unit/
│   ├── share-ui-state-set-compare-ids.test.ts  # NEW — unit tests for setCompareIds()
│   └── share-ui-clipboard-utility.test.ts      # NEW — unit tests for copyToClipboard()
└── e2e/
    └── share-ui-copy-and-restore.spec.ts       # NEW — e2e tests for share flow
```

**Structure Decision**: Follows existing Astro + Preact island architecture. Share UI components live in `src/components/preact/` alongside existing islands. No new feature directory needed — `src/lib/share.ts` already houses the domain logic. The clipboard utility is extracted to `src/lib/clipboard.ts` to keep the Preact component focused on rendering. `ShareFeedback.tsx` is a sub-component (not independently hydrated) rendered by `ComparisonView`.

## Implementation Phases

Phases are sequential — each depends on the previous. Tests are written before production code (constitution IV). Within a phase, steps marked **[P]** can run in parallel.

```text
Phase 1 (Foundation)
  └─► Phase 2 (i18n Keys)
        └─► Phase 3 (Comparison Page Share — User Story 1, P1)
              └─► Phase 4 (Share Restoration — User Story 2, P1)
                    └─► Phase 5 (Detail Page Share — User Story 3, P2)
                          └─► Phase 6 (E2e Tests + Full Verification)
```

### Phase 1: Foundation (no UI, test-first)

Write failing unit tests, then implement the two utility modules.

| Step | File                                                | What                                       | References                                               |
| ---- | --------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| 1a   | `tests/unit/share-ui-state-set-compare-ids.test.ts` | Write failing test for `setCompareIds()`   | research.md R4; spec FR-010                              |
| 1b   | `tests/unit/share-ui-clipboard-utility.test.ts`     | Write failing test for `copyToClipboard()` | research.md R1; spec FR-004, FR-006                      |
| 1c   | `src/lib/state.ts`                                  | Add `setCompareIds()` — bulk-set action    | research.md R4; data-model.md → State Management Changes |
| 1d   | `src/lib/clipboard.ts`                              | Create `copyToClipboard()` wrapper         | research.md R1; data-model.md → Relationships            |
| 1e   | —                                                   | Run unit tests — both pass                 | —                                                        |

### Phase 2: i18n Keys

| Step       | File               | What                                            | References                                   |
| ---------- | ------------------ | ----------------------------------------------- | -------------------------------------------- |
| 2a         | `src/i18n/sv.json` | Add `compare.share.*` keys | data-model.md → i18n Keys table; spec FR-017 |
| 2b **[P]** | `src/i18n/en.json` | Add matching English keys                       | data-model.md → i18n Keys table; spec FR-017 |
| 2c **[P]** | `src/i18n/ar.json` | Add matching Arabic keys                        | data-model.md → i18n Keys table; spec FR-017 |
| 2d         | —                  | Run `pnpm test` — i18n key parity test passes   | —                                            |

### Phase 3: Comparison Page Share (User Story 1 — P1)

Build the share button, clipboard copy, and feedback UI inside the existing `ComparisonView` island (no new island — see research.md R7).

| Step | File                                              | What                                                                                                                                                                              | References                                                                                                                                   |
| ---- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 3a   | `src/components/preact/ShareFeedback.tsx`         | Create sub-component: confirmation toast (`role="status"`), clipboard fallback (`<input readonly>` + close button), warning banner, error banner                                  | data-model.md → FeedbackState (state machine); research.md R3 (ARIA roles); spec FR-005, FR-006, FR-007                                      |
| 3b   | `src/components/preact/ComparisonView.tsx`        | Add share button rendering + click handler: `encodeShareState()` → URL construction → `copyToClipboard()` → set feedback state. Guard rapid clicks via `feedbackState !== 'idle'` | research.md R5 (placement + debounce), R6 (URL construction), R7 (integration strategy); spec FR-001, FR-002, FR-003, FR-004, FR-018, FR-019 |
| 3c   | `src/components/astro/pages/ComparisonPage.astro` | Pass new i18n string props to `ComparisonView`: share button label, copied label, fallback label, close label, warning template, error message, directory link text               | research.md R7 (prop list); data-model.md → i18n Keys table                                                                                  |

### Phase 4: Share Restoration (User Story 2 — P1)

Add `useEffect` to decode `?s=` on mount, validate IDs, populate the compare set, and strip the parameter from the URL.

| Step | File                                              | What                                                                                                                                                                                   | References                                                                                                                                                             |
| ---- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4a   | `src/components/preact/ComparisonView.tsx`        | Add `useEffect([], ...)`: read `?s=` → `decodeShareState()` → `validateShareIds(knownIds)` → derive `RestorationResult` → `setCompareIds()` → set feedback state → `stripShareParam()` (use `new URL(location.href)` + `url.searchParams.delete('s')` + `history.replaceState`) | research.md R2 (history.replaceState), R7 (integration); data-model.md → RestorationResult, FeedbackState; spec FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-020 |
| 4b   | `src/components/astro/pages/ComparisonPage.astro` | Pass `knownIds` prop (all non-placeholder survey IDs) to `ComparisonView` for `validateShareIds()`                                                                                     | data-model.md → Relationships (knownIds threading)                                                                                                                     |

**knownIds data flow**: `ComparisonPage.astro` calls `getAllPreschoolSurveys().filter(non-placeholder).map(s => s.id)` at build time → passes as `knownIds: string[]` prop → `ComparisonView` uses it in the restoration `useEffect` to call `validateShareIds(payload, knownIds)`.

### ~~Phase 5: Detail Page Share (User Story 3 — P2)~~ [REMOVED]

> **Descoped**: User Story 3 was removed. The comparison page does not show a share button when only 1 preschool is selected, so a detail page share button creating single-preschool links is contradictory. See spec.md for rationale.

### Phase 6: E2e Tests + Full Verification

| Step | File                                          | What                                                                                                                                     | References                                   |
| ---- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 6a   | `tests/e2e/share-ui-copy-and-restore.spec.ts` | E2e tests: share button copy flow (mock clipboard), restoration from `?s=`, stale-ID warning, corrupted payload error | spec SC-001 to SC-008; spec User Stories 1–2 |
| 6b   | —                                             | Run `pnpm validate` — all quality gates pass (lint, format, check, test, build, e2e, Lighthouse)                                         | spec SC-008                                  |

## Requirements Traceability

| FR     | Implementation                                                                   | Phase | Design Reference                                 |
| ------ | -------------------------------------------------------------------------------- | ----- | ------------------------------------------------ |
| FR-001 | `ComparisonView.tsx` — share button visible when ≥1 selected                     | 3     | research.md R5                                   |
| FR-002 | `ComparisonView.tsx` — calls `encodeShareState(ids)`                             | 3     | —                                                |
| FR-003 | `ComparisonView.tsx` — URL pattern `{origin}{base}/{locale}/jamfor/?s={encoded}` | 3     | research.md R6; data-model.md → ShareURL         |
| FR-004 | `clipboard.ts` → called from `ComparisonView.tsx`                                | 1, 3  | research.md R1                                   |
| FR-005 | `ShareFeedback.tsx` — `copied` state, auto-dismiss 2–3s                          | 3     | data-model.md → FeedbackState                    |
| FR-006 | `ShareFeedback.tsx` — `fallback` state, read-only field + close button           | 3     | data-model.md → FeedbackState; research.md R1    |
| FR-007 | `ShareFeedback.tsx` — `role="status"` live region                                | 3     | research.md R3                                   |
| FR-008 | `ComparisonView.tsx` useEffect — `decodeShareState()`                            | 4     | research.md R7                                   |
| FR-009 | `ComparisonView.tsx` useEffect — `validateShareIds()`                            | 4     | research.md R7                                   |
| FR-010 | `ComparisonView.tsx` useEffect — `setCompareIds()`                               | 4     | research.md R4; data-model.md → State Management |
| FR-011 | `ShareFeedback.tsx` — `warning` state, dismissable                               | 4     | data-model.md → FeedbackState                    |
| FR-012 | `ShareFeedback.tsx` — `error` state + directory link                             | 4     | data-model.md → FeedbackState                    |
| FR-013 | `ComparisonView.tsx` — all-invalid → error state, not empty grid                 | 4     | data-model.md → RestorationResult                |
| FR-014 | ~~`ShareButton.tsx` — detail page share button~~ [REMOVED]                       | ~~5~~     | —                                                |
| FR-015 | ~~`ShareButton.tsx` — URL targets comparison page~~ [REMOVED]                    | ~~5~~     | —                                                |
| FR-016 | ~~`ShareButton.tsx` — same copy+confirm behavior~~ [REMOVED]                     | ~~5~~     | —                                                |
| FR-017 | `src/i18n/*.json` — all 3 locale files                                           | 2     | data-model.md → i18n Keys                        |
| FR-018 | Native `<button>` element — keyboard accessible                                  | 3     | —                                                |
| FR-019 | FeedbackState guard — no-op while non-idle                                       | 3     | research.md R5                                   |
| FR-020 | `ComparisonView.tsx` useEffect — `history.replaceState()`                        | 4     | research.md R2                                   |

## Complexity Tracking

> No constitution violations. No complexity justifications needed.
