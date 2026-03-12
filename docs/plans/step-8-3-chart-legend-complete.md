# Complete: Step 8.3 Chart Legend

**Completed**: 2026-03-12
**Validation**: `pnpm validate` green — 26 unit + 14 e2e comparison-page tests passing; full suite 26 unit + 41 e2e = 67 total.

## What Was Done

Added a visual legend to each `BarChart` instance on the comparison page so every pattern swatch is mapped to its canonical Swedish response label.

### Changes

- **`tests/e2e/comparison-page-route-shell.spec.ts`** — Added a Step 8.3 Playwright contract (`test.describe('Step 8.3 chart legend', ...)`) asserting that each chart exposes a `data-testid="chart-legend"` element containing all five canonical Swedish response labels and exactly five `data-testid="chart-legend-swatch"` elements.
- **`src/components/preact/BarChart.tsx`** — Added a legend section between the SVG chart and the existing data table. Each legend item renders a small inline SVG swatch with locally-scoped pattern definitions that mirror the chart's pattern encodings, followed by the response category label.

### Key Decisions

- Legend sits between the SVG and the data table to maintain reading order: chart → key → data.
- Swatch SVGs use locally-scoped `<defs>` with unique pattern ids (suffixed by `legendSwatch-${id}`) to avoid id collisions when multiple charts are on the same page.
- No new i18n keys were needed; category labels are already threaded into `BarChart` via the `categories` prop.
- Legend markup uses `data-testid` attributes for deterministic e2e targeting without coupling to text content.
- `RESPONSE_SERIES` in `BarChart.tsx` remains the single source of truth for response fields, colors, and pattern definitions.

## Test Result

```text
Step 8.3 chart legend › each comparison chart renders a visible legend with all five canonical Swedish response labels and a swatch per category  ✓ passed
```

14/14 comparison-page e2e tests passing. `pnpm validate` green.
