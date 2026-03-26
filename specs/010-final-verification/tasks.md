# Tasks: Phase 2 Final Verification

**Input**: Design documents from `/specs/010-final-verification/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No project initialization needed — all infrastructure exists. This phase validates that the existing test infrastructure has everything the new test needs.

- [x] T001 Confirm `tests/e2e/helpers.ts` exports all required constants and helpers: `DIRECTORY_URL`, `DIRECTORY_URL_EN`, `DIRECTORY_URL_AR`, `COMPARISON_URL_EN`, `COMPARISON_URL_AR`, `QUEUE_DETAIL_URL`, `encodeSharePayload`, `getDirectoryCard`, `getCompareButton`, `waitForCompareButtonReady`, `waitForCompareButtonSelected`
- [x] T002 [P] Identify three real preschool names from `data/malmo/index.json` to use as test constants — at least one must be an independent preschool with a `queueUrl` in `data/malmo/2025/` (use the preschool behind `QUEUE_DETAIL_URL` from helpers)

**Checkpoint**: Test constants and helper availability confirmed — implementation can begin.

---

## Phase 2: User Story 2 — End-to-End Phase 2 User Flow (Priority: P1) 🎯 MVP

**Goal**: Write a comprehensive e2e test that simulates the full Phase 2 user journey: language switching → preschool selection → queue link → comparison → share → restore → RTL layout — in a single integrated test.

**Independent Test**: `pnpm exec playwright test tests/e2e/user-flow-phase2.spec.ts` — passes end-to-end in isolation.

### Implementation

- [x] T003 [US2] Create `tests/e2e/user-flow-phase2.spec.ts` with module-level imports from `./fixtures` and `./helpers`, define three preschool name constants and their slug IDs, and scaffold a single `test('full Phase 2 user journey: language switching, selection, queue link, comparison, share, restore, RTL', async ({ page, browser }) => { … })` block
- [x] T004 [US2] Implement Step 1 — Language switcher visible on Swedish directory: load `DIRECTORY_URL`, assert language switcher `<nav>` is visible, assert "Svenska" has `aria-current="page"`, assert links to `/en/` and `/ar/` exist (spec US2 scenario 1)
- [x] T005 [US2] Implement Step 2 — Switch to English: click the English language switcher link, assert navigation to `DIRECTORY_URL_EN`, assert page heading uses English text (spec US2 scenario 2)
- [x] T006 [US2] Implement Step 3 — Add 3 preschools to compare on English directory: wait for hydration with `waitForCompareButtonReady()`, click 3 compare buttons, assert `aria-pressed="true"` on each, assert compare tray shows "3" with English text (spec US2 scenario 3)
- [x] T007 [US2] Implement Step 4 — View preschool detail page in English: click a preschool card link via `getDirectoryCard()`, assert URL matches English detail path `/forskoleguiden/en/forskola/…/`, assert `<html lang="en">`, assert preschool name heading visible (spec US2 scenario 4)
- [x] T008 [US2] Implement Step 5 — Queue link on independent preschool detail page: navigate to English equivalent of `QUEUE_DETAIL_URL` (`/forskoleguiden/en/forskola/bellevuegardens-montessoriforskola/`), assert queue registration link visible with `target="_blank"` and `rel="noopener noreferrer"`, assert `href` starts with `https://` (spec US2 scenario 5)
- [x] T009 [US2] Implement Step 6 — Compare state persists after returning to directory: navigate back to `DIRECTORY_URL_EN`, assert compare tray visible with "3" selected, assert all 3 compare buttons show `aria-pressed="true"` via `waitForCompareButtonSelected()` (spec US2 scenario 6, FR-006)
- [x] T010 [US2] Implement Step 7 — Comparison view shows 3 preschools in English: navigate to `COMPARISON_URL_EN`, wait for `comparison-scroll` test ID to be visible, assert all 3 preschool names appear as links (spec US2 scenario 7)
- [x] T011 [US2] Implement Step 8 — Share button shows confirmation: click the Share button, assert confirmation/status message appears with text matching "copied" or locale equivalent, do NOT assert clipboard contents per R5 (spec US2 scenario 8)
- [x] T012 [US2] Implement Step 9 — Share URL restoration in new context: construct share URL with `encodeSharePayload([id1, id2, id3])`, create new browser context via `browser.newContext()`, navigate to `COMPARISON_URL_EN + '?s=' + encoded`, assert comparison view shows all 3 preschools, close new context (spec US2 scenario 9, FR-007, R2)
- [x] T013 [US2] Implement Step 10 — Switch to Arabic on comparison page: click Arabic language switcher link on comparison page, assert navigation to `COMPARISON_URL_AR`, assert `<html dir="rtl">` and `<html lang="ar">` (spec US2 scenario 10, R4)
- [x] T014 [US2] Implement Step 11 — Arabic text and RTL layout verification: assert comparison view contains Arabic Unicode characters (regex `/[\u0600-\u06FF]/`), assert document direction is RTL (spec US2 scenario 11)
- [x] T015 [US2] Implement Step 12 — Arabic directory with persisted state: navigate to `DIRECTORY_URL_AR`, assert `dir="rtl"`, assert compare tray visible, assert tray contains "3" (spec US2 scenario 12, FR-006)
- [x] T016 [US2] Run `pnpm exec playwright test tests/e2e/user-flow-phase2.spec.ts` and verify all 12 steps pass (SC-002)

**Checkpoint**: Phase 2 user flow e2e test passes in isolation — all 12 scenarios verified.

---

## Phase 3: User Story 1 — Full Build and Static Output Verification (Priority: P1)

**Goal**: Confirm that existing post-build tests fully cover all 5 acceptance scenarios in User Story 1. No new test code expected — this is a read-only audit per R3.

**Independent Test**: `pnpm test:post-build` — all post-build assertions pass.

### Implementation

- [x] T017 [P] [US1] Read `tests/post-build/static-output-verification.test.ts` and verify it asserts: (a) `sv/`, `en/`, `ar/` locale directories exist with directory, comparison, about, and detail pages, (b) total HTML file count ≥ `MIN_HTML_FILE_COUNT` (40), (c) English pages have correct `lang` attribute without RTL, (d) Arabic pages have `lang="ar"`, `dir="rtl"`, and Arabic script content, (e) total dist size ≤ 21 MB
- [x] T018 [P] [US1] Read `tests/post-build/page-weight-budget.test.ts` and verify it asserts per-locale page weight ≤ 600 KB uncompressed for all three locales
- [x] T019 [US1] No gaps found — all US1 acceptance scenarios are fully covered by existing post-build tests.

**Checkpoint**: All US1 acceptance scenarios are confirmed covered by existing post-build tests.

---

## Phase 4: User Story 3 — Full Quality Gate Pass (Priority: P1)

**Goal**: Run the full validation pipeline and confirm zero errors across all quality checks — the final sign-off for Phase 2.

**Independent Test**: `pnpm validate` exits with code 0.

### Implementation

- [x] T020 [US3] Run `pnpm validate` end-to-end and verify all 10 pipeline steps pass: lint (US3-1) → lint:md (US3-1) → format (US3-2) → check (US3-3) → unit tests (US3-4) → build → post-build (US3-5) → e2e Chromium (US3-6) → e2e WebKit (US3-6) → Lighthouse audit (US3-7, US3-8)
- [x] T021 [US3] Confirm exit code 0 (SC-003) and verify: (a) zero lint, format, and type errors (US3-1 to US3-3), (b) all unit tests pass including Phase 2 tests (US3-4), (c) post-build assertions pass for sv/en/ar (US3-5), (d) all e2e tests pass including new `user-flow-phase2.spec.ts` and existing Phase 1 tests with no regression (US3-6, FR-010, SC-005), (e) Lighthouse accessibility ≥ 0.95 and performance ≥ 0.9 for all locale index pages (US3-7, US3-8, SC-004)

**Checkpoint**: Full validation pipeline passes — Phase 2 is ready to ship (SC-003).

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and documentation.

- [x] T022 Run quickstart.md manual verification commands to confirm expected output matches documented expectations
- [x] T023 [P] Verify no TODO/FIXME markers remain in `tests/e2e/user-flow-phase2.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **US2 E2E Test (Phase 2)**: Depends on Phase 1 (test constants and helpers confirmed)
- **US1 Post-Build Audit (Phase 3)**: No dependencies on Phase 2 — can run in parallel with Phase 2
- **US3 Full Pipeline (Phase 4)**: Depends on Phase 2 (the new e2e test must exist before the pipeline can run it)
- **Polish (Phase 5)**: Depends on Phase 4

### Parallel Opportunities

```
Phase 1: T001, T002 ──────────────────────────────────────────┐
                                                               │
Phase 2: T003 → T004 → T005 → ... → T015 → T016 ─────────────┤ (sequential steps, single test)
                                                               │
Phase 3: T017 ┐                                                │ (can run in parallel with Phase 2)
         T018 ┤→ T019                                          │
              │                                                │
Phase 4: T020 → T021 ──── (depends on Phase 2) ───────────────┤
                                                               │
Phase 5: T022, T023 ──── (after Phase 4) ─────────────────────┘
```

### Within Phase 2 (US2 — E2E Test)

Tasks T004 through T015 are sequential steps within a single `test()` block — they CANNOT run in parallel. Each step depends on the browser state from the previous step. T003 (scaffold) must come first. T016 (run and verify) must come last.

## Implementation Strategy

### MVP First (User Story 2 — E2E Test)

1. Complete Phase 1: Verify helpers and pick test constants
2. Complete Phase 2: Write `user-flow-phase2.spec.ts` with all 12 steps
3. **STOP and VALIDATE**: `pnpm exec playwright test tests/e2e/user-flow-phase2.spec.ts`
4. If test passes → proceed to Phase 3 + Phase 4

### Full Delivery

1. Phase 1: Setup (confirm helpers) → immediate
2. Phase 2: Write e2e test (the only new code in this feature)
3. Phase 3: Audit post-build coverage (parallel with Phase 2 if desired)
4. Phase 4: `pnpm validate` → exit code 0 = Phase 2 ships
5. Phase 5: Final polish

## Notes

- This feature produces exactly **one new file**: `tests/e2e/user-flow-phase2.spec.ts`
- No application code changes, no new components, no data model changes
- The e2e test follows the Phase 1 pattern: single `test()` block, sequential `// ── Step N:` comments
- All post-build coverage already exists from earlier Phase 2 steps — Phase 3 is a read-only audit
- `pnpm validate` is the ultimate pass/fail signal for the entire Phase 2 release
