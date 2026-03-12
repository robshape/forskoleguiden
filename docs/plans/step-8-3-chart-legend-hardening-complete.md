# Complete: Step 8.3 Chart Legend Hardening

**Completed**: 2026-03-12
**Validation**: `pnpm validate` green — 26 unit + 15 comparison-page e2e + 42 e2e total = 68 total tests passing.

## What Was Done

Addressed the Step 8.3 review feedback by adding a structural drift-guard Playwright contract and eliminating the root cause of potential chart/legend divergence through a shared SVG pattern-rendering helper.

### Changes

- **`tests/e2e/comparison-page-route-shell.spec.ts`** — Added a drift-guard test (`'legend swatch patterns mirror chart patterns structurally for all five categories — drift guard'`) inside the existing `Step 8.3 chart legend` describe block. The test asserts that for every chart, each legend swatch's pattern SVG contains the same primitive type (rect, path, circle, line) as the corresponding chart pattern.
- **`src/components/preact/BarChart.tsx`** — Extracted `renderPatternContent(pDef: PatternDef)` as a shared helper that renders the interior elements of a single SVG pattern tile. Both the main chart `<defs>` and the legend swatch `<defs>` now call this helper, making structural equivalence a compile-time guarantee.

### Key Decisions

- A shared helper is strictly better than a test-only assertion: the test catches a class of bugs, the helper eliminates the bug class entirely.
- The helper is module-private (not exported) — it is only an implementation detail of `BarChart.tsx`.
- The drift-guard test asserts primitive type presence, not exact pixel values, so it survives future styling changes without needing a rewrite.

## Test Results

```text
Step 8.3 chart legend › each comparison chart renders a visible legend with all five canonical Swedish response labels and a swatch per category  ✓ passed
Step 8.3 chart legend › legend swatch patterns mirror chart patterns structurally for all five categories — drift guard  ✓ passed
```

15/15 comparison-page e2e tests passing. 42 e2e total. `pnpm validate` green.
