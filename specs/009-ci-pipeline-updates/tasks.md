# Tasks: CI Pipeline Updates

**Input**: Design documents from `/specs/009-ci-pipeline-updates/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No test tasks generated — this feature modifies existing tests and CI config; no new test files are created.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 — Multi-locale e2e test coverage in CI (Priority: P1) 🎯 MVP

**Goal**: Confirm the existing Playwright config and quality-gates workflow auto-discover Phase 2 e2e tests without requiring any workflow or config changes.

**Independent Test**: Run `pnpm test:e2e --list` and verify all Phase 2 e2e test files appear in the output. Inspect `playwright.config.ts` and `.github/workflows/quality-gates.yml` to confirm glob-based discovery.

- [x] T001 [US1] Verify `testDir: 'tests/e2e'` with no `testMatch` restriction in `playwright.config.ts` — confirm all `*.spec.ts` files under `tests/e2e/` are auto-discovered ([plan Phase 1 step 1a](plan.md#phase-1-verify-e2e-auto-discovery-no-code-changes); [research.md R1](research.md#r1-do-phase-2-e2e-tests-auto-discover-in-ci))
- [x] T002 [US1] Verify `testMatch` pattern in `playwright.webkit.config.ts` — note WebKit scope is narrow (`comparison-page-mobile-webkit.spec.ts` only). Document whether Phase 2 adds WebKit-specific tests that may need config updates ([plan Phase 1 step 1b](plan.md#phase-1-verify-e2e-auto-discovery-no-code-changes))
- [x] T003 [US1] Verify `.github/workflows/quality-gates.yml` runs `pnpm test:e2e` and `pnpm test:e2e:webkit` — confirm no test-file lists are hardcoded ([plan Phase 1 step 1c](plan.md#phase-1-verify-e2e-auto-discovery-no-code-changes))

**Checkpoint**: Implementer confirms all three files use glob/directory patterns that auto-discover new test files. No code changes produced. Satisfies FR-001, FR-002.

---

## Phase 2: User Story 2 — Page weight budget enforcement for all locales (Priority: P2)

**Goal**: Refactor the post-build page weight budget test from a single-locale hardcoded test to a locale-parameterized test covering Swedish, English, and Arabic directory index pages.

**Independent Test**: Run `pnpm build && pnpm test:post-build`. Confirm page weight budget assertions run for all 3 locales and all pass.

- [x] T004 [US2] Add `const LOCALES = ['sv', 'en', 'ar'] as const` at the top of the config section and remove the hardcoded `SV_INDEX_PATH` constant in `tests/post-build/page-weight-budget.test.ts` ([plan Phase 2 step 2a](plan.md#phase-2-page-weight-budget-parameterization-fr-003-fr-004); [research.md R3](research.md#r3-page-weight-budget-parameterization); [data-model.md → Page Weight Budget Test](data-model.md#page-weight-budget-test-testspost-buildpage-weight-budgettestts))
- [x] T005 [US2] Replace the `describe('/sv/ page-weight budget', ...)` block with `describe.each(LOCALES)('/%s/ page-weight budget', (locale) => { ... })` and construct `INDEX_PATH` dynamically via `join(DIST_ROOT, locale, 'index.html')` in `tests/post-build/page-weight-budget.test.ts` ([plan Phase 2 step 2b](plan.md#phase-2-page-weight-budget-parameterization-fr-003-fr-004); pattern precedent in `tests/post-build/static-output-verification.test.ts`)
- [x] T006 [US2] Update diagnostic messages in `expect()` assertions to include the locale identifier (e.g., `"/${locale}/ page payload is ${kb} KB"`) in `tests/post-build/page-weight-budget.test.ts` ([plan Phase 2 step 2c](plan.md#phase-2-page-weight-budget-parameterization-fr-003-fr-004))
- [x] T007 [US2] Run `pnpm build && pnpm test:post-build` — verify all 3 locale assertions pass ([plan Phase 2 step 2d](plan.md#phase-2-page-weight-budget-parameterization-fr-003-fr-004))

**Checkpoint**: Post-build tests show 3 locale page-weight assertions passing. Satisfies FR-003, FR-004, SC-002.

---

## Phase 3: User Story 3 — Lighthouse accessibility and performance auditing for all locales (Priority: P2)

**Goal**: Add English and Arabic directory page URLs to the Lighthouse CI configuration so all three locales are audited against the same accessibility and performance thresholds.

**Independent Test**: Run `pnpm audit:lighthouse`. Confirm audit collects results for `/sv/`, `/en/`, and `/ar/` and all pass a11y ≥ 0.95, perf ≥ 0.9.

- [x] T008 [US3] Add `"http://localhost:4321/forskoleguiden/en/"` and `"http://localhost:4321/forskoleguiden/ar/"` to the `ci.collect.url` array in `.lighthouserc.json` ([plan Phase 3 step 3a](plan.md#phase-3-lighthouse-ci-multi-locale-audit-fr-005-fr-006); [research.md R2](research.md#r2-lighthouse-ci-multi-url-support); [quickstart.md §2](quickstart.md#2-lighthousercjson--add-locale-urls))
- [x] T009 [US3] Verify `ci.assert.assertions` block in `.lighthouserc.json` — confirm thresholds apply to all URLs equally (no per-URL overrides needed, no changes to this section) ([plan Phase 3 step 3b](plan.md#phase-3-lighthouse-ci-multi-locale-audit-fr-005-fr-006); [research.md R2](research.md#r2-lighthouse-ci-multi-url-support))
- [x] T010 [US3] Run `pnpm audit:lighthouse` — verify all 3 locale pages are audited and pass a11y ≥ 0.95, perf ≥ 0.9 ([plan Phase 3 step 3c](plan.md#phase-3-lighthouse-ci-multi-locale-audit-fr-005-fr-006))

**Checkpoint**: Lighthouse results show 3 URLs audited with all thresholds met. Satisfies FR-005, FR-006, SC-003.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Full validation to confirm no regressions across the entire CI pipeline.

- [x] T011 Run `pnpm validate` — full quality gate: lint, format, check, test, build, post-build, e2e, Lighthouse. All steps must pass with zero errors ([plan Phase 4 step 4a](plan.md#phase-4-full-validation-fr-007); [quickstart.md → Verification](quickstart.md#verification))

**Checkpoint**: `pnpm validate` exits with code 0. Satisfies FR-007, SC-001, SC-004.

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (US1: Verify e2e auto-discovery)
  └─► Phase 2 (US2: Page weight budget)  ──┐
  └─► Phase 3 (US3: Lighthouse config)   ──┤
                                            └─► Phase 4 (Full validation)
```

- **Phase 1 (US1)**: No dependencies — can start immediately. Verification-only, no code changes.
- **Phase 2 (US2)**: Depends on Phase 1 completion. Modifies `tests/post-build/page-weight-budget.test.ts`.
- **Phase 3 (US3)**: Depends on Phase 1 completion. Modifies `.lighthouserc.json`.
- **Phase 2 and Phase 3 are independent** — they modify different files and can be done in either order or in parallel.
- **Phase 4**: Depends on Phase 2 AND Phase 3 completion.

### User Story Dependencies

- **US1 (P1)**: Independent — verification only, no code changes
- **US2 (P2)**: Independent of US3 — modifies `tests/post-build/page-weight-budget.test.ts` only
- **US3 (P2)**: Independent of US2 — modifies `.lighthouserc.json` only

### Parallel Opportunities

- T001, T002, T003 (Phase 1) can all run in parallel — they are read-only checks on different files
- Phase 2 (T004–T007) and Phase 3 (T008–T010) can run in parallel — they modify different files with no dependencies between them
- Within Phase 2: T004, T005, T006 are sequential edits to the same file

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (US1): Verify e2e auto-discovery
2. **STOP and VALIDATE**: Confirm all Phase 2 e2e tests appear in Playwright output
3. Document findings — if configs need changes, create follow-up tasks

### Incremental Delivery

1. Complete Phase 1 → e2e auto-discovery confirmed
2. Complete Phase 2 → page weight budget covers all 3 locales → `pnpm test:post-build` passes
3. Complete Phase 3 → Lighthouse audits all 3 locales → `pnpm audit:lighthouse` passes
4. Complete Phase 4 → full `pnpm validate` passes → ready to merge

### Quick Path (Parallel)

With the parallel opportunity between Phase 2 and Phase 3:

1. Phase 1: Verify auto-discovery (minutes)
2. In parallel:
   - Phase 2: Parameterize page weight test (`page-weight-budget.test.ts`)
   - Phase 3: Add Lighthouse URLs (`.lighthouserc.json`)
3. Phase 4: Run `pnpm validate`

---

## Notes

- This feature produces **no new files** — only modifies 2 existing files
- Phase 1 is verification-only — no code changes, just confirming assumptions from [research.md R1](research.md#r1-do-phase-2-e2e-tests-auto-discover-in-ci)
- Helper functions in `page-weight-budget.test.ts` remain unchanged — they operate on HTML content and the shared `_astro/` directory
- The `LOCALES` constant in the page weight test should align with the existing `LOCALES` in `static-output-verification.test.ts` for consistency
- Lighthouse CI's `numberOfRuns: 1` applies per URL — total audit runs = 3 (one per locale)
