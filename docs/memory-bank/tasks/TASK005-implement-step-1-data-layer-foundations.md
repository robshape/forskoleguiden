# [TASK005] - Implement Step 1 data layer foundations

**Status**: In Progress
**Added**: 2026-02-27
**Updated**: 2026-02-27

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

**Overall Status**: In Progress - 40%

### Subtasks

| ID  | Description                                         | Status      | Updated    | Notes                        |
| --- | --------------------------------------------------- | ----------- | ---------- | ---------------------------- |
| 5.1 | Define TypeScript types (`src/lib/types.ts`)        | Complete    | 2026-02-27 | Step 1.1 complete            |
| 5.2 | Add Malmö index seed data (`data/malmo/index.json`) | Complete    | 2026-02-27 | Step 1.2 complete            |
| 5.3 | Add per-preschool survey seed files                 | Not Started | 2026-02-27 | Step 1.3                     |
| 5.4 | Implement data-loading utility (`src/lib/data.ts`)  | Not Started | 2026-02-27 | Step 1.4                     |
| 5.5 | Implement scoring utility (`src/lib/scoring.ts`)    | Not Started | 2026-02-27 | Step 1.5                     |
| 5.6 | Add/validate unit tests for Step 1 acceptance       | Not Started | 2026-02-27 | Full Step 1 coverage pending |

- Note (5.2): `data/malmo/index.json` was created with 5 Malmö 2025 schools and `address: "Malmö"`.

## Progress Log

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
- Added `tests/unit/malmo-index.test.ts` and verified it passes for the Step 1.2 index contract.
- Re-ran quality gates successfully: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Applied review feedback to harden `tests/unit/malmo-index.test.ts`: imported canonical `PreschoolIndex` type, added root assertions for `city` and `year`, improved per-entry diagnostics, and enforced street-level address formatting.
- Replaced city-only address placeholders in `data/malmo/index.json` with realistic street-level Malmö addresses for all five preschools.
- Documented `SurveyQuestion.totalRespondents` rationale in `docs/implementation-plan.md` to align spec and schema.
- Set next implementation focus to Step 1.3 per-preschool survey seed files.
