# Complete: Step 8.5 Chart/Table ARIA Wiring

**Completed**: 2026-03-12
**Validation**: `pnpm validate` green — 26 unit + 19 comparison-page e2e + 47 e2e total = 73 total tests passing.

## What Was Done

Completed Step 8.5 in three phases: failing-first accessibility regression tests, narrow ARIA production fixes (chart `aria-describedby` wiring and CompareTray landmark correction), and Prettier formatting cleanup followed by full validation.

### Changes

#### Phase 1 — Failing-first Step 8.5 regression tests

- **`tests/e2e/comparison-page-route-shell.spec.ts`** — Added a new `Step 8.5 chart/table ARIA wiring` describe block containing three tests:
  1. `[structural guard] chart-0-table and chart-1-table ids exist in the DOM — precondition for aria-describedby wiring` — confirms the deterministic table `id` attributes from Step 8.4 are present in the DOM as a precondition guard; fails if Step 8.4 regresses rather than if `aria-describedby` is missing.
  2. `each comparison chart SVG carries aria-describedby pointing at its matching chart data table id` — seed two preschools, navigate to the comparison page, assert `aria-describedby="chart-0-table"` on the first SVG and `aria-describedby="chart-1-table"` on the second SVG.
  3. `comparison page with charts rendered has zero axe-core violations` — seed two preschools, wait for both chart SVGs to be visible, then run `axe-core` over the full comparison page and assert zero violations.
  - Tests were added before the production fix so they ran red first.

#### Phase 2 — Production fixes

- **`src/components/preact/BarChart.tsx`** — Added `aria-describedby={`chart-${chartIndex}-table`}` to the chart `<svg role="img">` element, pointing each chart at its deterministic adjacent data table. The `aria-label` accessible-name attribute from Step 8.1 is unchanged.
- **`src/components/preact/CompareTray.tsx`** — The axe-core comparison-page check exposed a landmark violation: the tray `<div>` lacked a landmark role. Fixed by changing the `<div>` to a `<nav>` element and adding `aria-label={showComparisonLabel}` (which already held the localized "Jämförelsetray" / comparison-navigation copy) so the landmark has an accessible name. The `useRef` type parameter was updated from `HTMLDivElement` to `HTMLElement` to match the element type.

#### Phase 3 — Formatting and validation

- **`tests/e2e/comparison-page-route-shell.spec.ts`** — Applied Prettier formatting (`pnpm exec prettier --write`); the multi-line template literal in the axe violation error message had a different line-break style than Prettier expected.
- `pnpm validate` — lint, lint:md, format:check, check (0 errors / 0 warnings / 0 hints), 26 unit tests, and Astro build all green.

### Key Decisions

- `aria-describedby` was added to the `<svg role="img">` element (not a wrapper `<div>`) because the accessible description relationship belongs on the element carrying the `img` role — the `aria-describedby` points at the full data table, giving screen-reader users an explicit navigation path from chart to tabular detail.
- The CompareTray `<div>` → `<nav>` change was triggered by the axe-core test added in this step. The landmark was always semantically a navigation region (it contains the compare-page link and the clear action); the fix promotes that implicit intent to an explicit ARIA landmark. This is a genuine accessibility improvement, not scope creep, and was directly caused by the new axe coverage.
- The `aria-label` on the `<nav>` reuses the already-present `showComparisonLabel` prop which holds the localized comparison-navigation copy, so no new i18n keys were needed and no locale files were touched.

## Test Results

```text
Step 8.5 chart/table ARIA wiring › [structural guard] chart-0-table and chart-1-table ids exist in the DOM — precondition for aria-describedby wiring  ✓ passed
Step 8.5 chart/table ARIA wiring › each comparison chart SVG carries aria-describedby pointing at its matching chart data table id  ✓ passed
Step 8.5 chart/table ARIA wiring › comparison page with charts rendered has zero axe-core violations  ✓ passed
```

19/19 comparison-page e2e tests passing. 47 e2e total. `pnpm validate` green.

## Commit Message

```text
feat(a11y): wire aria-describedby from chart SVGs to data tables (Step 8.5)

- Add aria-describedby to each BarChart SVG pointing at its chart-{n}-table
- Fix CompareTray landmark: change <div> to <nav> with aria-label
- Add three Step 8.5 Playwright contracts: structural guard, aria-describedby
  assertion, and full axe-core comparison-page coverage
- Apply Prettier format fix to comparison-page spec

Tests: 26 unit + 47 e2e = 73 total. pnpm validate green.
```
