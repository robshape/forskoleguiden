# Plan: Implement Step 7.4 Mobile Comparison Refinement

This step keeps the existing semantic comparison table and makes it genuinely usable on an iPhone 13 mini viewport by combining horizontal scroll with a sticky question column. The approach satisfies Step 7.4 with minimal risk before Step 8 adds charts and more comparison-page complexity.

## Phases

1. **Phase 1: Lock the mobile requirement with a failing e2e test**
   - **Objective**: Add the missing 375x812 comparison-page regression test before changing production code.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: a mobile comparison test that seeds 4 selected preschools, opens `/sv/jamfor/`, and proves all preschool headers and question data are reachable at 375x812
   - **Steps**:
     1. Add a focused Playwright scenario using `page.setViewportSize({ width: 375, height: 812 })`.
     2. Seed 4 compare IDs through `sessionStorage` to force the narrow-screen overflow case.
     3. Assert the comparison table exists and the scroll container actually overflows horizontally.
     4. Assert all 4 preschool headers and the question rows remain reachable in the DOM, then run the targeted test to confirm it fails first.

2. **Phase 2: Implement the responsive table refinement**
   - **Objective**: Make the current comparison table usable on narrow screens without changing its underlying semantics.
   - **Files/Functions to Modify/Create**: `src/components/preact/ComparisonView.tsx`
   - **Tests to Write**: reuse the failing mobile Playwright contract from Phase 1
   - **Steps**:
     1. Replace the current `w-full` table sizing with `w-auto min-w-full` so horizontal overflow works correctly.
     2. Add explicit minimum widths for preschool columns and reduce the question-column width on mobile.
     3. Make the first column sticky with explicit zebra-row background handling so row labels stay visible while horizontally scrolling.
     4. Harden long-name wrapping for Swedish preschool names so narrow columns remain readable.

3. **Phase 3: Verify the mobile behavior and repo health**
   - **Objective**: Prove the responsive refinement works without regressing existing comparison behavior.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`, optionally `src/styles/global.css` only if utility classes are insufficient
   - **Tests to Write**: no new tests beyond the Phase 1 mobile contract unless a small regression assertion is needed
   - **Steps**:
     1. Run the targeted mobile comparison spec until it passes.
     2. Run the broader comparison-page e2e spec to catch layout regressions in empty, single, and multi-selection states.
     3. Run `pnpm validate` as required by the repo instructions.

## Open Questions

1. Responsive approach: sticky horizontal-scroll table or a separate card-based mobile layout. Recommendation: sticky horizontal-scroll table. It preserves the existing semantic table, matches the Step 7.4 "visible or scrollable" test intent, and avoids duplicating the comparison UI right before Step 8 introduces charts.
