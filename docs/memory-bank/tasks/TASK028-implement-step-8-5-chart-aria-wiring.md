# TASK028 - Implement Step 8.5 Chart/Table ARIA Wiring

**Status**: Completed
**Added**: 2026-03-12
**Updated**: 2026-03-12

## Original Request

Implement Step 8.5: wire `aria-describedby` from each SVG chart to its chart-adjacent data table using the deterministic `id` attributes (`chart-${chartIndex}-table`) added in Step 8.4, and add axe-core comparison-page accessibility coverage.

## Thought Process

Step 8.4 closed the structural gap — deterministic table `id` attributes were in place. Step 8.5 was therefore a narrow two-change pass: (1) connect the `<svg role="img">` to the data table via `aria-describedby` so screen-reader users have a direct path from the chart to the full tabular data; (2) add failing-first regression tests covering that ARIA link and, separately, an axe-core sweep of the full comparison page.

The axe-core test was the higher-risk addition because it would surface any latent violations across all hydrated islands — it was possible the comparison page was already clean, or it may expose issues outside the planned scope. In practice it found one real issue: the `CompareTray` was rendered as a `<div>` containing navigation controls without a landmark role. Since the tray already held a localized `showComparisonLabel` prop describing its purpose, the fix was to change the outer element to `<nav aria-label={showComparisonLabel}>`, turning a latent semantic gap into an explicit ARIA landmark with no new i18n work needed.

## Implementation Plan

- Phase 1: Add three failing Step 8.5 regressions to `tests/e2e/comparison-page-route-shell.spec.ts`: a structural precondition guard for table ids, the `aria-describedby` assertion contract, and an axe-core full-page coverage check. Confirm red state before implementing.
- Phase 2: Add `aria-describedby={`chart-${chartIndex}-table`}` to the `<svg role="img">` in `src/components/preact/BarChart.tsx`; fix the CompareTray landmark issue surfaced by the axe-core test.
- Phase 3: Run `pnpm validate`, fix any formatting issues from test additions, write plan completion artifact, update memory bank.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                                 | Status   | Updated    | Notes                                                                      |
| --- | ----------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------- |
| 1.1 | Write failing structural guard for chart table ids          | Complete | 2026-03-12 | Precondition guard — verifies Step 8.4 infra is intact                     |
| 1.2 | Write failing aria-describedby chart contract               | Complete | 2026-03-12 | Asserts attr on first and second chart SVG                                 |
| 1.3 | Write failing axe-core comparison-page contract             | Complete | 2026-03-12 | Waits for both charts to be visible before running axe                     |
| 2.1 | Add `aria-describedby` to BarChart svg element              | Complete | 2026-03-12 | `aria-describedby={`chart-${chartIndex}-table`}`                           |
| 2.2 | Fix CompareTray landmark issue exposed by axe               | Complete | 2026-03-12 | `<div>` → `<nav aria-label={showComparisonLabel}>`, ref type updated       |
| 3.1 | Apply Prettier formatting fix to spec file                  | Complete | 2026-03-12 | Multi-line template literal in axe error message was flagged               |
| 3.2 | Run `pnpm validate` and confirm 47 e2e + 26 unit = 73 total | Complete | 2026-03-12 | All quality gates green                                                    |
| 3.3 | Write plan completion artifact and update memory bank       | Complete | 2026-03-12 | `step-8-5-chart-aria-wiring-complete.md`, activeContext, progress, \_index |

## Progress Log

### 2026-03-12

- Added three Step 8.5 Playwright contracts to `tests/e2e/comparison-page-route-shell.spec.ts` under a new `Step 8.5 chart/table ARIA wiring` describe block:
  - `[structural guard] chart-0-table and chart-1-table ids exist in the DOM — precondition for aria-describedby wiring` (precondition, not an acceptance criterion)
  - `each comparison chart SVG carries aria-describedby pointing at its matching chart data table id` (primary acceptance criterion)
  - `comparison page with charts rendered has zero axe-core violations` (full-page axe sweep after islands hydrate)
- Confirmed red state for the `aria-describedby` contract and the axe contract before implementing production changes.
- Added `aria-describedby={`chart-${chartIndex}-table`}` to the `<svg role="img">` element in `src/components/preact/BarChart.tsx`. The `aria-label` accessible-name attribute from Step 8.1 is unchanged.
- Fixed `CompareTray.tsx`: changed outer element from `<div>` to `<nav>` with `aria-label={showComparisonLabel}`; updated `useRef<HTMLDivElement>` to `useRef<HTMLElement>`. This resolved the CompareTray landmark violation surfaced by the new axe-core coverage.
- Discovered Prettier formatting issue in the spec file (multi-line template literal style in axe error); fixed with `pnpm exec prettier --write tests/e2e/comparison-page-route-shell.spec.ts`.
- Ran `pnpm validate` — lint, lint:md, format:check, check (0 errors / 0 warnings / 0 hints), 26 unit tests, and Astro build all green.
- All 19 comparison-page e2e tests passing; 47 e2e total.
- Created `docs/plans/step-8-5-chart-aria-wiring-complete.md`, updated `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, and this task file.
