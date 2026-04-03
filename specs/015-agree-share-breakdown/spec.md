# Feature Specification: Agree-Share Breakdown on Comparison Page

**Feature Branch**: `015-agree-share-breakdown`
**Created**: 2026-04-02
**Status**: Draft
**Input**: User description: "On the comparison page, I want to see a breakdown of the Agree Share where I can see the details of how many completely agree and how many partly agree. We should use a horizontal, accessible, bar as on the preschool details page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View agree-share breakdown per preschool per question (Priority: P1)

A parent comparing preschools on the comparison page wants to understand *why* two schools both score 80% agree share but differ in conviction — one might have 60% "completely agree" + 20% "partly agree" while the other has 40% + 40%. The breakdown bar visualizes this distinction at a glance.

For each preschool card within each question section, a compact horizontal stacked bar chart appears showing only the two "agree" segments (completely agree and partly agree) against a neutral gray background. This focused view complements the aggregate agree-share percentage already shown on each card — parents see the conviction split without the noise of the other three categories.

**Why this priority**: This is the core value of the feature. Without the bar chart, the comparison page only shows an aggregate percentage and parents cannot distinguish between strong and lukewarm agreement.

**Independent Test**: Can be fully tested by selecting 2+ preschools, navigating to the comparison page, and verifying each preschool card under each question displays a horizontal stacked bar chart with the two agree segments. Delivers immediate value by surfacing conviction depth.

**Acceptance Scenarios**:

1. **Given** two or more preschools are selected for comparison, **When** the user views the comparison page, **Then** each preschool card under each question section displays a horizontal stacked bar chart showing the two agree categories (completely agree, partly agree) against a gray background.
2. **Given** a preschool card displays a breakdown bar, **When** the user reads the bar, **Then** the bar segments are proportional to the percentage values from the survey data and use color-blind-safe pattern fills from the shared `chart-patterns` library (solid blue for "completely agree", diagonal stripe for "partly agree").
3. **Given** a preschool has no data for a specific question, **When** its card is rendered, **Then** no bar chart is shown and the existing "no data" dash indicator remains.

---

### User Story 2 — Understand the breakdown via legend labels (Priority: P1)

A parent looking at the bar chart needs to understand what each segment represents. A compact legend below the bar labels the two agree categories with their percentage values.

**Why this priority**: Without labels the bar is meaningless — color-blind users especially need the text legend to interpret the chart. This is inseparable from the bar rendering for a usable feature.

**Independent Test**: Can be tested by checking that each bar chart has a legend listing the two agree categories with their percentage values.

**Acceptance Scenarios**:

1. **Given** a comparison card displays a breakdown bar, **When** the user reads below the bar, **Then** a legend lists the two agree categories ("completely agree" and "partly agree") with their percentages.
2. **Given** the user is color-blind, **When** they view the bar and legend, **Then** each category uses a distinct pattern fill (not color alone) and a text label with percentage, making the chart fully interpretable without color vision.

---

### User Story 3 — Screen-reader users access breakdown data (Priority: P1)

A screen-reader user navigating the comparison page must be able to access the same response breakdown data. The bar chart itself is decorative (marked `aria-hidden`), and a screen-reader-only data table (already present in ComparisonCard for the aggregate score) provides the full breakdown.

**Why this priority**: Accessibility is a non-negotiable requirement for this project. The existing sr-only table in ComparisonCard already contains the breakdown — this story ensures the visual bar chart does not break that contract.

**Independent Test**: Can be tested using a screen reader or by inspecting the sr-only table in the DOM — it must contain all five response categories with correct percentages.

**Acceptance Scenarios**:

1. **Given** a screen-reader user navigates to a comparison card, **When** they reach the response data, **Then** a screen-reader-only table provides the full five-category percentage breakdown for that question.
2. **Given** the bar chart SVG is rendered, **When** a screen reader encounters it, **Then** it is skipped because the SVG is marked `aria-hidden="true"`.

---

### Edge Cases

- What happens when an agree category has 0%? The bar segment is not rendered (zero-width), and the legend still lists the category with "0%".
- What happens when a preschool lacks data for the overall assessment group entirely? The card shows the existing "no data" indicator with no bar chart.
- What happens on very narrow screens (320 px)? The bar stretches to full container width using percentage-based scaling (viewBox 0 0 100 N), just like the detail page chart. The legend wraps naturally.
- What happens when only one preschool is selected? The single card still shows the breakdown bar (the single-selection prompt is a separate UI element above the cards).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each comparison card on the comparison page MUST display a horizontal stacked bar chart showing only the two agree categories (completely agree, partly agree) against a neutral gray background, with segment widths proportional to their percentage values.
- **FR-002**: The bar chart MUST use color-blind-safe pattern fills from the shared `chart-patterns` library (solid blue for "completely agree", diagonal stripe for "partly agree") with unique SVG pattern IDs per chart instance.
- **FR-003**: Each bar chart MUST be accompanied by a compact legend listing the two agree categories with their percentage values.
- **FR-004**: The bar chart SVG MUST be marked `aria-hidden="true"` so screen readers skip the visual element.
- **FR-005**: The existing screen-reader-only data table in the comparison card (which already lists all five response categories) MUST remain intact and unmodified.
- **FR-006**: When a preschool has no data for a given question, no bar chart or legend MUST be rendered — the existing "no data" dash MUST remain.
- **FR-007**: The bar chart MUST be responsive, stretching to the full width of its container using percentage-based SVG scaling.
- **FR-008**: The bar chart and legend MUST render correctly in all three supported locales (Swedish, English, Arabic) and MUST respect RTL layout for Arabic.
- **FR-009**: The feature MUST NOT increase total page JavaScript bundle by more than 1 KB (gzipped), since the chart pattern definitions already exist in the codebase.

### Key Entities

- **SurveyResponse**: Contains the percentage fields. The bar chart uses only `completelyAgreePercent` and `partlyAgreePercent` for the two agree segments.
- **Breakdown Bar Chart**: Compact inline SVG bar rendered directly in `ComparisonCard`, using pattern definitions from the shared `chart-patterns` library. Shows only the two agree categories against a gray background.
- **Legend**: Text-based key pairing each agree category with its pattern swatch and percentage, rendered below the bar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of comparison cards (for preschools with data) display a horizontal stacked breakdown bar with correct segment proportions matching the underlying survey JSON.
- **SC-002**: The bar chart uses a focused two-segment format (completely agree + partly agree) with pattern fills from the shared `chart-patterns` library, consistent with the project's visual style.
- **SC-003**: Accessibility audit (axe-core) passes with no new violations introduced by the bar chart addition.
- **SC-004**: Screen-reader-only data table continues to provide the full five-category breakdown for each card.
- **SC-005**: The bar chart renders correctly at viewport widths from 320 px to 430 px (mobile range) with no horizontal overflow or clipped content.
- **SC-006**: Page weight budget (100 KB uncompressed per page) is not exceeded after the change.
- **SC-007**: RTL layout (Arabic locale) renders the bar and legend in the correct reading direction.

## Assumptions

- The bar chart is rendered as inline SVG directly in `ComparisonCard`, using pattern definitions from the shared `chart-patterns` library. `DetailsBarChart` is NOT reused because it renders all 5 categories, whereas the comparison page only needs the 2 agree categories.
- The current comparison page layout has sufficient vertical space to accommodate a bar chart + legend below each card's preschool name/score row without degrading the comparison experience.
- Category labels are already available via the `categoryLabels` prop passed through `ComparisonView` → `ComparisonCard`. Only the first two labels (the agree categories) are used in the legend.
- The bar chart is rendered inline within the existing `ComparisonCard` — no new island hydration boundary or separate component is needed.
