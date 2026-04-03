# Research: Agree-Share Breakdown on Comparison Page

**Date**: 2026-04-02
**Feature**: [spec.md](spec.md)

## Research Questions

No NEEDS CLARIFICATION items were identified in the Technical Context. The following research covers design decisions and best-practice validation for the integration approach.

### R1: Should `DetailsBarChart` be reused in `ComparisonCard`?

**Decision**: No — render the bar chart as inline SVG directly in `ComparisonCard`, using pattern definitions from the shared `chart-patterns` library.

**Rationale**: `DetailsBarChart` renders all five response categories, but the comparison page only needs the two agree categories ("completely agree" and "partly agree"). The comparison card already shows the total agree-share percentage, so repeating all five categories would be redundant noise. A focused two-segment bar shows the conviction split within the agree-share.

The inline SVG imports `renderPatternContent`, `RESPONSE_SERIES`, and `TILE_SIZE` from `chart-patterns`, using `RESPONSE_SERIES.slice(0, 2)` to render only the first two patterns (solid blue for completely agree, diagonal stripe for partly agree) against a neutral gray background (`#e5e7eb`). The legend shows only these two categories with their percentages.

**Alternatives considered**:
- **Reuse `DetailsBarChart` as-is**: Rejected — it renders all 5 categories, which is too much visual noise for a comparison context where the total agree-share is already displayed.
- **Create a new `AgreeBreakdownBar` component**: Rejected — the bar is simple enough to render inline (one SVG + one legend div). Extracting a separate component would be an unnecessary abstraction for a single use. If a second usage appears later, extraction can happen then.
- **Modify `DetailsBarChart` to accept a category count**: Rejected — would complicate the existing detail page component for a single alternate use case.

### R2: SVG pattern ID uniqueness strategy

**Decision**: Compute `chartIndex` as an integer: `questionIndex * selectedSurveys.length + surveyIndex + 1000`, passed as a new prop to `ComparisonCard`.

**Rationale**: The inline SVG generates `<pattern>` elements with IDs like `agree-chart-{chartIndex}-cat-{catIdx}`. On the comparison page, multiple preschools are rendered for each question, so IDs must be unique across all cards to avoid SVG pattern ID collisions.

The formula `questionIndex * selectedSurveys.length + surveyIndex` produces unique, dense integers (e.g., for 3 surveys and 2 questions: 0,1,2,3,4,5). The `+ 1000` offset avoids any hypothetical collision with detail page chart indices, though in practice the comparison and detail pages are separate documents. See [data-model.md § Chart Index](data-model.md#chart-index) for the full formula table.

**Alternatives considered**:
- **Use `survey.id + question.text` hash**: Rejected — hash collisions are theoretically possible and harder to debug. Sequential integers are simpler and deterministic.
- **Use random IDs**: Rejected — non-deterministic, breaks SSR snapshot testing, harder to debug pattern-fill issues.

### R3: Layout integration — where does the bar chart appear within the card?

**Decision**: Render the bar chart between the preschool info row (name, remove button, response rate) and the sr-only data table, below the main interactive row. The bar chart sits inside the `<li>` but outside the clickable highlight area to avoid interfering with the highlight toggle interaction.

**Rationale**: The bar chart is informational, not interactive. Placing it inside the clickable `div` (which toggles highlight) would cause misclicks. Placing it after the main row but before the sr-only table keeps the visual flow logical: identity → score → breakdown → (hidden) accessibility table.

**Alternatives considered**:
- **Inside the clickable highlight area**: Rejected — tapping the bar chart would toggle highlight, which is confusing.
- **Below the sr-only table**: Functionally equivalent but semantically odd since the sr-only table is the accessible equivalent of the bar chart.
- **Expandable/collapsible disclosure**: Rejected — adds JS complexity, new interactive pattern not present elsewhere, and the bar chart is compact enough to always show.

### R4: Impact on page weight and JS bundle

**Decision**: No measurable impact expected.

**Rationale**: The `chart-patterns` library is already imported transitively via Preact island hydration on pages that use `DetailsBarChart`. The comparison page now imports `renderPatternContent`, `RESPONSE_SERIES`, and `TILE_SIZE` from `chart-patterns` directly in `ComparisonCard`. This adds minimal bytes since the pattern definitions are small constants. The inline SVG rendering adds only the JSX call sites, which are negligible.

Post-build page-weight test (`pnpm test:post-build`) will validate the 100 KB budget is maintained.

### R5: RTL layout considerations

**Decision**: No special RTL handling needed for the bar chart.

**Rationale**: The inline SVG uses `preserveAspectRatio="none"` and percentage-based positioning. SVG content is not affected by CSS `direction: rtl` — it always renders left-to-right internally. This is correct behavior for a stacked bar chart where "completely agree" (the positive end) should always be on the left/start. The legend below uses `flex-wrap` which respects `dir="rtl"` automatically via Tailwind's `rtl:` variants if needed, though the legend order (completely agree → partly agree) is conceptual, not directional.
