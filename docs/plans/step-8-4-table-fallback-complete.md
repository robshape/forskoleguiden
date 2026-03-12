# Complete: Step 8.4 Table Fallback

**Completed**: 2026-03-12
**Validation**: `pnpm validate` green — 26 unit + 16 comparison-page e2e + 44 e2e total = 70 total tests passing.

## What Was Done

Completed Step 8.4 in two phases: a static no-JS fallback for the comparison route shell and deterministic table `id` attributes for Step 8.5 `aria-describedby` readiness.

### Changes

#### Phase 1 — No-JS static fallback

- **`tests/e2e/comparison-page-route-shell.spec.ts`** — Added a Step 8.4 Playwright contract (`'comparison page includes a static <noscript> element with a message directing users to individual preschool pages when JavaScript is unavailable'`) inside a new `Step 8.4 no-JS static fallback` describe block. The test inspects the raw page HTML to assert: (1) a `<noscript>` element is present; (2) the content contains the word "JavaScript"; (3) the content references preschool pages (Swedish: "förskola").
- **`src/i18n/sv.json`, `src/i18n/en.json`, `src/i18n/ar.json`** — Added `compare.noscriptMessage` key in all three locale files.
- **`src/pages/sv/jamfor/index.astro`** — Renders a `<noscript>` element adjacent to the `ComparisonView` island, containing the resolved Swedish `compare.noscriptMessage` string at build time.

#### Phase 2 — Deterministic table IDs for Step 8.5 readiness

- **`src/components/preact/BarChart.tsx`** — Added `id={`chart-${chartIndex}-table`}` to each chart-adjacent `<table>` element, using the existing `chartIndex` prop already threaded through the component for chart/legend pattern scoping; no structural changes to the surrounding table markup were needed.

### Key Decisions

- The `<noscript>` fallback belongs in the Astro route shell, not the `ComparisonView` island, because the island is `client:only="preact"` and never renders server-side HTML. The static message is therefore always present in the delivered HTML regardless of JS availability.
- The table `id` pattern (`chart-${chartIndex}-table`) mirrors the existing `chartIndex`-based convention already in use for chart and legend defs (`chart-${chartIndex}-cat-*`, `legend-${chartIndex}-cat-*`), keeping the BarChart `id`-namespace consistent.
- No new unit tests were needed for Phase 2 — the existing chart/table Playwright contracts cover the table structure, and the new `id` attribute is a purely additive change observable at the e2e level if needed by Step 8.5.

## Test Results

```text
Step 8.4 no-JS static fallback › comparison page includes a static <noscript> element with a message directing users to individual preschool pages when JavaScript is unavailable  ✓ passed
```

16/16 comparison-page e2e tests passing. 44 e2e total. `pnpm validate` green.
