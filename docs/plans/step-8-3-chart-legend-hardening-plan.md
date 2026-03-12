# Plan: Step 8.3 Chart Legend Hardening

Address the Step 8.3 review feedback by eliminating duplicated SVG pattern-rendering logic in `BarChart` and adding coverage that would catch a legend/chart drift regression. Also correct the stale Step 8.2 reference in the top-level `progress.md` status sentence so the memory-bank summary is internally consistent.

## Phases

1. **Phase 1: Add a Drift Regression Guard**
   - **Objective**: Add coverage that compares the rendered legend swatch patterns against the main chart patterns so legend/chart drift would be caught.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: a Step 8.3 follow-up Playwright contract asserting that each legend swatch pattern mirrors the corresponding chart pattern structure for all five response categories
   - **Steps**:
     1. Add a focused Step 8.3 structural-equivalence regression to the existing chart-legend test block.
     2. Run targeted comparison-page coverage to validate the new contract.

2. **Phase 2: Remove Pattern Markup Duplication**
   - **Objective**: Eliminate the root cause of drift by sharing the pattern-markup rendering between chart defs and legend swatch defs.
   - **Files/Functions to Modify/Create**: `src/components/preact/BarChart.tsx`
   - **Tests to Write**: no additional tests beyond the new regression; use the Step 8.3 tests as acceptance targets
   - **Steps**:
     1. Extract shared pattern-markup rendering into a typed helper within `BarChart.tsx`.
     2. Reuse that helper for both chart pattern defs and legend swatch pattern defs.
     3. Re-run targeted comparison-page coverage and full validation.

3. **Phase 3: Fix Status-Sentence Drift and Sync Tracking**
   - **Objective**: Correct the stale Step 8.2 wording in the memory-bank progress summary and update task/completion tracking for this hardening follow-up.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/progress.md`, memory-bank task tracking files, completion artifact
   - **Tests to Write**: none
   - **Steps**:
     1. Update the top-level `progress.md` status sentence to reference Step 8.3 accurately.
     2. Sync memory-bank task/index/context files for the follow-up.
     3. Write the completion artifact.
