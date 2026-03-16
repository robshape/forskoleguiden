# TASK038 - Implement Step 13.2 End-to-End User Flow Test

**Status**: Completed
**Added**: 2026-03-16
**Updated**: 2026-03-16

## Original Request

Implement "Step 13: 13.2"

## Thought Process

Step 13.2 is a final-verification task, not a product feature. The repo already had strong route-level Playwright coverage for the directory, compare tray, comparison page, and detail pages, but it was still missing one chained journey proving the full Phase 1 Malmö flow works through real Astro MPA navigations and persisted compare state. The correct implementation was therefore a single long behavior-driven e2e test, not more component code.

## Implementation Plan

- Add one comprehensive Playwright spec covering the full 14-step Step 13.2 journey.
- Harden the new spec's locators just enough to keep it resilient without changing scope.
- Run full validation and update the memory bank, task index, and completion artifact.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                             | Status   | Updated    | Notes                                                           |
| --- | --------------------------------------- | -------- | ---------- | --------------------------------------------------------------- |
| 1.1 | Create Step 13.2 plan and test artifact | Complete | 2026-03-16 | Added the plan file and new end-to-end spec.                    |
| 1.2 | Harden the flow test for reliability    | Complete | 2026-03-16 | Scoped the directory heading assertion to its section.          |
| 1.3 | Validate, review, and close the task    | Complete | 2026-03-16 | `pnpm validate` green after formatting the new Playwright spec. |

## Progress Log

### 2026-03-16 (Phase 3 — Validation and Close)

- Ran `pnpm validate`: all gates green — 0 lint errors, 0 markdown errors, 0 format issues, 0 type errors, 75 unit tests, 61 Chromium e2e tests, 1 WebKit regression, 9 post-build tests, Lighthouse healthcheck passed.
- Updated `docs/implementation-plan.md` to correct the stale Step 13.2 wording so the final-verification steps match the shipped default alphabetical sort.
- Updated `docs/memory-bank/activeContext.md` and `docs/memory-bank/progress.md` to reflect Step 13.2 completion and the now-complete Step 13 milestone.
- Updated task index to add TASK038 to Completed.

### 2026-03-16 (Phase 1–2 — Implementation)

- Created `tests/e2e/user-flow-phase1.spec.ts` with one long end-to-end Playwright test covering the full directory → comparison → detail → persistence flow.
- Kept the implementation test-only; no application code changes were required.
- Fixed two test-only issues discovered during targeted runs: replaced a one-shot sort assertion with Playwright's retrying `toHaveText()`, and narrowed the chart selector to rendered pattern-filled bar-segment rects.
- Applied a small hardening pass by scoping the directory heading assertion to the directory section.
