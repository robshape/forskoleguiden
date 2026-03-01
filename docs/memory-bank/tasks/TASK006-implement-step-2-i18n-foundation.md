# [TASK006] - Implement Step 2 i18n foundation

**Status**: Completed
**Added**: 2026-02-27
**Updated**: 2026-03-01

## Original Request

Fix sequencing by explicitly tracking Step 2 i18n foundation as a prerequisite for Step 3.1-3.3 layout work that depends on `Locale` and translation utilities.

## Thought Process

The layout task (Step 3.1-3.3) references `Locale` from Step 2.3, so Step 2 must be completed first or the layout implementation will be incomplete or forced to use temporary placeholders.

## Implementation Plan

- Implement Step 2.1 Swedish translation file (`src/i18n/sv.json`).
- Implement Step 2.2 placeholder translation files (`src/i18n/en.json`, `src/i18n/ar.json`).
- Implement Step 2.3 `Locale` type plus `getLocaleFromURL()` and `t()` in `src/i18n/utils.ts`.
- Add and pass unit tests for locale detection and key lookup behavior.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                      | Status   | Updated    | Notes                                           |
| --- | ------------------------------------------------ | -------- | ---------- | ----------------------------------------------- |
| 6.1 | Add `sv.json` Phase 1 keys                       | Complete | 2026-03-01 | Step 2.1 completed with test-first key contract |
| 6.2 | Add `en.json` and `ar.json` placeholder files    | Complete | 2026-03-01 | Step 2.2 completed with locale parity coverage  |
| 6.3 | Implement locale helpers in `src/i18n/utils.ts`  | Complete | 2026-03-01 | Step 2.3 complete                               |
| 6.4 | Add/validate unit tests for i18n helper behavior | Complete | 2026-03-01 | Locale path parsing and fallback key handling   |

## Progress Log

### 2026-03-01 (Step 2.3 completion + Phase 3 validation)

- Completed Step 2.3 in `src/i18n/utils.ts` with canonical `Locale` type plus `getLocaleFromURL()` and `t()` helper behavior.
- Validated helper behavior coverage in `tests/unit/i18n-utils.test.ts` and confirmed targeted + full test runs pass.
- Ran required repository gates for this phase and confirmed green outcomes: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Marked TASK006 complete and unblocked TASK001 (Step 3.1-3.3 layout shell).

### 2026-03-01 (Step 2.2 completion)

- Completed Step 2.2 by adding placeholder locale files `src/i18n/en.json` and `src/i18n/ar.json` with Swedish key-structure parity.
- Preserved interpolation placeholders and validated parity with `tests/unit/i18n-locales.test.ts`.
- Ran required repository gates and confirmed green results: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Remaining scope in TASK006: Step 2.3 locale helpers (`Locale`, `getLocaleFromURL()`, `t()`) and subtask 6.4 helper behavior tests.

### 2026-03-01 (follow-up i18n fix)

- Applied approved Step 2.1 i18n follow-up fixes with test-first flow:
  - Extracted shared `getByPath` helper to `tests/unit/helpers/i18n.ts` and reused it in `tests/unit/i18n-sv.test.ts`.
  - Added required-key non-empty string assertions, dedicated summary placeholder checks for `summary.higher|lower|similar`, and operator-type required paths.
  - Replaced `String(selectedCount)` cast usage with typed string handling in compare-tray placeholder test.
  - Added copy assertions for `directory.sort.ranking` (`Rankning`) and `responses.partlyDisagree` (`Instämmer inte delvis`).
- Confirmed pre-fix failure in targeted test due to missing `directory.operatorType.municipal` and old ranking copy.
- Updated `src/i18n/sv.json` with approved copy and `directory.operatorType.{municipal,independent}` translations.
- Verified green outcome for targeted test and full quality gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.

### 2026-03-01 (locale parity cleanup)

- Strengthened Step 2.2 locale parity coverage with recursive key-path checks and shared i18n test helpers.
- Added cleanup note for Step 2.3: replace temporary locale string literals (`'sv' | 'en' | 'ar'` usages in tests/helpers) with canonical `Locale` from `src/i18n/utils.ts` once that type is implemented.

### 2026-02-27

- Created task to track Step 2 explicitly as a dependency before Step 3.1-3.3.
- Recorded dependency link to `Locale` type usage in BaseLayout and related page wiring.

### 2026-03-01

- Completed Step 2.1 by implementing Swedish i18n keys in `src/i18n/sv.json` and finalizing the Step 2.1 contract.
- Used a test-first i18n contract workflow (define key assertions first, then implement translation keys to satisfy the contract).
- Passed repository quality gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Remaining next steps: complete 6.2 placeholder locale files (`en.json`, `ar.json`) and 6.3 locale helpers (`Locale`, `getLocaleFromURL()`, `t()`) with associated helper tests.
