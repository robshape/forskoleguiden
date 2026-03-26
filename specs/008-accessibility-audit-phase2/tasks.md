# Tasks: Accessibility Audit (Phase 2)

**Input**: Design documents from `/specs/008-accessibility-audit-phase2/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: This is a test-only feature — every task IS a test. All functional requirements (FR-001–FR-014) define test assertions. No production code changes.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. US1 and US2 (both P1) edit different files and can run in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Verify Existing Infrastructure)

**Purpose**: Confirm the existing e2e test infrastructure has all required URL constants, hydration guards, and fixture functions before writing new tests.

- [x] T001 Verify tests/e2e/helpers.ts exports all required URL constants (`DIRECTORY_URL_EN`, `DETAIL_URL_EN`, `COMPARISON_URL_EN`, `DIRECTORY_URL_AR`) and hydration guard functions (`waitForCompareButtonReady`). Verify tests/e2e/fixtures.ts exports `getFocusRingContract` and `getFocusOutlineContract`. No code changes expected — this is a read-and-confirm gate. See [data-model.md § Interactive Element table](data-model.md) and [quickstart.md § Hydration guard pattern](quickstart.md).

**Checkpoint**: Infrastructure verified — user story implementation can begin.

---

## Phase 2: User Story 1 — Automated Accessibility Compliance Across All Locales (Priority: P1) 🎯 MVP

**Goal**: Extend axe-core WCAG 2.0 Level A/AA scanning to English locale pages (directory, detail, comparison), bringing total coverage from 6 to 9 locale-page combinations. Satisfies spec FR-001, FR-002, SC-001, and US1 scenarios 1–6.

**Independent Test**: Run `pnpm exec playwright test tests/e2e/accessibility-axe-core.spec.ts`. All 9 scans (3 Swedish + 3 Arabic + 3 English) pass with zero violations.

### Implementation for User Story 1

- [x] T002 [US1] Add English directory page axe-core scan in tests/e2e/accessibility-axe-core.spec.ts. Navigate to `DIRECTORY_URL_EN`. Wait for CompareButton hydration using English locale locator (`/Compare/` not `/Jämför/`) per [research.md decision #7](research.md). Run `AxeBuilder(page).withTags(['wcag2a', 'wcag2aa']).analyze()`. Assert `results.violations` is empty. Follows existing Swedish/Arabic scan pattern in the same file. Satisfies FR-001, US1 scenario 1.
- [x] T003 [US1] Add English detail page axe-core scan in tests/e2e/accessibility-axe-core.spec.ts. Navigate to `DETAIL_URL_EN`. No hydration guard needed (DetailsBarChart is static, not a client:only island). Run axe-core scan. Assert zero violations. Satisfies FR-001, US1 scenario 2.
- [x] T004 [US1] Add English comparison page axe-core scan in tests/e2e/accessibility-axe-core.spec.ts. Seed sessionStorage with 2+ preschool IDs (`['almgardens-forskola', 'augustenborgs-forskola']`) using `page.addInitScript()` per [quickstart.md § SessionStorage seeding pattern](quickstart.md). Navigate to `COMPARISON_URL_EN`. Wait for `[data-testid="comparison-scroll"]` visibility per [research.md decision #6](research.md). Run axe-core scan. Assert zero violations. Satisfies FR-001, FR-002, US1 scenario 3.
- [x] T005 [US1] Run `pnpm exec playwright test tests/e2e/accessibility-axe-core.spec.ts` and verify all 9 locale-page scans (Swedish 3 + Arabic 3 + English 3) pass with zero violations.

**Checkpoint**: US1 complete — all 9 locale-page combinations scanned with zero axe-core violations.

---

## Phase 3: User Story 2 — Keyboard Navigation for Phase 2 Interactive Elements (Priority: P1)

**Goal**: Verify all Phase 2 interactive elements (language switcher, share button, queue links) are keyboard-reachable via Tab and operable via Enter/Space, with visible focus indicators. Satisfies spec FR-003, FR-004, FR-014, SC-002, SC-003, and US2 scenarios 1–5.

**Independent Test**: Run `pnpm exec playwright test tests/e2e/keyboard-navigation-focus-ring.spec.ts`. All existing Phase 1 tests plus three new Phase 2 tests pass.

### Implementation for User Story 2

- [x] T006 [US2] Add language switcher keyboard flow test in a new Phase 2 describe block in tests/e2e/keyboard-navigation-focus-ring.spec.ts. Navigate to `DIRECTORY_URL` (Swedish). Tab until focus lands on `[data-testid="header-language-toggle"]` per [data-model.md § Interactive Element table](data-model.md). Assert visible focus ring using `getFocusRingContract()` from fixtures.ts per [quickstart.md § Focus ring assertion pattern](quickstart.md). Press Enter or Space to open the `<details>` disclosure per [research.md decision #3](research.md). Tab to locale link inside `[data-testid="header-language-options"]`. Assert focus ring. Press Enter. Assert URL changed to target locale. Satisfies FR-003, FR-004, US2 scenario 1.
- [x] T007 [US2] Add share button keyboard flow test in tests/e2e/keyboard-navigation-focus-ring.spec.ts. Seed sessionStorage with 2+ preschool IDs. Navigate to comparison page. Tab until focus lands on `[data-testid="share-comparison-button"]` per [data-model.md](data-model.md). Assert focus ring. Press Enter or Space. Assert share feedback appears (`[data-testid="share-feedback-copied"]` visible). Assert focus has NOT moved to feedback element (FR-014) — verify `document.activeElement` is not the feedback container. Satisfies FR-003, FR-004, FR-014, US2 scenarios 2, 4, 5.
- [x] T008 [US2] Add queue link keyboard flow test in tests/e2e/keyboard-navigation-focus-ring.spec.ts. Navigate to a detail page for an independent preschool (one with `queueUrl` in data). Tab until focus lands on the queue registration link (`a[target="_blank"]` in detail content area) per [data-model.md](data-model.md). Assert focus ring. Assert the link has `href`, `target="_blank"`, and `rel="noopener noreferrer"` per [research.md decision #4](research.md). Satisfies FR-003, FR-004, US2 scenario 3.
- [x] T009 [US2] Run `pnpm exec playwright test tests/e2e/keyboard-navigation-focus-ring.spec.ts` and verify all Phase 1 + Phase 2 keyboard tests pass.

**Checkpoint**: US2 complete — all Phase 2 interactive elements keyboard-navigable with visible focus indicators.

---

## Phase 4: User Story 3 — Screen Reader Labeling for New Elements (Priority: P2)

**Goal**: Assert correct ARIA landmarks, `aria-current` marking, `lang` attributes, live region roles, and descriptive link text for all Phase 2 elements. Satisfies spec FR-005–FR-013, SC-004, SC-005, and US3 scenarios 1–7.

**Independent Test**: Run `pnpm exec playwright test tests/e2e/accessibility-phase2-screen-reader.spec.ts`. All labeling assertions pass.

### Implementation for User Story 3

- [x] T010 [US3] Create tests/e2e/accessibility-phase2-screen-reader.spec.ts with language switcher labeling describe block. Navigate to each locale's directory page (`DIRECTORY_URL`, `DIRECTORY_URL_EN`, `DIRECTORY_URL_AR` from helpers.ts). Assert the language switcher is inside a `<nav>` with non-empty `aria-label` (FR-005) per [data-model.md § Interactive Element table](data-model.md). Assert the active locale element has `aria-current="page"` (FR-006). Assert each locale link inside `[data-testid="header-language-options"]` has a `lang` attribute matching its target locale (FR-007) — e.g., English link has `lang="en"`, Arabic link has `lang="ar"`. Satisfies FR-005, FR-006, FR-007, SC-005, US3 scenarios 1–2.
- [x] T011 [US3] Add share feedback live region assertions describe block in tests/e2e/accessibility-phase2-screen-reader.spec.ts. (a) Share button label: Seed 2+ preschools, navigate to comparison page, assert share button has accessible text via visible text or `aria-label` (FR-008). (b) Copied confirmation: Click share button, assert `[data-testid="share-feedback-copied"]` has `role="status"` (FR-009), assert it remains visible for at least 2 seconds before auto-dismiss at 2500ms per [research.md decision #5](research.md) (FR-013). (c) Warning message: Navigate with share URL containing mixed valid/invalid IDs, assert `[data-testid="share-feedback-warning"]` has `role="status"` (FR-010). (d) Error message: Navigate with `?s=INVALID_GARBAGE`, assert `[data-testid="share-feedback-error"]` has `role="alert"` (FR-011). Satisfies FR-008–FR-011, FR-013, SC-004, US3 scenarios 3–6.
- [x] T012 [US3] Add queue link labeling assertions describe block in tests/e2e/accessibility-phase2-screen-reader.spec.ts. Navigate to a detail page for an independent preschool. Assert queue link has descriptive text (not "Click here" or empty) (FR-012). Assert `target="_blank"` is present. Verify the link indicates it opens in a new window (via visible text, `aria-label`, or adjacent sr-only span) per [research.md decision #4](research.md). Satisfies FR-012, US3 scenario 7.
- [x] T013 [US3] Run `pnpm exec playwright test tests/e2e/accessibility-phase2-screen-reader.spec.ts` and verify all screen reader labeling assertions pass.

**Checkpoint**: US3 complete — all Phase 2 elements have correct ARIA semantics and live region announcements.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate no regressions, handle edge cases, and confirm CI integration.

- [x] T014 Review any Arabic page axe-core violations for RTL false positives (spec Edge Cases §1). If false positives exist, document justified exclusions as code comments with axe rule ID and rationale — do NOT suppress entire rule categories. See plan.md Refinement R1.
- [x] T015 Run full e2e test suite (`pnpm test:e2e`) and verify all Phase 1 tests still pass — specifically `user-flow-phase1.spec.ts` on `/sv/`. This catches accidental breakage from new test helpers or shared state. See plan.md Refinement R2.
- [x] T016 Run `pnpm validate` to confirm the new test file (`accessibility-phase2-screen-reader.spec.ts`) is picked up by the existing Playwright config (`testDir: 'tests/e2e'` glob) and the full quality gate passes. No `playwright.config.ts` changes should be needed. Satisfies SC-006. See plan.md Refinement R3.

**Checkpoint**: All tests green, CI passes, no regressions.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — a read-and-confirm gate
- **US1 (Phase 2)**: Depends on Setup completion
- **US2 (Phase 3)**: Depends on Setup completion — **can run in parallel with US1** (different files)
- **US3 (Phase 4)**: Depends on Setup completion — **can run in parallel with US1 and US2** (new file, no shared state)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Modifies `accessibility-axe-core.spec.ts` — no dependency on US2 or US3
- **US2 (P1)**: Modifies `keyboard-navigation-focus-ring.spec.ts` — no dependency on US1 or US3
- **US3 (P2)**: Creates `accessibility-phase2-screen-reader.spec.ts` — no dependency on US1 or US2

All three user stories are **fully independent** — they each edit/create different files and test different behavioral concerns.

### Within Each User Story

- Tests are added sequentially within their file (same-file edits cannot be parallelized)
- Each test case is independently verifiable
- Verification task runs after all test cases in the story are written

### Parallel Opportunities

- **US1 + US2 + US3 can all run in parallel** after Setup (Phase 1) — each modifies a different file
- Within each story, tasks are sequential (same file)
- Polish phase must wait for all stories to complete

---

## Parallel Example: All User Stories

```text
# After Setup (T001) completes, launch all three user stories in parallel:

# Developer A (or Agent A): User Story 1 — axe-core scans
Task: T002 → T003 → T004 → T005 (all in accessibility-axe-core.spec.ts)

# Developer B (or Agent B): User Story 2 — keyboard navigation
Task: T006 → T007 → T008 → T009 (all in keyboard-navigation-focus-ring.spec.ts)

# Developer C (or Agent C): User Story 3 — screen reader labeling
Task: T010 → T011 → T012 → T013 (all in accessibility-phase2-screen-reader.spec.ts)

# After all three complete: Polish
Task: T014 → T015 → T016
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify infrastructure)
2. Complete Phase 2: US1 (add 3 English axe-core scans)
3. **STOP and VALIDATE**: Run `pnpm exec playwright test tests/e2e/accessibility-axe-core.spec.ts` — 9 scans, zero violations
4. This alone delivers measurable value: full locale coverage for automated WCAG compliance

### Incremental Delivery

1. Complete Setup → Infrastructure verified
2. Add US1 (axe-core) → 9/9 locale-page scans pass → Immediate compliance value
3. Add US2 (keyboard) → All Phase 2 elements keyboard-operable → WCAG 2.1.1 coverage
4. Add US3 (screen reader) → Full ARIA labeling verified → Complete accessibility audit
5. Polish → CI green, no regressions → Ship

### Parallel Strategy

Since all three user stories edit different files:
1. Complete Setup (1 task)
2. Run US1 + US2 + US3 in parallel (12 tasks across 3 files)
3. Polish (3 tasks)
4. Total: 16 tasks, critical path length: 5 tasks (Setup → longest story → Polish)

---

## Traceability: Tasks → Spec Requirements

| Task | Spec Requirements | Plan Step |
|------|-------------------|-----------|
| T001 | — (infrastructure gate) | — |
| T002 | FR-001, US1.1 | Step 1.1 |
| T003 | FR-001, US1.2 | Step 1.2 |
| T004 | FR-001, FR-002, US1.3 | Step 1.3 |
| T005 | SC-001 | Step 1 (verify) |
| T006 | FR-003, FR-004, US2.1 | Step 2.1 |
| T007 | FR-003, FR-004, FR-014, US2.2, US2.4, US2.5 | Step 2.2 |
| T008 | FR-003, FR-004, US2.3 | Step 2.3 |
| T009 | SC-002, SC-003 | Step 2 (verify) |
| T010 | FR-005, FR-006, FR-007, SC-005, US3.1, US3.2 | Step 3.1 |
| T011 | FR-008, FR-009, FR-010, FR-011, FR-013, SC-004, US3.3–US3.6 | Step 3.2 |
| T012 | FR-012, US3.7 | Step 3.3 |
| T013 | SC-004, SC-005 | Step 3 (verify) |
| T014 | Edge Case §1 | Refinement R1 |
| T015 | — (regression gate) | Refinement R2 |
| T016 | SC-006 | Refinement R3 |

---

## Notes

- All tasks are e2e test tasks — no production source code changes
- Tests validate existing DOM attributes and behavior, not create new ones
- Selectors documented in [data-model.md](data-model.md), patterns in [quickstart.md](quickstart.md)
- Research decisions in [research.md](research.md) inform test interaction patterns
- About pages (`/om/`) excluded — see [research.md decision #2](research.md) and plan.md Refinement R4
