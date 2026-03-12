# Plan: Step 8.4 Table Fallback

Complete the remaining Step 8.4 work by adding a true no-JS fallback to the comparison-page Astro shell and lightly hardening the existing chart-adjacent table so Step 8.5 can attach chart semantics cleanly. The per-question table required by Step 8.4 already exists inside the `ComparisonView` island, so this pass stays focused on the remaining shell and accessibility work.

## Phases

1. **Phase 1: Add the No-JS Fallback via TDD**
   - **Objective**: Add a failing test for the comparison page's static `<noscript>` fallback, then implement the fallback in the Astro route shell with localized copy.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`, `src/pages/sv/jamfor/index.astro`, `src/i18n/sv.json`, `src/i18n/en.json`, `src/i18n/ar.json`
   - **Tests to Write**: a Step 8.4 Playwright contract asserting that the comparison page includes a `<noscript>` message directing users to individual preschool detail pages
   - **Steps**:
     1. Add a failing Step 8.4 Playwright test covering the static `<noscript>` fallback.
     2. Add a new `compare.noscriptMessage` key to all locale JSON files.
     3. Resolve the new message in `src/pages/sv/jamfor/index.astro` and render it inside a `<noscript>` element adjacent to the `ComparisonView` island.
     4. Re-run the targeted comparison-page test and confirm it passes.

2. **Phase 2: Add Stable Table IDs for Step 8.5 Readiness**
   - **Objective**: Give each chart-adjacent data table a deterministic `id` so Step 8.5 can attach `aria-describedby` from the SVG without further structural changes.
   - **Files/Functions to Modify/Create**: `src/components/preact/BarChart.tsx`
   - **Tests to Write**: no new test beyond the existing Step 8.4 table-structure coverage; use the existing comparison-page chart/table contracts as the acceptance target
   - **Steps**:
     1. Add a deterministic `id` to each chart data table in `BarChart.tsx` using the existing chart index.
     2. Re-run targeted comparison-page coverage.
     3. Run `pnpm validate` to confirm the full quality gate remains green.
