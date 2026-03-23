# Tasks: Language Switcher

**Input**: Design documents from `/specs/002-language-switcher/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are included. The spec explicitly requires automated i18n parity and accessibility verification (FR-010, FR-011, SC-004, SC-005).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Every task includes exact file paths

---

## Phase 1: Setup (Shared Context)

**Purpose**: Lock inputs and prepare test/implementation entry points.

- [ ] T001 Confirm final requirements and clarifications in `specs/002-language-switcher/spec.md`
- [ ] T002 [P] Confirm implementation decisions and data contracts in `specs/002-language-switcher/research.md` and `specs/002-language-switcher/data-model.md`
- [ ] T003 [P] Scaffold the feature e2e test file with story sections in `tests/e2e/language-switcher-navigation.spec.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure that all user stories depend on.

**CRITICAL**: No user story implementation begins until this phase is complete.

- [ ] T004 Create locale-switch utility scaffold and exported signature in `src/lib/locale-switch.ts`
- [ ] T005 [P] Add failing foundational unit tests for locale replacement and fallback in `tests/unit/language-switcher-url-computation.test.ts`
- [ ] T006 Implement `buildLocaleSwitchUrl` behavior in `src/lib/locale-switch.ts` to satisfy T005
- [ ] T007 Create `LanguageSwitcher` Astro component scaffold in `src/components/astro/LanguageSwitcher.astro`
- [ ] T008 Replace the language placeholder with `LanguageSwitcher` wiring in `src/components/astro/Nav.astro`

**Checkpoint**: Core utility + component scaffold are in place. Story work can proceed.

---

## Phase 3: User Story 1 - Directory Language Switching (Priority: P1) 🎯 MVP

**Goal**: Users can switch language from the directory page and see correct active-state and responsive labels.

**Independent Test**: On `/sv/`, clicking `English` or `العربية` navigates to locale-equivalent directory routes. Active locale is non-clickable and visually distinct. At 375 px: ISO labels. Above 375 px: full labels.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add e2e test for directory locale switching and active-locale non-link behavior in `tests/e2e/language-switcher-navigation.spec.ts`
- [ ] T010 [P] [US1] Add e2e viewport test for 375 px ISO labels and >375 px full labels in `tests/e2e/language-switcher-navigation.spec.ts`

### Implementation for User Story 1

- [ ] T011 [US1] Implement active/inactive locale option rendering in `src/components/astro/LanguageSwitcher.astro`
- [ ] T012 [US1] Implement responsive label spans and decorative flag markup in `src/components/astro/LanguageSwitcher.astro`
- [ ] T013 [US1] Implement URL generation from `Astro.url.pathname`, `getBasePath()`, and `buildLocaleSwitchUrl()` in `src/components/astro/LanguageSwitcher.astro`
- [ ] T014 [US1] Add `locale.sv`, `locale.en`, `locale.ar`, and `nav.languageSwitcherAriaLabel` keys in `src/i18n/sv.json`, `src/i18n/en.json`, and `src/i18n/ar.json`

**Checkpoint**: User Story 1 is independently functional and demoable.

---

## Phase 4: User Story 2 - Equivalent Dynamic Route Switching (Priority: P1)

**Goal**: Switching language on detail/comparison routes preserves equivalent page context.

**Independent Test**: On `/sv/forskola/{id}/`, switching locale keeps the same `{id}` in target locale. On `/ar/jamfor/`, switching to Swedish lands on `/sv/jamfor/`.

### Tests for User Story 2

- [ ] T015 [P] [US2] Add e2e test for detail-page locale switching preserving preschool slug in `tests/e2e/language-switcher-navigation.spec.ts`
- [ ] T016 [P] [US2] Add e2e test for comparison-page locale switching preserving route equivalence in `tests/e2e/language-switcher-navigation.spec.ts`

### Implementation for User Story 2

- [ ] T017 [US2] Extend edge-case unit coverage for nested paths and trailing slashes in `tests/unit/language-switcher-url-computation.test.ts`
- [ ] T018 [US2] Refine path normalization for detail/comparison routes in `src/lib/locale-switch.ts`
- [ ] T019 [US2] Ensure locale links remain plain navigation with no compare-state side effects in `src/components/astro/LanguageSwitcher.astro`

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Accessibility Compliance (Priority: P2)

**Goal**: The switcher is semantically correct for screen readers and passes accessibility checks.

**Independent Test**: Switcher exposes a translated landmark label, correct `aria-current`, correct per-link `lang`, and zero new axe violations.

### Tests for User Story 3

- [ ] T020 [P] [US3] Add e2e assertions for translated switcher landmark label in `tests/e2e/language-switcher-navigation.spec.ts`
- [ ] T021 [P] [US3] Add e2e assertions for `aria-current` and per-link `lang` attributes in `tests/e2e/language-switcher-navigation.spec.ts`
- [ ] T022 [P] [US3] Add axe scans for Swedish, English, and Arabic directory pages in `tests/e2e/language-switcher-navigation.spec.ts`

### Implementation for User Story 3

- [ ] T023 [US3] Implement translated `aria-label` usage via `t('nav.languageSwitcherAriaLabel', locale)` in `src/components/astro/LanguageSwitcher.astro`
- [ ] T024 [US3] Implement `lang` attributes on inactive locale links and `aria-current="page"` on active locale element in `src/components/astro/LanguageSwitcher.astro`
- [ ] T025 [US3] Ensure flag spans are decorative (`aria-hidden="true"`) and not announced in `src/components/astro/LanguageSwitcher.astro`

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: User Story 4 - i18n Locale Key Contract (Priority: P3)

**Goal**: Locale-name keys are structurally consistent and robustly validated across all locale files.

**Independent Test**: Locale-label contract tests and existing key-parity tests pass with no missing keys.

### Tests for User Story 4

- [ ] T026 [P] [US4] Add locale-label contract tests for native-script values in `tests/unit/language-switcher-locale-labels-contract.test.ts`

### Implementation for User Story 4

- [ ] T027 [US4] Remove obsolete placeholder keys from `src/i18n/sv.json`, `src/i18n/en.json`, and `src/i18n/ar.json`
- [ ] T028 [US4] Verify and keep parity assertions green in `tests/unit/i18n-locale-key-parity.test.ts`
- [ ] T029 [US4] Ensure switcher labels are sourced from `locale.*` keys in `src/components/astro/LanguageSwitcher.astro`

**Checkpoint**: User Story 4 is independently functional and testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening and quality-gate validation across all stories.

- [ ] T030 [P] Add regression checks for locale-prefixed link outputs in `tests/e2e/language-switcher-navigation.spec.ts`
- [ ] T031 Run full quality gate (`pnpm validate`) and fix any failures in `src/components/astro/LanguageSwitcher.astro`, `src/lib/locale-switch.ts`, `tests/e2e/language-switcher-navigation.spec.ts`, and `tests/unit/language-switcher-url-computation.test.ts`
- [ ] T032 [P] Update final implementation notes and verification checkpoints in `specs/002-language-switcher/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2; can run after US1 or in parallel once foundation is stable
- **Phase 5 (US3)**: Depends on Phase 3 baseline rendering
- **Phase 6 (US4)**: Depends on Phase 3 key usage being in place
- **Phase 7 (Polish)**: Depends on selected user stories being complete

### User Story Dependencies

- **US1 (P1)**: Starts immediately after foundational phase
- **US2 (P1)**: Starts after foundational phase; independent from US1 except shared utility
- **US3 (P2)**: Depends on US1 rendering and US2 route behavior being present
- **US4 (P3)**: Depends on locale key usage in US1

### Within Each User Story

- Write/extend tests first, observe failure, then implement
- Utility behavior before component wiring
- Component semantics before visual polish
- Story checkpoint must pass before moving to lower priority work

### Parallel Opportunities

- Phase 1 tasks T002 and T003 can run in parallel
- Phase 2 T005 can run in parallel with T004 scaffolding
- US1 tests T009 and T010 can run in parallel
- US2 tests T015 and T016 can run in parallel
- US3 tests T020, T021, and T022 can run in parallel
- US4 test T026 can run in parallel with key cleanup prep

---

## Parallel Example: User Story 1

```text
Task: T009 [US1] Add e2e directory-switch test in tests/e2e/language-switcher-navigation.spec.ts
Task: T010 [US1] Add e2e responsive-label test in tests/e2e/language-switcher-navigation.spec.ts
```

## Parallel Example: User Story 2

```text
Task: T015 [US2] Add detail-route equivalence e2e test in tests/e2e/language-switcher-navigation.spec.ts
Task: T016 [US2] Add comparison-route equivalence e2e test in tests/e2e/language-switcher-navigation.spec.ts
```

## Parallel Example: User Story 3

```text
Task: T020 [US3] Add landmark/aria-label assertions in tests/e2e/language-switcher-navigation.spec.ts
Task: T021 [US3] Add aria-current/lang assertions in tests/e2e/language-switcher-navigation.spec.ts
Task: T022 [US3] Add axe scans in tests/e2e/language-switcher-navigation.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1)
4. Validate US1 independently on `/sv/`, `/en/`, `/ar/`

### Incremental Delivery

1. Deliver US1 (directory switching)
2. Deliver US2 (dynamic route equivalence)
3. Deliver US3 (accessibility hardening)
4. Deliver US4 (i18n contract hardening)
5. Finish with cross-cutting polish and full validation

### Notes

- `[P]` tasks indicate safe parallelization opportunities
- Keep story boundaries strict so each story remains independently testable
- Avoid changing unrelated components beyond listed files
- Use `pnpm` commands only for validation and tests
