# Plan: Add Comparison SVG Chart

Add a reusable Preact `BarChart` and thread it into the existing comparison page so each Helhetsbedömning question gets an accessible stacked SVG chart. The change stays narrow: reuse the current comparison selection/filtering flow, keep the table-based comparison intact, and add only the i18n/data plumbing the chart needs.

## Phases

1. **Phase 1: Lock Failing Chart Contracts**
   - **Objective**: Add tests that prove the comparison page is missing the Step 8.1 chart structure today.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`, `tests/unit/i18n-swedish-copy-contract.test.ts`
   - **Tests to Write**: comparison page renders accessible SVG chart structure; Swedish copy contract includes `compare.chartAriaLabel`
   - **Steps**:
     1. Write a failing e2e test that seeds comparison state and asserts an SVG chart exists with `role="img"`, an `aria-label`, `<pattern>` defs, `<rect>` segments using pattern fills, and `<title>` text with percentages.
     2. Write a failing i18n contract test for the new chart aria-label key.
     3. Run the targeted tests to confirm they fail for the intended reason.

2. **Phase 2: Implement BarChart and Comparison Integration**
   - **Objective**: Create the chart component and render it inside the existing comparison flow without changing how comparison state works.
   - **Files/Functions to Modify/Create**: `src/components/preact/BarChart.tsx`, `src/components/preact/ComparisonView.tsx`, `src/pages/sv/jamfor/index.astro`, `src/i18n/sv.json`, `src/i18n/en.json`, `src/i18n/ar.json`
   - **Tests to Write**: none beyond making Phase 1 green
   - **Steps**:
     1. Create `BarChart` as a pure render component that accepts ordered `SurveyResponse[]`, preschool labels, question text, the five localized category labels, and a localized aria-label template.
     2. Render inline SVG `<defs>` with five reusable patterns and stacked `<rect>` segments plus per-segment `<title>` elements.
     3. Pass localized chart props from the Astro route into `ComparisonView`, then map each comparison question to both the existing table row data and the new chart.

3. **Phase 3: Verify and Stabilize**
   - **Objective**: Confirm the chart works in the real comparison route and does not regress existing behavior.
   - **Files/Functions to Modify/Create**: same files only if fixes are needed from verification
   - **Tests to Write**: none unless a regression appears during verification
   - **Steps**:
     1. Re-run the targeted unit and e2e tests and confirm they pass.
     2. Run `pnpm validate` to catch lint, type, unit, and build regressions.
     3. Fix any issues found and document the completed work.

## Open Questions

1. Implement strictly Step 8.1 only, or fold in the Step 8.4 fallback table and `noscript` shell at the same time? Recommendation: strict Step 8.1 only for this pass because the existing comparison table already remains available and that keeps scope aligned with the request.
2. For pattern ID uniqueness across multiple charts, use a simple chart index prop or a slug of the question text? Recommendation: a chart index prop because it is deterministic and avoids string-sanitizing edge cases.
