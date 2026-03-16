# [TASK031] - Implement Step 9.3 render comparison summary text

**Status**: Completed
**Added**: 2026-03-15
**Updated**: 2026-03-15

## Original Request

Implement Step 9.3 from `docs/implementation-plan-phase-1.md`: render deterministic comparison summary sentences in the comparison page UI.

## Thought Process

Step 9.3 needed to stay narrow because the deterministic pairwise comparison logic and summary text formatter already existed from Steps 9.1 and 9.2. The key decision was to keep summary generation inside the client-only `ComparisonView` island, where the selected preschool IDs already live, and to lock the behavior with a failing route-level e2e contract before wiring any UI.

## Implementation Plan

- Add a failing Playwright contract for multi-preschool summary rendering and one-preschool summary absence.
- Thread `locale` from the comparison route into `ComparisonView` and reuse the existing summary utilities there.
- Validate the finished feature with targeted tests and `pnpm validate`.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                           | Status   | Updated    | Notes                                                                    |
| --- | ------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------ |
| 1.1 | Lock Step 9.3 UI contract             | Complete | 2026-03-15 | Added red-state Playwright coverage for summary presence and absence     |
| 1.2 | Wire summary text into ComparisonView | Complete | 2026-03-15 | Reused `computeSummary` and `formatSummaryText` inside the client island |
| 1.3 | Validate and document completion      | Complete | 2026-03-15 | Ran `pnpm validate` and updated plan + memory-bank records               |

## Progress Log

### 2026-03-15

- Added Step 9.3 Playwright coverage to `tests/e2e/comparison-page-route-shell.spec.ts`, including an exact-text contract for multi-school summaries and a guard that the summary section stays hidden for one selected preschool
- Updated `src/components/preact/ComparisonView.tsx` to accept `locale`, derive the selected-school name map, call `computeSummary()` and `formatSummaryText()`, and render a `data-testid="comparison-summary"` list only when 2 or more preschools are selected
- Updated `src/pages/sv/jamfor/index.astro` to pass `locale` into the client-only comparison island
- Ran `pnpm validate` successfully after the Step 9.3 changes and updated the plan and memory-bank records to mark the step complete
- Added a follow-up accessibility hardening patch so the summary list now renders inside a labeled `region` with a localized heading (`compare.summaryHeading`), and extended the Playwright contract to assert that semantic structure
