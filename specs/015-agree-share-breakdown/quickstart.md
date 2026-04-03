# Quickstart: Agree-Share Breakdown on Comparison Page

**Date**: 2026-04-02
**Feature**: [spec.md](spec.md)

## Prerequisites

- Node.js (see `.nvmrc`)
- pnpm (enforced by `engines` in `package.json`)

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Then navigate to `http://localhost:4321/forskoleguiden/sv/` → select 2+ preschools → click "Jämför" in the compare tray → verify bar charts appear on the comparison page under each question section.

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/preact/ComparisonView.tsx` | MODIFY | Compute `chartIndex` per card and pass it as a prop to `ComparisonCard`. See [plan.md § Step 2](plan.md#step-2-compute-and-pass-chartindex-from-comparisonview) |
| `src/components/preact/ComparisonCard.tsx` | MODIFY | Add `chartIndex` prop, import `renderPatternContent`/`RESPONSE_SERIES`/`TILE_SIZE` from chart-patterns, render inline 2-segment agree-share bar below the main info row. See [plan.md § Step 3](plan.md#step-3-render-inline-agree-share-bar-in-comparisoncard) |

## New Files

| File | Description |
|------|-------------|
| `tests/unit/comparison-card-chart-index.test.ts` | Unit test verifying chart index uniqueness across question × survey combinations |
| `tests/e2e/comparison-page-breakdown-bar.spec.ts` | E2e test verifying bar charts are rendered on the comparison page |

## Key Integration Points

1. **`ComparisonView.tsx`** (~line 248): The `questions.map()` loop already provides a `questionIdx` via the map callback. The inner `selectedSurveys.map()` provides `surveyIdx`. Compute `chartIndex` here as `questionIdx * selectedSurveys.length + surveyIdx + 1000` and pass it as a prop to `<ComparisonCard>`. See [research.md § R2](research.md#r2-svg-pattern-id-uniqueness-strategy) for the rationale and [data-model.md § Chart Index](data-model.md#chart-index) for the formula.

2. **`ComparisonCard.tsx`**: Add `chartIndex: number` prop. Import `renderPatternContent`, `RESPONSE_SERIES`, and `TILE_SIZE` from `chart-patterns`. Render an inline SVG bar chart showing only `completelyAgreePercent` (solid blue pattern) and `partlyAgreePercent` (diagonal stripe pattern) against a gray `#e5e7eb` background. Place **after** the main clickable `<div>` (the highlight-toggle area) and **before** the sr-only `<div class="sr-only">`. Wrap in `<div aria-hidden="true">`. A 2-item legend below the bar shows category names with percentages. See [research.md § R1](research.md#r1-should-detailsbarchart-be-reused-in-comparisoncard) for the design rationale and [research.md § R3](research.md#r3-layout-integration--where-does-the-bar-chart-appear-within-the-card) for the placement decision.

3. **`chart-patterns` library**: Used for `renderPatternContent()` (generates SVG `<pattern>` fill content), `RESPONSE_SERIES` (pattern definitions — only first 2 entries used: solid blue + diagonal stripe), and `TILE_SIZE` (8 px). No changes to the library itself.

## Validation

```bash
# Run full quality gate
pnpm validate

# Quick checks during development
pnpm test                    # Unit tests
pnpm test:e2e                # E2e tests
pnpm test:post-build         # Page weight budget
pnpm audit:lighthouse        # Accessibility + performance
```

## Key Constraints

- No new i18n keys — `categoryLabels` already passed through from `ComparisonView`
- No new Preact islands — bar chart renders inline inside existing `ComparisonCard` sub-component
- SVG pattern IDs must be globally unique — use `agree-chart-{chartIndex}-cat-{catIdx}` prefix with chartIndex offset scheme from data-model.md
- Page weight must stay ≤ 100 KB uncompressed
