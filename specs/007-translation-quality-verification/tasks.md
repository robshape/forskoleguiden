# Tasks: Translation Quality Verification

**Input**: Design documents from `/specs/007-translation-quality-verification/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests ARE the feature — this is a test-only specification. All tasks produce test code.

**Organization**: Tasks are grouped by user story to enable independent implementation and verification.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — the project is already set up. This phase is intentionally empty.

*(No tasks — existing project, existing test infrastructure, existing helpers.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the shared `extractPlaceholders` helper that User Story 3 depends on

**⚠️ CRITICAL**: US3 (placeholder parity) cannot begin until this phase is complete

- [x] T001 Add `extractPlaceholders(value: string): string[]` helper function to `tests/unit/helpers/i18n.ts` — uses regex `/\{([a-zA-Z0-9_]+)\}/g`, returns sorted unique token names. See [data-model.md § New Helper](data-model.md#new-helper-addition-to-existing-module) and [research.md § R1](research.md#r1-placeholder-extraction-strategy)

**Checkpoint**: Import `extractPlaceholders` and verify `extractPlaceholders('Hello {name}, you have {count} items')` returns `['count', 'name']` and `extractPlaceholders('No placeholders')` returns `[]`

---

## Phase 3: User Story 1 & 2 — Key Parity + Arabic Script Quality (Priority: P1)

**Goal**: Verify every Arabic translation key resolves to a non-empty Arabic string (not a raw key fallback), and that Arabic values contain proper Arabic script characters

**Independent Test**: Run `pnpm test -- tests/unit/i18n-arabic-translation-quality.test.ts`

**Note**: US1 (key parity) is already fully covered by the existing `tests/unit/i18n-locale-key-parity.test.ts` — no new tasks needed for FR-001/FR-002/SC-001. US1 and US2 are combined here because the new test file serves both stories' remaining uncovered requirements.

### Implementation

- [x] T002 [US1/US2] Create `tests/unit/i18n-arabic-translation-quality.test.ts` with two test cases:
  - **Test case 1 — Non-empty resolution (FR-003, SC-002)**: Load Arabic locale via `loadLocaleFromDisk('ar')`. For every leaf key path (via `collectKeyPaths`), call `t(key, 'ar')` from `src/i18n/utils.ts`. Assert each result is a non-empty string and does not equal the raw key path. See [plan.md § Step 3](plan.md#step-3-create-testsuniti18n-arabic-translation-qualitytest-ts)
  - **Test case 2 — Arabic script presence (FR-005, SC-004)**: Load Arabic locale. For every leaf key, read the raw string value via `getByPath`. Skip allowlisted keys (`locale.sv`, `locale.en`). Assert the value matches `/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/`. See [data-model.md § Arabic Script Allowlist](data-model.md#arabic-script-allowlist) and [research.md § R2](research.md#r2-arabic-script-detection-approach), [research.md § R3](research.md#r3-exception-handling-for-latin-content-in-arabic-values)

**Checkpoint**: `pnpm test -- tests/unit/i18n-arabic-translation-quality.test.ts` passes

---

## Phase 4: User Story 3 — Interpolation Placeholder Parity (Priority: P2)

**Goal**: Verify interpolation placeholders (`{count}`, `{name}`, etc.) are identical across all three locales for every key

**Independent Test**: Run `pnpm test -- tests/unit/i18n-placeholder-parity.test.ts`

### Implementation

- [x] T003 [US3] Create `tests/unit/i18n-placeholder-parity.test.ts` — load all three locale files via `loadLocaleFromDisk()`, extract all leaf key paths via `collectKeyPaths()`, for each key call `extractPlaceholders()` (from T001) on each locale's value, assert placeholder token sets are identical across sv, en, and ar. Use a single `it` block that collects all failures (fewer, longer tests convention). See [plan.md § Step 2](plan.md#step-2-create-testsuniti18n-placeholder-paritytest-ts) and [data-model.md § Interpolation Placeholder](data-model.md#interpolation-placeholder)

**Checkpoint**: `pnpm test -- tests/unit/i18n-placeholder-parity.test.ts` passes

---

## Phase 5: User Story 4 — Built Arabic Pages Render Correctly (Priority: P2)

**Goal**: Verify that built Arabic pages contain Arabic text and no raw key path fallbacks

**Independent Test**: Run `pnpm build && pnpm test:post-build`

### Implementation

- [x] T004 [US4] Extend `tests/post-build/static-output-verification.test.ts` with two new test cases:
  - **Test case 1 — Arabic content presence (FR-006, SC-005)**: Read `dist/ar/index.html`, assert it contains at least one Arabic script character (same Unicode regex as T002)
  - **Test case 2 — No raw key fallbacks (FR-006, SC-005)**: Read `dist/ar/index.html`, assert none of these literal dot-path strings appear: `directory.heading`, `compare.heading`, `site.title`, `site.tagline`, `nav.directory`, `compareTray.selectedCount`. See [data-model.md § Post-Build Verification Targets](data-model.md#post-build-verification-targets) and [research.md § R4](research.md#r4-post-build-arabic-page-verification-strategy)

**Checkpoint**: `pnpm build && pnpm test:post-build` passes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Full pipeline validation

- [x] T005 Run `pnpm validate` to confirm all existing tests pass alongside new tests (lint, format, check, test, build, post-build). See [plan.md § Step 5](plan.md#step-5-run-full-quality-gate)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Empty — no work needed
- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS Phase 4 (US3)
- **Phase 3 (US1/US2)**: No dependencies on Foundational — can start immediately, in parallel with Phase 2
- **Phase 4 (US3)**: Depends on Phase 2 (T001 `extractPlaceholders` helper)
- **Phase 5 (US4)**: No dependencies on other phases — can start immediately (only requires a build)
- **Polish (Phase 6)**: Depends on all previous phases being complete

### User Story Dependencies

- **US1/US2 (P1)**: Independent — can start immediately after checkout
- **US3 (P2)**: Depends on T001 (`extractPlaceholders` helper from Phase 2)
- **US4 (P2)**: Independent — can start in parallel with US1/US2/US3

### Parallel Opportunities

- T002 (US1/US2) and T001 (Foundational) can run in parallel — they modify different files
- T004 (US4) can run in parallel with any other task — it modifies a separate file in a separate test directory
- After T001 completes, T003 (US3) can start immediately

---

## Parallel Example: Maximum Parallelism

```text
# Wave 1 — launch all independent tasks:
Task T001: Add extractPlaceholders helper to tests/unit/helpers/i18n.ts
Task T002: Create tests/unit/i18n-arabic-translation-quality.test.ts
Task T004: Extend tests/post-build/static-output-verification.test.ts

# Wave 2 — after T001 completes:
Task T003: Create tests/unit/i18n-placeholder-parity.test.ts

# Wave 3 — after all tasks complete:
Task T005: Run pnpm validate
```

---

## Implementation Strategy

### MVP First (User Story 1/2 Only)

1. Complete T002: Arabic translation quality test
2. **STOP and VALIDATE**: `pnpm test -- tests/unit/i18n-arabic-translation-quality.test.ts`
3. Highest-value verification is live — catches missing/broken Arabic translations

### Incremental Delivery

1. T002 → Arabic quality verified (MVP!)
2. T001 + T003 → Placeholder parity verified
3. T004 → Build output verified (defense-in-depth)
4. T005 → Full pipeline green

### Sequential Execution (Single Developer)

1. T001 → extractPlaceholders helper (small, quick)
2. T002 → Arabic quality test (highest priority, P1)
3. T003 → Placeholder parity test (depends on T001)
4. T004 → Post-build Arabic assertions
5. T005 → Full validate

---

## Notes

- This is a **test-only feature** — no production code changes
- US1 (FR-001/FR-002) is already covered by `i18n-locale-key-parity.test.ts` — no new tasks
- All test files follow BDD-style naming and the "fewer, longer tests" convention
- Shared helpers are in `tests/unit/helpers/i18n.ts` — import via relative path
- Post-build tests require `pnpm build` before running
- Commit after each task or logical group
