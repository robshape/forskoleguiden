# TASK024 - Harden Step 8.2 chart patterns

**Status**: Completed
**Added**: 2026-03-11
**Updated**: 2026-03-11

## Original Request

Apply review feedback to the Step 8.2 chart-pattern work by stabilizing the Playwright regression selectors and binding response-field metadata to pattern metadata in one source of truth.

## Thought Process

The Step 8.2 implementation is functionally correct, but the review surfaced two maintainability risks: brittle order-based e2e selectors and split semantic metadata across multiple arrays in `BarChart`. Both issues are localized and worth fixing immediately because they improve regression resilience without changing user-facing behavior.

## Implementation Plan

- Harden the Step 8.2 regression to target the semantic chart and stable pattern id suffixes.
- Refactor `BarChart` to derive response fields and pattern definitions from a single `RESPONSE_SERIES` array.
- Re-run targeted and full validation, then update the memory bank.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                          | Status   | Updated    | Notes                                                     |
| --- | ------------------------------------ | -------- | ---------- | --------------------------------------------------------- |
| 1.1 | Stabilize chart regression selectors | Complete | 2026-03-11 | Approved review; semantic chart scoping in place          |
| 1.2 | Unify response and pattern metadata  | Complete | 2026-03-11 | Approved review; `RESPONSE_SERIES` is the source of truth |
| 1.3 | Validate and sync completion docs    | Complete | 2026-03-11 | `pnpm validate` passed and docs synchronized              |

## Progress Log

### 2026-03-11

- Recorded the approved hardening follow-up in `docs/plans/step-8-2-chart-hardening-plan.md`.
- Opened TASK024 to track the review-driven selector and metadata hardening work.
- Hardened the Step 8.2 regression in `tests/e2e/comparison-page-route-shell.spec.ts` so it now targets the semantic chart by accessible name and pattern nodes by stable id suffixes.
- Refactored `src/components/preact/BarChart.tsx` to replace separate response-field and pattern arrays with a single `RESPONSE_SERIES` metadata structure.
- Verified the hardening follow-up with the targeted Step 8.2 Playwright regression, `pnpm check`, and a final `pnpm validate`.
