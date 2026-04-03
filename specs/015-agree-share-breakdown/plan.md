# Implementation Plan: Agree-Share Breakdown on Comparison Page

**Branch**: `015-agree-share-breakdown` | **Date**: 2026-04-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/015-agree-share-breakdown/spec.md`

## Summary

Add compact two-segment breakdown bars showing the "completely agree" and "partly agree" percentages to each preschool card on the comparison page. The bar is rendered as inline SVG in `ComparisonCard` using pattern definitions from the shared `chart-patterns` library. Only the two agree categories are shown (against a gray background) because the comparison card already displays the total agree-share percentage — parents need to see the conviction split, not a repeat of all five categories. The existing sr-only table with all five categories remains intact for screen-reader accessibility.

## Technical Context

**Language/Version**: TypeScript (strict), Astro 5.x, Preact 10.x
**Primary Dependencies**: `@nanostores/preact`, `@tailwindcss/vite` (Tailwind CSS v4), `chart-patterns` library (pattern definitions and render helpers)
**Storage**: N/A (static site, build-time data only)
**Testing**: Vitest (unit), Playwright + axe-core (e2e), post-build page-weight tests
**Target Platform**: Static site (GitHub Pages), mobile-first (iPhone 17 / 393×852, range 320–430 px)
**Project Type**: Static web application (Astro MPA with Preact islands)
**Performance Goals**: Minimal additional JS — inline SVG rendering with existing pattern definitions; page weight ≤ 100 KB uncompressed
**Constraints**: No new Preact islands; bar chart renders inline in existing `ComparisonCard` sub-component; SVG pattern IDs must be globally unique per page
**Scale/Scope**: Comparison page with up to 5 preschools × N questions (currently 2 questions in Helhetsbedömning = up to 10 bar charts)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Performance by Default | PASS | Uses shared `chart-patterns` library — minimal new code. Inline SVG rendering adds negligible bytes. Page weight budget verified by post-build test. |
| II. Accessibility First | PASS | Bar chart uses `aria-hidden="true"` with existing sr-only data table fallback. Pattern fills for color-blind safety. No new interactive elements (no keyboard navigation change). |
| III. Data Integrity | PASS | Uses existing `SurveyResponse` fields. No new data shape or scoring logic. |
| IV. Testing Standards | PASS | Unit test for chart index uniqueness. E2e test for bar chart presence on comparison page. Existing axe-core tests cover new DOM elements. |
| V. Architecture Discipline | PASS | Inline SVG rendering in existing sub-component. Uses shared pattern library. No new abstractions, helpers, or utilities. |
| VI. Internationalization | PASS | `categoryLabels` already passed to `ComparisonCard` — only the first two (agree categories) are used in the legend. No new i18n keys needed. RTL handled by Tailwind's `rtl:` variants. |
| VII. Privacy by Design | PASS | No external requests. No new state persistence. No cookies. |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/015-agree-share-breakdown/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── preact/
│       ├── ComparisonView.tsx   # MODIFY: Compute chartIndex and pass to ComparisonCard
│       └── ComparisonCard.tsx   # MODIFY: Add chartIndex prop, render inline agree-share bar
├── lib/
│   ├── chart-patterns.tsx       # EXISTING: Reused for pattern definitions (renderPatternContent, RESPONSE_SERIES, TILE_SIZE)
│   └── survey-responses.ts     # EXISTING: Reused as-is (no changes)

tests/
├── unit/
│   └── comparison-card-chart-index.test.ts  # NEW: Verify chart index uniqueness
└── e2e/
    └── comparison-page-breakdown-bar.spec.ts  # NEW: E2e test for bar chart presence
```

**Structure Decision**: Minimal footprint — only `ComparisonCard.tsx` and `ComparisonView.tsx` are modified. Two new test files added. No new components, utilities, or abstractions. `DetailsBarChart.tsx` is NOT reused because it renders all 5 categories; the comparison bar only needs 2.

## Implementation Steps

Ordered sequence. Each step references the detail document and section that provides the design rationale.

### Step 1: Add `chartIndex` prop to `ComparisonCard`

**File**: `src/components/preact/ComparisonCard.tsx` (Props interface, ~line 12)
**What**: Add `chartIndex: number` to the `Props` interface.
**Why**: The bar chart component needs a unique integer to generate non-colliding SVG `<pattern>` IDs. See [research.md § R2](research.md#r2-svg-pattern-id-uniqueness-strategy) for the ID-collision rationale and [data-model.md § Chart Index](data-model.md#chart-index) for the formula.
**Satisfies**: FR-002 (pattern fills)

### Step 2: Compute and pass `chartIndex` from `ComparisonView`

**File**: `src/components/preact/ComparisonView.tsx` (~line 248, inside the `questions.map()` → `selectedSurveys.map()` nested loop)
**What**: Compute `chartIndex` as `questionIdx * selectedSurveys.length + surveyIdx + 1000` and pass it as a prop to `<ComparisonCard>`.
**Why**: Each card needs a page-unique `chartIndex`. The outer `questions.map((question, questionIdx))` provides `questionIdx`; the inner `selectedSurveys.map((survey, surveyIdx))` provides `surveyIdx`. See [data-model.md § Chart Index](data-model.md#chart-index) for the formula table and examples.
**Satisfies**: FR-001, FR-002

### Step 3: Render inline agree-share bar in `ComparisonCard`

**File**: `src/components/preact/ComparisonCard.tsx`
**What**:
1. Add imports: `renderPatternContent`, `RESPONSE_SERIES`, `TILE_SIZE` from `@/lib/chart-patterns`.
2. In the "has data" return branch (~line 155), render an inline SVG bar chart **after** the main clickable `<div>` (the highlight-toggle area) and **before** the sr-only `<div class="sr-only">`. This placement is outside the click target. See [research.md § R3](research.md#r3-layout-integration--where-does-the-bar-chart-appear-within-the-card) for the placement rationale.
3. The bar uses `RESPONSE_SERIES.slice(0, 2)` to render only the first two patterns (solid blue for "completely agree", diagonal stripe for "partly agree") against a gray `#e5e7eb` background.
4. SVG pattern IDs use prefix `agree-chart-{chartIndex}-cat-{catIdx}` to avoid collisions.
5. A compact legend below shows only the two agree categories with percentage values, using `categoryLabels[0]` and `categoryLabels[1]`.
6. Wrap in `<div aria-hidden="true">` for screen-reader bypass.
7. Do **not** render the bar in the "no data" early return (~line 127). See [spec.md § FR-006](spec.md#functional-requirements).

**Satisfies**: FR-001, FR-002, FR-003, FR-004, FR-006, FR-007

### Step 4: Verify sr-only table is unchanged

**File**: `src/components/preact/ComparisonCard.tsx` (~line 170)
**What**: Visually confirm the existing `<div class="sr-only"><table>` block is untouched — it still lists all five response categories via `RESPONSE_ROWS.map()`. The bar chart shows only 2 categories visually, but the sr-only table retains the full 5-category breakdown for screen-reader users.
**Why**: FR-005 requires the screen-reader fallback table to remain intact. The bar chart is `aria-hidden` so the sr-only table is the only way screen-reader users access the breakdown data.
**Satisfies**: FR-005, SC-004

### Step 5: Write unit test for chart index uniqueness

**File**: `tests/unit/comparison-card-chart-index.test.ts` (NEW)
**What**: Test that the formula `questionIndex * surveyCount + surveyIndex + 1000` produces unique values for all combinations within the bounds of the comparison page (up to 5 surveys × N questions). Assert no duplicates in the generated set.
**Why**: SVG pattern ID collisions would cause bars to render with wrong patterns — a silent, hard-to-debug visual bug. See [data-model.md § Validation Rules](data-model.md#validation-rules).
**Satisfies**: SC-001

### Step 6: Write e2e test for bar chart presence

**File**: `tests/e2e/comparison-page-breakdown-bar.spec.ts` (NEW)
**What**: Select 2+ preschools, navigate to the comparison page, assert that each comparison card contains an SVG element (the bar chart) and a legend with category labels. Use existing e2e helpers from `tests/e2e/helpers.ts` for URL constants and card locators.
**Why**: Validates the full integration from data → component → rendered DOM. See [spec.md § User Story 1 acceptance scenarios](spec.md#user-story-1--view-agree-share-breakdown-per-preschool-per-question-priority-p1).
**Satisfies**: SC-001, SC-002, SC-005

### Step 7: Run validation

**Command**: `pnpm validate`
**What**: Full quality gate — lint, format, check, test, build, e2e, Lighthouse.
**Why**: Confirms FR-009 (bundle budget), SC-003 (axe-core passes), SC-006 (page weight ≤ 100 KB). See [quickstart.md § Validation](quickstart.md#validation) for the command breakdown.
**Satisfies**: FR-008, FR-009, SC-003, SC-005, SC-006, SC-007

### Step 8: Manual verification

1. `pnpm dev` → navigate to `/forskoleguiden/sv/` → select 2+ preschools → open comparison page.
2. Each card under each question should show a horizontal bar chart with legend.
3. Toggle highlight on a card — bar chart should dim/highlight with the card.
4. Switch to `/forskoleguiden/ar/` — verify RTL layout renders correctly.
5. Open DevTools at 320 px width — verify no overflow.
6. See [quickstart.md § Development](quickstart.md#development) for the full manual flow.
