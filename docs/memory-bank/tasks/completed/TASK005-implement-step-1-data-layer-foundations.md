# [TASK005] - Implement Step 1 data layer foundations

**Status**: Completed
**Added**: 2026-02-27
**Updated**: 2026-03-01

## Original Request

Fix sequencing by explicitly tracking Step 1 as a prerequisite before Step 3.1-3.3, then implement the full Step 1 data-layer scope from the implementation plan.

## Thought Process

Step 3.1-3.3 layout work is not the next safe implementation target while foundational data contracts and loaders are still missing. Completing Step 1 first reduces rework and enables deterministic downstream page/data integration.

## Implementation Plan

- Implement Step 1.1 type contracts in `src/lib/types.ts`.
- Implement Step 1.2 and Step 1.3 Malmö seed data (`index.json` + per-preschool survey files).
- Implement Step 1.4 data-loading utilities in `src/lib/data.ts`.
- Implement Step 1.5 scoring utilities in `src/lib/scoring.ts`.
- Add and pass unit tests for all Step 1 acceptance criteria.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                         | Status   | Updated    | Notes                                  |
| --- | --------------------------------------------------- | -------- | ---------- | -------------------------------------- |
| 5.1 | Define TypeScript types (`src/lib/types.ts`)        | Complete | 2026-02-27 | Step 1.1 complete                      |
| 5.2 | Add Malmö index seed data (`data/malmo/index.json`) | Complete | 2026-02-28 | Step 1.2 complete; address fix applied |
| 5.3 | Add per-preschool survey seed files                 | Complete | 2026-02-28 | Step 1.3 complete                      |
| 5.4 | Implement data-loading utility (`src/lib/data.ts`)  | Complete | 2026-03-01 | Step 1.4 complete + review hardening   |
| 5.5 | Implement scoring utility (`src/lib/scoring.ts`)    | Complete | 2026-03-01 | Step 1.5 complete                      |
| 5.6 | Add/validate unit tests for Step 1 acceptance       | Complete | 2026-03-01 | Step 1 acceptance + Phase 3 gates pass |

- Note (5.2): `data/malmo/index.json` now uses varied street + city addresses ending with `, Malmö`.

## Progress Log

### 2026-03-01 (later)

- Completed Step 1.5 scoring utility in `src/lib/scoring.ts`:
  - `computeAgreeShare(question)` returns `completelyAgreePercent + partlyAgreePercent`.
  - `computeOverallScore(survey)` averages agree-share across `Helhetsbedömning` questions and returns one-decimal precision.
  - Returns `null` when `Helhetsbedömning` is missing or present-but-empty.
  - Exports `OVERALL_ASSESSMENT_GROUP` and `byOverallScoreDesc` for shared, non-duplicated downstream usage.
  - Adds non-production warnings for out-of-range/unexpected survey-response percentage inputs during score computation.
- Confirmed scoring behavior with green tests in `tests/unit/scoring-overall-score-utilities.test.ts`.
- Ran required Phase 3 quality gates to green: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Marked TASK005 completed; next focus is Step 2 i18n foundation (`TASK006`).

### 2026-03-01 (earlier)

- Applied follow-up review patch set for Step 1.4:
  - Refactored `getAllPreschoolSurveys()` to read index/year once and load survey files directly (removed N+1 index reads).
  - Added deterministic regression test asserting Malmö index file is read exactly once during `getAllPreschoolSurveys()`.
  - Replaced silent-skip `try/catch` unknown-id assertion pattern with explicit `toThrowError` checks for both id and expected file path.
  - Extracted shared response-shape assertions into `tests/unit/helpers/survey-assertions.ts` and reused in `data-loader-contract.test.ts` and `types.test.ts`.
  - Added `src/lib/data.ts` comments documenting `process.cwd()` root assumption and trusted static JSON cast strategy.

### 2026-03-01

- Confirmed Step 1.4 data-loading utility completion (`src/lib/data.ts`) with passing loader tests in `tests/unit/data-loader-contract.test.ts`.
- Ran required quality gates with green outcomes: `pnpm lint` (pass), `pnpm lint:md` (pass, 0 markdown errors), `pnpm format` (pass, unchanged writes), `pnpm test` (pass; 5 files, 10 tests).
- Kept TASK005 in progress because Step 1.5 scoring utility remains not started.

### 2026-02-28

- Reproduced Step 1.2 address-contract failure in `tests/unit/malmo-directory-index-contract.test.ts` (city-only addresses did not satisfy `/,\s*Malmö$/`).
- Fixed `data/malmo/index.json` addresses to varied, realistic street + city values ending with `, Malmö`.
- Re-ran required quality gates to green: `pnpm lint` (pass), `pnpm lint:md` (pass), `pnpm format` (pass), `pnpm test` (pass).
- Kept scope limited to Step 1.3 Phase 3 revision; Step 1.4/1.5 remains not started.

### 2026-02-27

- Created task to enforce implementation-plan sequencing by prioritizing Step 1 before Step 3.1-3.3.
- Marked TASK005 as in progress and linked it to unblocking downstream layout and comparison work.
- Completed Step 1.1 by creating required type contracts in `src/lib/types.ts`.
- Added and validated the Step 1.1 contract test in `tests/unit/types.test.ts` for top-level and nested response keys.
- Confirmed quality gates pass: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Refined `PreschoolSurvey` contract to include `id` for deterministic joins with index entries.
- Added `totalRespondents` to `SurveyQuestion` and updated `data/template.json` accordingly.
- Expanded Step 1.1 test coverage to include `PreschoolIndex`/`PreschoolIndexEntry` key sets and valid `operatorType` values.
- Implemented Step 1.2 by creating `data/malmo/index.json` using official Malmö 2025 preschool names.
- Added `tests/unit/malmo-directory-index-contract.test.ts` and verified it passes for the Step 1.2 index contract.
- Re-ran quality gates successfully: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Applied review feedback to harden `tests/unit/malmo-directory-index-contract.test.ts`: imported canonical `PreschoolIndex` type, added root assertions for `city` and `year`, improved per-entry diagnostics, and enforced street-level address formatting.
- Replaced city-only address placeholders in `data/malmo/index.json` with realistic street-level Malmö addresses for all five preschools.
- Documented `SurveyQuestion.totalRespondents` rationale in `docs/implementation-plan.md` to align spec and schema.
- Set next implementation focus to Step 1.3 per-preschool survey seed files.
