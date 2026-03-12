# Plan: Step 8.3 Chart Legend

Add a visual legend to each comparison `BarChart` instance so every pattern swatch is mapped to its canonical response label. The legend should sit between the SVG chart and the existing data table, reuse the already-threaded category labels, and remain strictly within Step 8.3 scope.

## Phases

1. **Phase 1: Failing Legend Contract**
   - **Objective**: Prove that each comparison chart renders a visible legend with all five canonical Swedish response labels.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: a Step 8.3 Playwright contract that asserts each chart renders a legend containing the five response labels and a visible swatch per category
   - **Steps**:
     1. Add a focused Step 8.3 legend regression to the comparison-page Playwright spec.
     2. Seed the comparison flow with selected preschools and navigate to `/sv/jamfor/`.
     3. Assert each rendered chart exposes a legend with the five canonical labels and swatch markup.
     4. Run the targeted spec first to confirm the expected failing state.

2. **Phase 2: Implement Legend Rendering**
   - **Objective**: Render a chart legend in `BarChart` without changing the existing chart or table semantics.
   - **Files/Functions to Modify/Create**: `src/components/preact/BarChart.tsx`
   - **Tests to Write**: no additional tests beyond the new Step 8.3 regression; use existing chart contracts as safety rails
   - **Steps**:
     1. Add legend markup between the SVG and the data table.
     2. Render one legend item per canonical response category using the existing response-series metadata.
     3. Use small inline SVG swatches with locally-scoped pattern definitions so the visual encoding matches the chart patterns.
     4. Re-run the targeted Step 8.3 regression to confirm the implementation turns green.

3. **Phase 3: Validate and Sync Context**
   - **Objective**: Verify the change set and update project tracking after the feature is complete.
   - **Files/Functions to Modify/Create**: memory-bank files as needed for completion tracking
   - **Tests to Write**: none
   - **Steps**:
     1. Run `pnpm validate`.
     2. Update memory-bank task/progress state for Step 8.3.
     3. Write the completion summary artifact.
