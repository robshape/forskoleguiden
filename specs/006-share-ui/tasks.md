# Tasks: Share UI

**Input**: Design documents from `specs/006-share-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are included — the spec and project constitution (Principle IV) require test-first development. Unit tests are written before production code; e2e tests are written after all UI is implemented.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. Phases are sequential — each depends on the previous. Within a phase, tasks marked **[P]** can run in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes exact file paths and parenthetical cross-references

---

## Phase 1: Foundation (Test-First, No UI)

**Purpose**: Write failing unit tests, then implement the two utility modules that all user stories depend on.

- [x] T001 Create `tests/unit/share-ui-state-set-compare-ids.test.ts` — write failing unit tests for `setCompareIds()`: bulk set up to MAX*COMPARE, truncation beyond 5, empty array, replacement of existing IDs *(quickstart Phase 1 → 1a; plan.md Phase 1 step 1a; spec FR-010; research.md R4)\_
- [x] T002 [P] Create `tests/unit/share-ui-clipboard-utility.test.ts` — write failing unit tests for `copyToClipboard()`: success path returns `true`, missing navigator returns `false`, clipboard API throws returns `false` _(quickstart Phase 1 → 1a; plan.md Phase 1 step 1b; spec FR-004, FR-006; research.md R1)_
- [x] T003 Run `pnpm test -- share-ui-state` and `pnpm test -- share-ui-clipboard` — both **fail** on import (modules don't exist yet); this is the expected red baseline _(quickstart Phase 1 → 1a verify; constitution IV)_
- [x] T004 Add `setCompareIds()` to `src/lib/state.ts` — bulk-set action: `compareIdsStore.set(ids.slice(0, MAX_COMPARE))`; export alongside existing `toggleCompare()` and `clearCompare()` _(quickstart Phase 1 → 1b; plan.md Phase 1 step 1c; research.md R4; data-model.md → State Management Changes; spec FR-010)_
- [x] T005 [P] Create `src/lib/clipboard.ts` — export `copyToClipboard(text: string): Promise<boolean>` using `navigator.clipboard.writeText()` with SSR guard and try/catch; returns `true` on success, `false` on any failure _(quickstart Phase 1 → 1c; plan.md Phase 1 step 1d; research.md R1; spec FR-004, FR-006)_
- [x] T006 Run `pnpm test -- share-ui-state` and `pnpm test -- share-ui-clipboard` — both **pass** _(quickstart Phase 1 → 1d; plan.md Phase 1 step 1e)_

**Checkpoint**: Foundation utilities implemented and tested. `setCompareIds()` provides atomic bulk state update; `copyToClipboard()` wraps the Clipboard API with graceful fallback detection. No UI yet.

---

## Phase 2: i18n Keys (Foundational)

**Purpose**: Add all share-related i18n keys to all three locale files. Must complete before any UI phase — components depend on these keys being available.

**⚠️ CRITICAL**: No user story UI work can begin until this phase is complete.

- [x] T007 Add `compare.share.*` and `detail.share.*` keys to `src/i18n/sv.json` — 8 keys total: `compare.share.button`, `compare.share.copied`, `compare.share.fallbackLabel`, `compare.share.close`, `compare.share.warningTemplate`, `compare.share.errorMessage`, `compare.share.errorDirectoryLink`, `detail.share.button`; Swedish values from data-model.md → i18n Keys table _(quickstart Phase 2; plan.md Phase 2 step 2a; data-model.md → i18n Keys; spec FR-017; constitution VI)_
- [x] T008 [P] Add matching English keys to `src/i18n/en.json` — same 8 keys with English translations; identical key structure _(quickstart Phase 2; plan.md Phase 2 step 2b; data-model.md → i18n Keys; spec FR-017)_
- [x] T009 [P] Add matching Arabic keys to `src/i18n/ar.json` — same 8 keys with Arabic translations; identical key structure _(quickstart Phase 2; plan.md Phase 2 step 2c; data-model.md → i18n Keys; spec FR-017)_
- [x] T010 Run `pnpm test -- i18n-locale-key-parity` — key parity test passes; all three locale files have identical key structures _(quickstart Phase 2 verify; plan.md Phase 2 step 2d)_

**Checkpoint**: All i18n keys in place. Key parity test green. UI phases can now reference these keys via `t()` calls.

---

## Phase 3: User Story 1 — Parent Shares Their Comparison via Link (Priority: P1) 🎯 MVP

**Goal**: A parent on the comparison page can click a "Share" button to copy a shareable URL to their clipboard, with visual confirmation feedback. If clipboard is unavailable, a read-only text field fallback is shown.

**Independent Test**: Load the comparison page with 2+ preschools selected → click Share → confirm (a) confirmation message appears briefly, (b) clipboard contains URL with `?s=` parameter, (c) URL is under 2,000 characters. Keyboard accessible via Tab + Enter/Space.

### Implementation for User Story 1

- [x] T011 [US1] Create `src/components/preact/ShareFeedback.tsx` — sub-component (not independently hydrated) that renders the appropriate notification based on `FeedbackState`: `copied` → confirmation toast with `role="status"` (polite live region), auto-dismiss 2–3s with `useEffect` cleanup (`clearTimeout` on unmount/state change); `fallback` → read-only `<input>` with share URL + close button; `warning` → dismissable banner with stale-ID count; `error` → persistent banner with directory link and `role="alert"` _(quickstart Phase 3 → 3a; plan.md Phase 3 step 3a; data-model.md → FeedbackState state machine; research.md R3; spec FR-005, FR-006, FR-007, FR-011, FR-012)_
- [x] T012 [US1] Add share button and click handler to `src/components/preact/ComparisonView.tsx` — render share button (native `<button>`) after the selected-count heading, before the comparison stack; click handler: `encodeShareState(ids)` → build URL `${origin}${getBasePath()}/${locale}/jamfor/?s=${encoded}` → `copyToClipboard(url)` → set feedback state (`copied` or `fallback`); rapid-click guard: no-op while `feedbackState.kind !== 'idle'`; render `ShareFeedback` inline _(quickstart Phase 3 → 3b; plan.md Phase 3 step 3b; research.md R5 placement + debounce, R6 URL construction, R7 integration strategy; spec FR-001, FR-002, FR-003, FR-004, FR-018, FR-019)_
- [x] T013 [US1] Update `src/components/astro/pages/ComparisonPage.astro` — pass new i18n string props to `ComparisonView`: `shareButtonLabel`, `shareCopiedLabel`, `shareFallbackLabel`, `shareCloseLabel`, `shareWarningTemplate`, `shareErrorMessage`, `shareErrorDirectoryLink` via `t('compare.share.*', locale)` calls _(quickstart Phase 3 → 3c; plan.md Phase 3 step 3c; research.md R7 prop list; data-model.md → i18n Keys)_

**Checkpoint**: Share button is visible on comparison page, copies URL to clipboard, shows confirmation feedback. Fallback text field works when clipboard is unavailable. Rapid clicks are guarded. All user-facing text is localized. US1 is independently testable.

---

## Phase 4: User Story 2 — Partner Opens a Shared Link and Sees the Same Comparison (Priority: P1)

**Goal**: When a user navigates to a comparison page URL with `?s=` parameter, the encoded preschool selection is decoded, validated against known IDs, and the compare set is restored. Stale IDs produce a dismissable warning; corrupted payloads produce an error with a directory link. After restoration, `?s=` is stripped from the address bar.

**Independent Test**: Construct a share URL with known preschool IDs → navigate to the URL → assert the comparison page shows the expected preschools. Separate tests for stale-ID warning and corrupted-payload error.

### Implementation for User Story 2

- [x] T014 [US2] Add restoration `useEffect` to `src/components/preact/ComparisonView.tsx` — `useEffect([], ...)` runs once on mount: read `?s=` from `window.location.search` → `decodeShareState(encoded)` (null → `error` feedback) → `validateShareIds(payload, knownIds)` → derive `RestorationResult` → if all valid: `setCompareIds(valid)`, feedback stays `idle`; if partial: `setCompareIds(validIds)`, feedback → `warning` with `invalidCount`; if none valid: feedback → `error`; on success/partial: strip `?s=` via `new URL(location.href)` → `url.searchParams.delete('s')` → `history.replaceState({}, '', url.pathname + url.search)` _(quickstart Phase 4 → 4a; plan.md Phase 4 step 4a; research.md R2, R7; data-model.md → RestorationResult, FeedbackState transitions; spec FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-020)_
- [x] T015 [US2] Update `src/components/astro/pages/ComparisonPage.astro` — pass `knownIds` prop to `ComparisonView`: `getAllPreschoolSurveys().filter(s => !isPlaceholder).map(s => s.id)` extracts known IDs at build time for `validateShareIds()` _(quickstart Phase 4 → 4b; plan.md Phase 4 step 4b; data-model.md → Prop Threading: knownIds)_

**Checkpoint**: Share restoration works end-to-end. Valid URLs populate the comparison. Stale IDs show warning with partial results. Corrupted URLs show error with directory link. `?s=` is stripped after restoration. US2 is independently testable alongside US1.

---

## ~~Phase 5: User Story 3~~ [REMOVED]

> **Descoped**: User Story 3 was removed. The comparison page does not show a share button when only 1 preschool is selected, so a detail page share button creating single-preschool links is contradictory.

### ~~Implementation for User Story 3~~ [REMOVED]

- [x] ~~T016 [US3] Create `src/components/preact/ShareButton.tsx`~~ [REMOVED — descoped with User Story 3]
- [x] ~~T017 [US3] Update `src/components/astro/pages/DetailPage.astro`~~ [REMOVED — descoped with User Story 3]

**Checkpoint**: Detail page share button is visible and functional. Copies a comparison-page-targeting URL with the single preschool ID. Same confirmation/fallback behavior as the comparison page share button. US3 is independently testable.

---

## Phase 6: E2e Tests + Full Verification

**Purpose**: Write end-to-end tests covering all three user stories and all success criteria. Run the full project quality gate.

- [x] T018 Create `tests/e2e/share-ui-copy-and-restore.spec.ts` — e2e tests covering: (1) share button exists and is clickable on comparison page with 2+ preschools; (2) confirmation message appears after click (mock clipboard via `context.grantPermissions`); (3) restoration from valid `?s=` URL shows correct preschools; (4) stale-ID `?s=` URL shows warning + valid preschools only; (5) corrupted `?s=` URL shows error + directory link; (6) detail page share button generates correct URL; (7) keyboard accessibility (Tab + Enter/Space on share button) _(quickstart Phase 6 → 6a; plan.md Phase 6 step 6a; spec SC-001 to SC-008; spec User Stories 1–3)_
- [x] T019 Run `pnpm validate` — all quality gates pass: lint, format, check, test, build, e2e, Lighthouse _(quickstart Phase 6 → 6b; plan.md Phase 6 step 6b; spec SC-008)_

**Checkpoint**: Feature complete. All success criteria met. All existing tests pass without regression. Branch is ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

Phases are strictly sequential — each depends on all earlier phases being complete:

```text
Phase 1 (Foundation: failing tests → setCompareIds + clipboard utility)
  └─► Phase 2 (i18n Keys: sv/en/ar locale files — BLOCKS all UI work)
        └─► Phase 3 US1 (Comparison Page Share: ShareFeedback + ComparisonView share button)
              └─► Phase 4 US2 (Share Restoration: useEffect decode/validate + knownIds prop)
                    └─► Phase 5 US3 (Detail Page Share: ShareButton island + DetailPage wiring)
                          └─► Phase 6 (E2e tests + pnpm validate)
```

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 1 (utilities) and Phase 2 (i18n keys). Creates `ShareFeedback.tsx` and modifies `ComparisonView.tsx` — both are prerequisites for US2.
- **US2 (P1)**: Depends on US1 — extends `ComparisonView.tsx` with restoration logic and reuses `ShareFeedback.tsx` for warning/error rendering.
- **US3 (P2)**: Depends on Phase 1 (clipboard utility). Could theoretically run in parallel with US1/US2 since it creates a new file (`ShareButton.tsx`), but it reuses `ShareFeedback.tsx` (created in US1) — therefore must follow US1.

### Within Each User Story

- Models/utilities before components
- Sub-components before parent components
- Astro page wiring after Preact component is ready
- Tests before production code (Phase 1 only — e2e tests come last in Phase 6)

### Parallel Opportunities Within Phases

- **Phase 1**: T001 and T002 are parallel (different test files); T004 and T005 are parallel (different source files)
- **Phase 2**: T008 and T009 are parallel (en.json and ar.json are independent after sv.json is done as reference)
- **Phase 3**: T011 must precede T012 (ShareFeedback before ComparisonView uses it); T013 follows T012
- **Phase 4**: T014 and T015 could be parallel but T015 is trivial — sequential is fine
- **Phase 5**: ~~T016 must precede T017 (ShareButton before DetailPage wires it)~~ [REMOVED]
- **Phase 6**: T018 must precede T019 (e2e tests must exist before validate runs them)

---

## Implementation Strategy

**MVP scope**: Phases 1–3 (US1 — Comparison Page Share) is the minimal deliverable. A parent can share their comparison via a copied link. If time-boxing is needed, this can be shipped alone.

**Incremental delivery**:

1. **MVP** (Phases 1–3) — share button + clipboard copy + confirmation feedback on comparison page. Minimum viable for parents to share links.
2. **P1 complete** (Phases 1–4) — adds share restoration from `?s=` URLs. Partners can now open shared links and see the comparison. Full sharing loop is functional.
3. **P1 + P2** (Phases 1–5) — adds detail page share button. Secondary entry point for sharing individual preschools.
4. **Full feature** (Phases 1–6) — all user stories implemented and verified end-to-end with e2e tests and full quality gate.

**Total tasks**: 19 tasks across 6 phases.

| Story                   | Tasks     | Priority     |
| ----------------------- | --------- | ------------ |
| Foundation (shared)     | T001–T006 | prerequisite |
| i18n Keys (shared)      | T007–T010 | prerequisite |
| US1 (comparison share)  | T011–T013 | P1 — MVP     |
| US2 (share restoration) | T014–T015 | P1           |
| US3 (detail share)      | ~~T016–T017~~ | ~~P2~~ [REMOVED] |
| E2e + verification      | T018–T019 | gate         |
