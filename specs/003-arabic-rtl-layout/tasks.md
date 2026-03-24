# Tasks: Arabic RTL Layout

**Input**: Design documents from `/specs/003-arabic-rtl-layout/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are included. The spec explicitly requires Arabic accessibility verification, RTL geometry/interaction coverage, and Swedish/English regression safety (SC-002, SC-003, SC-004, SC-005).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Context)

**Purpose**: Lock the execution order and create the test entry points before touching shared components.

- [ ] T001 Confirm clarified scope in `specs/003-arabic-rtl-layout/spec.md` — Arabic keeps Western numerals, breadcrumb cue is mirrored, and comparison remains stacked _(spec.md Clarifications; data-model.md Invariants 2–4)_
- [ ] T002 [P] Confirm implementation strategy in `specs/003-arabic-rtl-layout/research.md` — logical utilities first, `rtl:` only for meaningful reversal, contract-based verification _(research.md Decisions 1, 2, 4, 5)_
- [ ] T003 [P] Confirm the affected implementation surface in `specs/003-arabic-rtl-layout/plan.md` and `specs/003-arabic-rtl-layout/quickstart.md` — use only the listed shared components, no Arabic-only forks _(plan.md Project Structure; quickstart.md Key Files)_
- [ ] T004 [P] Scaffold `tests/e2e/arabic-rtl-layout.spec.ts` with describe blocks for shell, directory, detail page, comparison, and LTR regression coverage _(quickstart.md Implementation Step 5; research.md Decision 5)_

**Checkpoint**: Execution rules are locked and the dedicated RTL test file exists.

---

## Phase 2: Foundational Verification (Blocking Prerequisites)

**Purpose**: Establish shared Arabic test helpers and baseline assertions before editing the shared UI.

**CRITICAL**: No story implementation begins until this phase is complete.

- [ ] T005 Create Arabic route helpers/constants in `tests/e2e/helpers.ts` for directory, detail, comparison, and about pages _(plan.md Project Structure tests section; quickstart.md Key Files)_
- [ ] T006 [P] Add baseline Arabic shell/detail/comparison axe coverage in `tests/e2e/accessibility-axe-core.spec.ts` that currently fails or is pending until RTL fixes land _(quickstart.md Implementation Step 5; spec.md SC-004)_
- [ ] T007 [P] Add baseline Arabic geometry or ordering assertions in `tests/e2e/responsive-context-adaptation.spec.ts` for narrow-screen overflow and action layout expectations _(research.md Decision 5; quickstart.md Verification Checklist)_

**Checkpoint**: Shared Arabic verification scaffolding exists and the implementation work has concrete failure targets.

---

## Phase 3: User Story 1 - Arabic Shell Feels Native (Priority: P1) 🎯 MVP

**Goal**: Arabic pages read naturally right-to-left at the shell level without regressing Swedish or English.

**Independent Test**: On Arabic directory and about pages, the nav, header grouping, content shell, and footer read naturally RTL and remain accessible. Swedish and English shell behavior stays unchanged. _(spec.md US1 acceptance scenarios 1–3; spec.md US5 acceptance scenario 3)_

### Tests for User Story 1

- [ ] T008 [P] [US1] Add shell-focused RTL assertions to `tests/e2e/arabic-rtl-layout.spec.ts` for Arabic nav grouping, content alignment, and footer readability on mobile/desktop _(quickstart.md Step-to-Detail Traceability Step 1; research.md Decision 1)_
- [ ] T009 [P] [US1] Add shell regression assertions for Swedish/English in `tests/e2e/arabic-rtl-layout.spec.ts` or existing shell coverage so RTL changes cannot leak into LTR locales _(spec.md US5; plan.md Risk Register “RTL fixes leak into LTR locales”)_

### Implementation for User Story 1

- [ ] T010 [US1] Audit and update `src/layouts/BaseLayout.astro` for any remaining shell-level physical direction assumptions under `dir="rtl"` _(quickstart.md Implementation Step 1; research.md Decision 1)_
- [ ] T011 [US1] Update `src/components/astro/Nav.astro` to mirror header grouping and spacing with logical properties or scoped RTL variants _(quickstart.md Key Files; data-model.md Component Behavior Matrix “Global shell”)_
- [ ] T012 [US1] Verify and adjust `src/components/astro/Footer.astro` only if needed so Arabic attribution still reads naturally while Swedish/English remain unchanged _(plan.md Open Implementation Notes; quickstart.md Verification Checklist)_
- [ ] T013 [US1] Confirm page-level shell inheritance in `src/components/astro/pages/AboutPage.astro` and `src/components/astro/pages/ComparisonPage.astro`, making only minimal wrapper changes if the shell does not inherit cleanly _(plan.md Project Structure; quickstart.md Implementation Step 1)_

**Checkpoint**: User Story 1 is independently functional and demoable.

---

## Phase 4: User Story 2 - Arabic Directory Interactions Feel Native (Priority: P1)

**Goal**: Arabic directory cards, sort controls, and compare buttons feel intentionally adapted rather than merely mirrored text.

**Independent Test**: On `/ar/`, cards read naturally, sort controls remain usable, compare-button states are clear, and no long Arabic content collides with actions or score blocks. _(spec.md US2 acceptance scenarios 1–3; spec.md Edge Cases 1–2)_

### Tests for User Story 2

- [ ] T014 [P] [US2] Add Arabic directory card alignment and compare-button state assertions in `tests/e2e/arabic-rtl-layout.spec.ts` _(quickstart.md Step-to-Detail Traceability Step 2; data-model.md Component Behavior Matrix “Directory card”, “Compare button”)_
- [ ] T015 [P] [US2] Add Arabic sort-control ordering or alignment assertions in `tests/e2e/arabic-rtl-layout.spec.ts` and/or `tests/e2e/responsive-context-adaptation.spec.ts` _(research.md Decision 5; spec.md SC-002)_

### Implementation for User Story 2

- [ ] T016 [US2] Update `src/components/astro/pages/DirectoryPage.astro` so the Arabic heading and sort-toolbar relationship remains readable across mobile and desktop _(quickstart.md Implementation Step 2; plan.md Project Structure)_
- [ ] T017 [US2] Update `src/components/astro/PreschoolCard.astro` to use RTL-safe alignment for metadata, score block, and action area while preserving current content and ranking behavior _(data-model.md Component Behavior Matrix “Directory card”; research.md Decision 1)_
- [ ] T018 [US2] Update `src/components/preact/SortToggle.tsx` so Arabic sort controls remain visually sensible without changing sort semantics _(data-model.md Component Behavior Matrix “Sort control”; spec.md FR-003, FR-004)_
- [ ] T019 [US2] Update `src/components/preact/CompareButton.tsx` so icon and label composition stays balanced in RTL and selected-state semantics remain unchanged _(data-model.md Component Behavior Matrix “Compare button”; spec.md FR-004)_

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Arabic Detail Pages Preserve Direction and Clarity (Priority: P1)

**Goal**: Arabic detail pages have a mirrored back cue, readable metadata, and RTL-friendly question-card layout while keeping Western numerals.

**Independent Test**: On an Arabic detail page, the back cue points the correct way, metadata reads naturally, chart/footer/value content stays balanced, and displayed numbers remain Western numerals. _(spec.md US3 acceptance scenarios 1–3; spec.md FR-012, FR-013)_

### Tests for User Story 3

- [ ] T020 [P] [US3] Add breadcrumb cue orientation assertions in `tests/e2e/arabic-rtl-layout.spec.ts`, verifying the mirrored direction via computed orientation rather than screenshots _(research.md Decision 4; plan.md Open Implementation Notes)_
- [ ] T021 [P] [US3] Add Arabic detail-page metadata, question-card, and numeral assertions in `tests/e2e/arabic-rtl-layout.spec.ts` _(quickstart.md Step-to-Detail Traceability Step 3; data-model.md Invariants 2 and 4)_

### Implementation for User Story 3

- [ ] T022 [US3] Update `src/components/astro/pages/DetailPage.astro` for RTL-safe metadata row, compare action placement, and section alignment _(quickstart.md Implementation Step 3; data-model.md Component Behavior Matrix “Detail question card”)_
- [ ] T023 [US3] Update `src/components/preact/BreadcrumbLink.tsx` to mirror the existing directional cue in Arabic while preserving link targets and labels _(research.md Decision 4; spec.md FR-013)_
- [ ] T024 [US3] Update `src/components/astro/QuestionCard.astro` so question text, chart footer, and supporting values align correctly in Arabic without changing the rendered numeric format _(plan.md Open Implementation Notes; spec.md FR-006, FR-012)_
- [ ] T025 [US3] Review `src/components/astro/Breadcrumb.astro` only if wrapper-level RTL handling is needed after `BreadcrumbLink.tsx` changes _(plan.md Project Structure; keep minimal if no change is required)_

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: User Story 4 - Arabic Comparison Remains Readable and Stacked (Priority: P1)

**Goal**: Arabic comparison remains the current stacked experience, but with RTL-aligned callouts, rows, summary content, and tray actions.

**Independent Test**: On `/ar/jamfor/` with selected preschools, the selected-count area, stacked comparison rows, summary, and compare tray all read naturally in Arabic without unintended horizontal overflow. _(spec.md US4 acceptance scenarios 1–3; spec.md SC-003)_

### Tests for User Story 4

- [ ] T026 [P] [US4] Add Arabic comparison alignment and stacked-layout assertions in `tests/e2e/arabic-rtl-layout.spec.ts` _(quickstart.md Step-to-Detail Traceability Step 4; research.md Decision 2)_
- [ ] T027 [P] [US4] Extend narrow-screen Arabic overflow or tray-layout assertions in `tests/e2e/responsive-context-adaptation.spec.ts` _(spec.md Edge Cases 3–4; research.md Decision 5)_

### Implementation for User Story 4

- [ ] T028 [US4] Update `src/components/preact/ComparisonView.tsx` for RTL-safe selected-count callout, including replacing the physical left-border treatment with a logical or scoped mirrored alternative _(plan.md Open Implementation Notes; spec.md FR-007, FR-008)_
- [ ] T029 [US4] Update `src/components/preact/ComparisonCard.tsx` so row content, removal control, and score column align naturally in Arabic without redesigning the stacked layout _(research.md Decision 2; plan.md Open Implementation Notes)_
- [ ] T030 [US4] Update `src/components/preact/ComparisonSummary.tsx` so summary heading and list content read naturally in RTL _(data-model.md Component Behavior Matrix “Comparison stack”; spec.md US4 acceptance scenario 2)_
- [ ] T031 [US4] Update `src/components/preact/CompareTray.tsx` so tray copy and action grouping read correctly in Arabic on narrow and wider viewports _(data-model.md Component Behavior Matrix “Compare tray”; spec.md US4 acceptance scenario 3)_
- [ ] T032 [US4] Review `src/components/astro/pages/ComparisonPage.astro` and make only minimal page-level shell/heading adjustments needed to support the updated Arabic comparison flow _(quickstart.md Key Files; keep stacked layout invariant intact)_

**Checkpoint**: User Story 4 is independently functional and testable.

---

## Phase 7: User Story 5 - Swedish and English Remain Unchanged (Priority: P2)

**Goal**: Shared-component RTL work does not regress LTR behavior on Swedish and English pages.

**Independent Test**: Existing Swedish and English shell, directory, detail, and comparison flows continue to pass after Arabic RTL work lands. _(spec.md US5 acceptance scenarios 1–3; spec.md SC-005)_

### Tests for User Story 5

- [ ] T033 [P] [US5] Add or refine explicit LTR regression checks in `tests/e2e/arabic-rtl-layout.spec.ts` or existing RTL test sections for Swedish and English shell/directory/detail/comparison behavior _(plan.md Risk Register; quickstart.md Verification Checklist)_

### Verification for User Story 5

- [ ] T034 [US5] Re-run existing Swedish/English e2e coverage and fix any shared-component regressions in `src/components/astro/*.astro`, `src/components/preact/*.tsx`, and `src/layouts/BaseLayout.astro` as needed _(spec.md FR-010; quickstart.md Verification Checklist)_

**Checkpoint**: User Story 5 is independently verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finish Arabic a11y coverage, contract-based verification, and full quality-gate validation.

- [ ] T035 [P] Expand `tests/e2e/accessibility-axe-core.spec.ts` so Arabic directory, detail, and seeded comparison pages all have explicit zero-violation coverage if not already fully covered by story tasks _(quickstart.md Implementation Step 5; spec.md SC-004)_
- [ ] T036 [P] Finalize `tests/e2e/arabic-rtl-layout.spec.ts` with long-text, mixed-script, and interaction coverage tied to the spec edge cases _(spec.md Edge Cases; research.md Decision 5)_
- [ ] T037 Run full quality gate with `pnpm validate` and fix any failures in `src/layouts/BaseLayout.astro`, `src/components/astro/**/*.astro`, `src/components/preact/**/*.tsx`, and `tests/e2e/*.spec.ts` _(quickstart.md Implementation Step 6)_
- [ ] T038 [P] Update final implementation notes in `specs/003-arabic-rtl-layout/quickstart.md` if the execution revealed any corrections to file ownership, verification, or sequencing _(optional but recommended documentation hardening)_

**Checkpoint**: Feature is complete and validated.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational Verification)**: Depends on Phase 1; blocks all story implementation
- **Phase 3 (US1 Shell)**: Depends on Phase 2
- **Phase 4 (US2 Directory)**: Depends on Phase 3 shell baseline
- **Phase 5 (US3 Detail)**: Depends on Phase 3 shell baseline and can proceed after directory or in parallel once shared shell changes are stable
- **Phase 6 (US4 Comparison)**: Depends on Phase 3 shell baseline and should follow detail/directory updates because it reuses several shared alignment decisions
- **Phase 7 (US5 LTR Regression)**: Depends on user story implementation phases
- **Phase 8 (Polish)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1)**: Starts after foundational verification; establishes the shared RTL baseline
- **US2 (P1)**: Depends on US1 shell work
- **US3 (P1)**: Depends on US1 shell work
- **US4 (P1)**: Depends on US1 shell work and should follow once directory/detail alignment patterns are established
- **US5 (P2)**: Depends on US1–US4 implementation being in place

### Within Each User Story

- Add or extend tests first, then implement to satisfy them
- Prefer changes to shared layout primitives before component-local overrides
- Preserve invariants before polish: Western numerals, stacked comparison layout, shared-component architecture
- Story checkpoint should pass before moving to the next story

### Parallel Opportunities

- T002, T003, and T004 can run in parallel during setup
- T006 and T007 can run in parallel once Arabic helpers exist
- Within each user story, test-authoring tasks marked `[P]` can run in parallel
- US2 and US3 can proceed in parallel after US1 if shell decisions are stable

---

## Parallel Example: User Story 2

```text
Task: T014 [US2] Add Arabic directory card and compare-button assertions in tests/e2e/arabic-rtl-layout.spec.ts
Task: T015 [US2] Add Arabic sort-control assertions in tests/e2e/arabic-rtl-layout.spec.ts or tests/e2e/responsive-context-adaptation.spec.ts
```

## Parallel Example: User Story 3

```text
Task: T020 [US3] Add breadcrumb orientation assertions in tests/e2e/arabic-rtl-layout.spec.ts
Task: T021 [US3] Add Arabic detail metadata, question-card, and numeral assertions in tests/e2e/arabic-rtl-layout.spec.ts
```

## Parallel Example: User Story 4

```text
Task: T026 [US4] Add Arabic comparison alignment assertions in tests/e2e/arabic-rtl-layout.spec.ts
Task: T027 [US4] Extend Arabic mobile overflow or tray-layout assertions in tests/e2e/responsive-context-adaptation.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational Verification)
3. Complete Phase 3 (US1 Shell)
4. Validate Arabic directory/about shell behavior and confirm no LTR regression

### Incremental Delivery

1. Deliver US1 shell baseline
2. Deliver US2 directory interactions
3. Deliver US3 detail-page directionality
4. Deliver US4 comparison alignment
5. Verify US5 LTR regression safety
6. Finish with cross-cutting accessibility and full validation

### Key References

| Task area                  | Quickstart step | Research decision | Data-model anchor                                                            | Spec requirements              |
| -------------------------- | --------------- | ----------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| Shell baseline             | Step 1          | D-1               | Component Behavior Matrix: Global shell                                      | FR-001, FR-002                 |
| Directory adaptation       | Step 2          | D-1               | Component Behavior Matrix: Directory card, Sort control, Compare button      | FR-003, FR-004                 |
| Detail-page directionality | Step 3          | D-4               | Invariants 2 and 4                                                           | FR-005, FR-006, FR-012, FR-013 |
| Comparison adaptation      | Step 4          | D-2               | DirectionContext + Component Behavior Matrix: Comparison stack, Compare tray | FR-007, FR-008, FR-012         |
| Verification strategy      | Step 5          | D-5               | Invariants 1–5                                                               | SC-002, SC-003, SC-004, SC-005 |

---

## Notes

- `[P]` tasks indicate safe parallelization opportunities
- Keep the comparison experience stacked throughout implementation
- Do not introduce numeral-conversion logic; Western numerals are a feature invariant
- Prefer geometry and DOM-contract assertions over screenshot-only checks
- Use `pnpm validate` as the final gate before considering the feature complete
