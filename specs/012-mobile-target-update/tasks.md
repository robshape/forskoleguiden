# Tasks: Mobile Target Update — iPhone 17

**Input**: Design documents from `/specs/012-mobile-target-update/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: No new tests are generated. This feature updates existing test configurations and viewports — test modifications are included as implementation tasks within US5.

**Organization**: Tasks are grouped by user story. US1 + US2 + US3 are combined into a single foundational phase because they share the same visual audit work and cannot be verified independently of each other.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US5)
- Include exact file paths and line numbers in descriptions

---

## Phase 1: Foundational — Visual Audit & CSS Fixes (US1 + US2 + US3) 🎯 MVP

**Purpose**: Build the site and visually verify all page types at the new primary viewport (393×852) and across the supported range (320–430 px). Fix any layout or spacing issues. This MUST complete before test expectations are updated — otherwise tests would encode unverified behavior.

**References**: [plan.md Phase 1](plan.md#phase-1-visual-audit--css-fixes-user-story-1--p1), [research.md R5](research.md#r5-visual-audit-scope), [research.md R6](research.md#r6-existing-responsive-css-assessment)

**⚠️ CRITICAL**: No test configuration changes (Phase 2) can begin until this phase is complete.

- [x] T001 Build and preview site — run `pnpm build && pnpm preview`, open browser DevTools at 393×852 viewport
- [x] T002 [P] Verify directory page (`/forskoleguiden/sv/`) at 393×852 — no horizontal overflow, card spacing, sort toggle and compare buttons tappable, touch targets ≥ 44×44 px
- [x] T003 [P] Verify detail page (`/forskoleguiden/sv/forskola/<any>/`) at 393×852 — bar charts render without clipping, question cards and queue link visible
- [x] T004 [P] Verify comparison page (`/forskoleguiden/sv/jamfor/`) at 393×852 with 3+ selected — cards stack vertically, share button reachable, no horizontal scrolling
- [x] T005 Verify all page types at 430×932 (iPhone 17 Pro Max — upper bound) and 375×812 (iPhone 13 mini — backward compat) — no excessive whitespace at 430 px, no regressions at 375 px
- [x] T006 Fix any layout or spacing issues found in `src/components/astro/` or `src/components/preact/` (expected: zero or minor spacing tweaks per [research.md R6](research.md#r6-existing-responsive-css-assessment))

**Checkpoint**: Visual audit complete. All page types render correctly at 393×852, 430×932, and 375×812. Any CSS issues are fixed. Phase 2 can begin.

---

## Phase 2: US5 — Automated Test Updates (Priority: P1)

**Goal**: All Playwright e2e tests and the WebKit regression suite use 393×852 (iPhone 17) as the primary mobile viewport instead of 375×812 (iPhone 13 mini).

**Independent Test**: Run `pnpm test:e2e` and `pnpm test:e2e:webkit` — all tests pass with updated viewport configurations.

**References**: [plan.md Phases 2–4](plan.md#phase-2-test-configuration-user-story-5--p1), [research.md R1](research.md#r1-playwright-device-preset-for-iphone-17), [research.md R2](research.md#r2-viewport-dimensions--screen-vs-toolbar-adjusted), [research.md R3](research.md#r3-language-switcher-375-px-breakpoint)

### WebKit Configuration (Plan Phase 2)

- [x] T007 [US5] Update device preset `devices['iPhone 13 mini']` → `devices['iPhone 15']` in `playwright.webkit.config.ts` (line 17) — [research.md R1](research.md#r1-playwright-device-preset-for-iphone-17)
- [x] T008 [US5] Update project name `'webkit-iphone13mini'` → `'webkit-iphone15'` and update comments to reference iPhone 17 / 393×852 in `playwright.webkit.config.ts` (lines 4, 6, 16)

### E2e Viewport Updates (Plan Phase 3)

- [x] T009 [US5] Update viewport `375, 812` → `393, 852` in `tests/e2e/responsive-context-adaptation.spec.ts` (line 23) — primary target test only; keep 320 px narrow-viewport tests unchanged
- [x] T010 [P] [US5] Update viewport `375, 812` → `393, 852` in `tests/e2e/hardening-touch-target-and-heading-shell.spec.ts` (line 35)
- [x] T011 [P] [US5] Update viewport `375, 812` → `393, 852` in `tests/e2e/typography-system-normalization.spec.ts` (line 113)
- [x] T012 [P] [US5] Update viewport `375, 812` → `393, 852` and test name "375×812" → "393×852" in `tests/e2e/compare-tray-interaction.spec.ts` (lines 169, 172)
- [x] T013 [P] [US5] Update viewport `375, 812` → `393, 852` and test name "375×812" → "393×852" in `tests/e2e/comparison-page-route-shell.spec.ts` (lines 392, 395)
- [x] T014 [US5] Update comments only — "iPhone 13 mini" → "iPhone 17 (via iPhone 15 preset)", "375×812" → "393×852" in `tests/e2e/comparison-page-mobile-webkit.spec.ts` (lines 5, 8, 16, 21)
- [x] T015 [US5] **NO CHANGE** to `tests/e2e/language-switcher-navigation.spec.ts` — tests 375 px narrow-viewport breakpoint behavior, not primary target ([research.md R3](research.md#r3-language-switcher-375-px-breakpoint))
- [x] T016 [US5] Run `pnpm test:e2e` — verify all updated tests pass at new viewport ([spec SC-002](spec.md#success-criteria))

### ~~Visual Regression Baselines (Plan Phase 4)~~ _Removed_

_Visual regression tests were deleted from the project. Tasks T017–T018 are no longer applicable._
- [x] T019 [US5] Run `pnpm test:e2e:webkit` — verify WebKit regression suite passes ([spec SC-003](spec.md#success-criteria))

**Checkpoint**: All e2e tests pass at 393×852. WebKit suite green. US5 is complete.

---

## Phase 3: US4 — Documentation & Design Artifacts (Priority: P2)

**Goal**: All project documentation references iPhone 17 (393×852) as the primary mobile target. iPhone 13 mini appears only as the lower bound of the supported range. SVG mockups use the new canvas dimensions. Historical spec files are updated.

**Independent Test**: Search the codebase for "iPhone 13 mini" — all matches occur in "supported range" / "lower bound" context only, never as "primary target."

**References**: [plan.md Phases 5–6](plan.md#phase-5-documentation-updates-user-story-4--p2), [research.md R4](research.md#r4-svg-mockup-updates--internal-coordinates)

### Project Documentation (Plan Phase 5)

- [x] T020 [US4] Update `docs/prd.md` — replace iPhone 13 mini as primary target with iPhone 17 (393×852); add "responsive down to iPhone 13 mini (375 px)" where appropriate (lines 160, 198, 328)
- [x] T021 [P] [US4] Update `docs/implementation-plan-phase-1.md` — replace "375px / 375×812 / iPhone 13 mini" context with iPhone 17 references (lines 558, 569, 573)
- [x] T022 [P] [US4] Update `.github/copilot-instructions.md` — line 131: "WebKit/iPhone 13 mini" → "WebKit/iPhone 17 (via iPhone 15 preset)"; line 162: "iPhone 13 mini viewport" → "iPhone 17 viewport (393×852), responsive range 320–430 px"
- [x] T023 [US4] Update `.impeccable.md` — add "iPhone 17 (393 px) is the primary target" to the phone portrait range description (optional — currently uses generic "320-430px")

### SVG Mockups (Plan Phase 6, Steps 6a–6d)

- [x] T024 [US4] Update `viewBox="0 0 375 812"` → `viewBox="0 0 393 852"` and `width`/`height` attributes in `docs/mockups/homepage.svg` — [research.md R4](research.md#r4-svg-mockup-updates--internal-coordinates)
- [x] T025 [P] [US4] Update viewBox and dimensions in `docs/mockups/comparison-view.svg`
- [x] T026 [P] [US4] Update viewBox and dimensions in `docs/mockups/preschool-details.svg`
- [x] T027 [P] [US4] Update viewBox and dimensions in `docs/mockups/shortlist.svg`

### Historical Spec Files (Plan Phase 6, Steps 6e–6n)

- [x] T028 [US4] Update "iPhone 13 mini" → "iPhone 17 (393 px)" in `specs/001-multi-locale-routes/plan.md` (line 16)
- [x] T029 [P] [US4] Update primary target in `specs/002-language-switcher/plan.md` (line 16); update device context in `specs/002-language-switcher/research.md` (lines 54, 68, 72) — preserve 375 px as narrow-viewport threshold per [research.md R3](research.md#r3-language-switcher-375-px-breakpoint); update `specs/002-language-switcher/quickstart.md` (lines 175, 189, 190), `specs/002-language-switcher/tasks.md` (lines 48, 53), `specs/002-language-switcher/spec.md` (line 91)
- [x] T030 [P] [US4] Update "iPhone 13 mini" → "iPhone 17 (393 px)" in `specs/003-arabic-rtl-layout/plan.md` (line 16)
- [x] T031 [P] [US4] Update viewport reference and device name in `specs/004-preschool-queue-links/plan.md` (line 21) and `specs/004-preschool-queue-links/tasks.md` (line 119)
- [x] T032 [P] [US4] Update "iPhone 13 mini" → "iPhone 17 (393 px)" in `specs/006-share-ui/plan.md` (line 16)

**Checkpoint**: Zero "iPhone 13 mini" as "primary target" in documentation. All SVG mockups use 393×852 canvas. All historical specs updated. US4 is complete.

---

## Phase 4: Polish — Full Validation

**Purpose**: End-to-end quality gate. Confirms no regressions across the entire project.

**References**: [plan.md Phase 7](plan.md#phase-7-full-validation), [quickstart.md §8](quickstart.md)

- [x] T033 Run `pnpm validate` — all quality gates pass (lint, lint:md, format, check, test, build, e2e, Lighthouse) ([spec SC-006](spec.md#success-criteria), [SC-007](spec.md#success-criteria))
- [x] T034 Run `pnpm test:e2e:webkit` — WebKit regression passes ([spec SC-003](spec.md#success-criteria))
- [x] T035 Grep codebase for "iPhone 13 mini" — verify zero references as "primary target" remaining; only "supported range" / "lower bound" context allowed ([spec SC-004](spec.md#success-criteria))

**Checkpoint**: All quality gates green. Feature complete.

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Visual Audit)     ──► Phase 2 (US5 — Test Updates)  ──► Phase 4 (Validation)
                             ──► Phase 3 (US4 — Documentation) ──►
```

- **Phase 1 (Foundational)**: No dependencies — start immediately. BLOCKS Phases 2 and 3.
- **Phase 2 (US5)**: Depends on Phase 1 completion (must audit before changing test expectations).
- **Phase 3 (US4)**: Depends on Phase 1 completion (must know if CSS changes were needed before documenting). Can run **in parallel with Phase 2** since docs and test configs are independent files.
- **Phase 4 (Polish)**: Depends on both Phase 2 and Phase 3 completion.

### User Story Dependencies

- **US1 + US2 + US3** (Phase 1): Can start immediately — no dependencies on other stories. Blocking prerequisite for US5.
- **US5** (Phase 2): Depends on visual audit (Phase 1). Independent of US4.
- **US4** (Phase 3): Depends on visual audit (Phase 1). Independent of US5. Can run in parallel with US5.

### Within Phase 2 (US5): Internal Ordering

```text
T007–T008 (webkit config) → T009–T014 (viewport updates) → T016 (verify e2e)
                                                          → T017–T018 (baselines) → T019 (verify webkit)
```

- T007–T008 must complete before T009–T014 (test config must be correct before running updated tests)
- T010–T013 are marked [P] — different files, can run in parallel
- T016 (e2e verify) depends on T009–T014
- T017–T018 (baselines) depend on T009–T014 (viewports must be set before generating screenshots)
- T019 (webkit verify) depends on T017–T018

### Parallel Opportunities

**Within Phase 1**: T002–T004 can run in parallel (different pages)
**Within Phase 2**: T010–T013 can run in parallel (different test files)
**Within Phase 3**: T021–T022 in parallel, T025–T027 in parallel, T029–T032 in parallel
**Across Phases**: Phase 2 and Phase 3 can run in parallel after Phase 1 completes

---

## Parallel Example: Phase 2 (US5) — E2e Viewport Updates

```text
# Sequential: webkit config first
T007: Update device preset in playwright.webkit.config.ts
T008: Update project name/comments in playwright.webkit.config.ts

# Parallel batch: viewport updates in independent test files
T010: Update viewport in hardening-touch-target-and-heading-shell.spec.ts
T011: Update viewport in typography-system-normalization.spec.ts
T012: Update viewport + test name in compare-tray-interaction.spec.ts
T013: Update viewport + test name in comparison-page-route-shell.spec.ts

# Sequential: verify, then baselines
T016: Run pnpm test:e2e
T017: Delete old baselines
T018: Regenerate baselines
T019: Run pnpm test:e2e:webkit
```

## Parallel Example: Phase 3 (US4) — Documentation Updates

```text
# Parallel batch: project docs
T020: Update docs/prd.md
T021: Update docs/implementation-plan-phase-1.md
T022: Update .github/copilot-instructions.md

# Parallel batch: SVG mockups
T024: Update docs/mockups/homepage.svg
T025: Update docs/mockups/comparison-view.svg
T026: Update docs/mockups/preschool-details.svg
T027: Update docs/mockups/shortlist.svg

# Parallel batch: historical specs
T028: Update specs/001/plan.md
T029: Update specs/002/ (5 files)
T030: Update specs/003/plan.md
T031: Update specs/004/ (2 files)
T032: Update specs/006/plan.md
```

---

## Implementation Strategy

### MVP First (Phase 1 Only)

1. Complete Phase 1: Visual Audit & CSS Fixes
2. **STOP and VALIDATE**: Site renders correctly at 393×852, 430×932, and 375×812
3. This proves the new primary viewport works — low risk, high confidence

### Incremental Delivery

1. Phase 1 → Visual audit confirms no layout issues → **Site verified at new viewport**
2. Phase 2 (US5) → Tests encode new viewport → **Automated verification in place**
3. Phase 3 (US4) → Docs and artifacts updated → **Full project consistency**
4. Phase 4 → `pnpm validate` green → **Feature complete, ready to merge**

### Parallel Team Strategy

With two developers after Phase 1:

- Developer A: Phase 2 (US5 — test config, viewport updates, baselines)
- Developer B: Phase 3 (US4 — docs, mockups, historical specs)
- Both complete → Phase 4 validation together

---

## Notes

- T015 is a **NO CHANGE** marker — included for traceability to [spec FR-010](spec.md#functional-requirements) and [research.md R3](research.md#r3-language-switcher-375-px-breakpoint). It documents an intentional omission, not a task to execute.
- T006 will likely produce zero changes (see [research.md R6](research.md#r6-existing-responsive-css-assessment)). The 18 px width increase stays within the same Tailwind breakpoint range.
- T023 (.impeccable.md update) is marked optional in [spec FR-007](spec.md#functional-requirements) — the file currently uses generic "320-430px" without naming iPhone 13 mini.
- T029 covers 5 files in `specs/002-language-switcher/` as a single task because they share the same context update (375 px threshold preservation). See [plan.md Phase 6 steps 6f–6j](plan.md#phase-6-svg-mockups--historical-specs-user-story-4--p2) for per-file line numbers.
- Commit after each logical task group, not after every individual task.
