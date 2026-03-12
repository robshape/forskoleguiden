# TASK027 - Implement Step 8.4 Table Fallback

**Status**: Completed
**Added**: 2026-03-12
**Updated**: 2026-03-12

## Original Request

Complete the remaining Step 8.4 work by adding a true no-JS fallback to the comparison-page Astro shell and hardening the existing chart-adjacent table so Step 8.5 can attach chart semantics cleanly.

## Thought Process

The per-question chart-adjacent table already existed inside the `ComparisonView` island from Step 8.1. Step 8.4 scope was therefore two focused passes: (1) a static `<noscript>` fallback in the Astro route shell (the island never renders server-side, so the fallback must live in the `.astro` file); and (2) deterministic `id` attributes on each chart data table so Step 8.5 can wire `aria-describedby` without touching table structure again.

## Implementation Plan

- Phase 1: Add a failing Step 8.4 Playwright contract for the `<noscript>` fallback, add `compare.noscriptMessage` to all three locale JSONs, render `<noscript>` adjacent to `ComparisonView` in `src/pages/sv/jamfor/index.astro`.
- Phase 2: Add deterministic `id` on each chart-adjacent data table in `src/components/preact/BarChart.tsx` (pattern: `chart-${chartIndex}-table`); re-run comparison-page coverage; run `pnpm validate`.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                             | Status   | Updated    | Notes                                                         |
| --- | ------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------- |
| 1.1 | Write failing Step 8.4 Playwright noscript contract     | Complete | 2026-03-12 | Added to `comparison-page-route-shell.spec.ts` Step 8.4 block |
| 1.2 | Add `compare.noscriptMessage` to sv/en/ar locale JSONs  | Complete | 2026-03-12 | All three locale files updated                                |
| 1.3 | Render `<noscript>` fallback in `jamfor/index.astro`    | Complete | 2026-03-12 | Adjacent to `ComparisonView` island                           |
| 2.1 | Add deterministic `id` to chart data tables in BarChart | Complete | 2026-03-12 | Pattern: `chart-${chartIndex}-table`                          |
| 2.2 | Re-run comparison-page coverage and `pnpm validate`     | Complete | 2026-03-12 | 16/16 comparison-page tests, 44 e2e total, all gates green    |

## Progress Log

### 2026-03-12

- Added failing `'comparison page includes a static <noscript> element with a message directing users to individual preschool pages when JavaScript is unavailable'` Playwright test to `tests/e2e/comparison-page-route-shell.spec.ts` under the `Step 8.4 no-JS static fallback` describe block; confirmed it failed before the implementation.
- Added `compare.noscriptMessage` key to `src/i18n/sv.json`, `src/i18n/en.json`, and `src/i18n/ar.json`.
- Rendered a `<noscript>` element containing the resolved Swedish `compare.noscriptMessage` string adjacent to the `ComparisonView` island in `src/pages/sv/jamfor/index.astro`.
- Confirmed targeted Step 8.4 Playwright test passed after implementation.
- Ran `pnpm validate` — green after Phase 1.
- Added deterministic `id={`chart-${chartIndex}-table`}` to each chart-adjacent `<table>` element in `src/components/preact/BarChart.tsx`, using the existing `chartIndex` prop; no structural changes to existing table markup required.
- Re-ran comparison-page Playwright spec — 16/16 tests passing.
- Ran final `pnpm validate` — lint, lint:md, format:check, check, 26 unit tests, and build all green.
- Updated `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, and created `docs/plans/step-8-4-table-fallback-complete.md` and this task file.

### 2026-03-12 (corrective follow-up)

- Identified documentation inconsistency: all Step 8.4 docs had described the table `id` pattern as `chart-data-table-{chartId}`, but the actual implementation in `src/components/preact/BarChart.tsx` (line 237) emits `chart-${chartIndex}-table`.
- Corrected the pattern string in all four affected files (`step-8-4-table-fallback-complete.md`, this task file, `progress.md`, `_index.md`) to match the canonical implementation contract. No product-code changes were made.
