# [TASK006] - Implement Step 2 i18n foundation

**Status**: In Progress
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

**Overall Status**: In Progress - 25%

### Subtasks

| ID  | Description                                      | Status      | Updated    | Notes                                           |
| --- | ------------------------------------------------ | ----------- | ---------- | ----------------------------------------------- |
| 6.1 | Add `sv.json` Phase 1 keys                       | Complete    | 2026-03-01 | Step 2.1 completed with test-first key contract |
| 6.2 | Add `en.json` and `ar.json` placeholder files    | Not Started | 2026-02-27 | Step 2.2                                        |
| 6.3 | Implement locale helpers in `src/i18n/utils.ts`  | Not Started | 2026-02-27 | Step 2.3                                        |
| 6.4 | Add/validate unit tests for i18n helper behavior | Not Started | 2026-02-27 | Locale path parsing and fallback key handling   |

## Progress Log

### 2026-03-01 (follow-up i18n fix)

- Applied approved Step 2.1 i18n follow-up fixes with test-first flow:
  - Extracted shared `getByPath` helper to `tests/unit/helpers/i18n.ts` and reused it in `tests/unit/i18n-sv.test.ts`.
  - Added required-key non-empty string assertions, dedicated summary placeholder checks for `summary.higher|lower|similar`, and operator-type required paths.
  - Replaced `String(selectedCount)` cast usage with typed string handling in compare-tray placeholder test.
  - Added copy assertions for `directory.sort.ranking` (`Rankning`) and `responses.partlyDisagree` (`Instämmer inte delvis`).
- Confirmed pre-fix failure in targeted test due to missing `directory.operatorType.municipal` and old ranking copy.
- Updated `src/i18n/sv.json` with approved copy and `directory.operatorType.{municipal,independent}` translations.
- Verified green outcome for targeted test and full quality gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.

### 2026-02-27

- Created task to track Step 2 explicitly as a dependency before Step 3.1-3.3.
- Recorded dependency link to `Locale` type usage in BaseLayout and related page wiring.

### 2026-03-01

- Completed Step 2.1 by implementing Swedish i18n keys in `src/i18n/sv.json` and finalizing the Step 2.1 contract.
- Used a test-first i18n contract workflow (define key assertions first, then implement translation keys to satisfy the contract).
- Passed repository quality gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Remaining next steps: complete 6.2 placeholder locale files (`en.json`, `ar.json`) and 6.3 locale helpers (`Locale`, `getLocaleFromURL()`, `t()`) with associated helper tests.
