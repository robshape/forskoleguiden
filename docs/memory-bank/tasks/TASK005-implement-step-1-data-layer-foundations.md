# [TASK005] - Implement Step 1 data layer foundations

**Status**: In Progress
**Added**: 2026-02-27
**Updated**: 2026-02-27

## Original Request

Fix sequencing by explicitly tracking Step 1 as a prerequisite before Step 3.1-3.3, then implement the full Step 1 data-layer scope from the implementation plan.

## Thought Process

Step 3.1-3.3 layout work is not the next safe implementation target while foundational data contracts and loaders are still missing. Completing Step 1 first reduces rework and enables deterministic downstream page/data integration.

## Implementation Plan

- Implement Step 1.1 interfaces in `src/lib/types.ts`.
- Implement Step 1.2 and Step 1.3 Malmö seed data (`index.json` + per-preschool survey files).
- Implement Step 1.4 data-loading utilities in `src/lib/data.ts`.
- Implement Step 1.5 scoring utilities in `src/lib/scoring.ts`.
- Add and pass unit tests for all Step 1 acceptance criteria.

## Progress Tracking

**Overall Status**: Not Started - 0%

### Subtasks

| ID  | Description                                         | Status      | Updated    | Notes                                                        |
| --- | --------------------------------------------------- | ----------- | ---------- | ------------------------------------------------------------ |
| 5.1 | Define TypeScript interfaces (`src/lib/types.ts`)   | Not Started | 2026-02-27 | Step 1.1                                                     |
| 5.2 | Add Malmö index seed data (`data/malmo/index.json`) | Not Started | 2026-02-27 | Step 1.2                                                     |
| 5.3 | Add per-preschool survey seed files                 | Not Started | 2026-02-27 | Step 1.3                                                     |
| 5.4 | Implement data-loading utility (`src/lib/data.ts`)  | Not Started | 2026-02-27 | Step 1.4                                                     |
| 5.5 | Implement scoring utility (`src/lib/scoring.ts`)    | Not Started | 2026-02-27 | Step 1.5                                                     |
| 5.6 | Add/validate unit tests for Step 1 acceptance       | Not Started | 2026-02-27 | Tests for shape checks, file linkage, loader behavior, score |

## Progress Log

### 2026-02-27

- Created task to enforce implementation-plan sequencing by prioritizing Step 1 before Step 3.1-3.3.
- Marked TASK005 as in progress and linked it to unblocking downstream layout and comparison work.
