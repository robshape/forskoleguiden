# Plan: Step 8.2 Chart Pattern Refinement

Implement the missing grayscale-safe SVG pattern variants in the existing comparison chart so all five response categories remain distinguishable without color. This stays intentionally small: one failing-first e2e contract, one focused `BarChart` refactor, and full repo validation.

## Phases

1. **Phase 1: Add Step 8.2 Regression Coverage**
   - **Objective**: Lock the missing pattern requirements into a failing test before changing production code.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: `comparison charts expose five distinct pattern types for the five response categories`
   - **Steps**:
     1. Add a focused comparison-page e2e test that seeds known preschools and opens `/sv/jamfor/`.
     2. Assert the first chart has five `<pattern>` definitions.
     3. Assert the neutral pattern contains dots, the partly-disagree pattern uses horizontal lines, and the completely-disagree pattern uses crosshatch.
     4. Run the targeted Playwright test and confirm it fails for the intended missing-pattern reasons.

2. **Phase 2: Implement the Pattern Palette**
   - **Objective**: Refactor the chart pattern model so all five categories have unique SVG encodings and a color-blind-safe palette.
   - **Files/Functions to Modify/Create**: `src/components/preact/BarChart.tsx`
   - **Tests to Write**: No new tests beyond Phase 1; use the failing contract as the acceptance target.
   - **Steps**:
     1. Replace the current limited `PatternDef` shape with a pattern model that can express solid, diagonal, dots, horizontal lines, and crosshatch.
     2. Update the `<defs>` renderer to emit the correct SVG primitives for each category.
     3. Adjust the partly-disagree color toward the Step 8.2 orange family while keeping the rest of the palette distinct.
     4. Re-run the targeted Playwright test and confirm it passes.

3. **Phase 3: Validate and Close**
   - **Objective**: Prove the change is stable across the existing quality gates and document completion.
   - **Files/Functions to Modify/Create**: no additional product files expected unless review requires a small follow-up
   - **Tests to Write**: none
   - **Steps**:
     1. Run `pnpm validate`.
     2. Review the implementation against the Step 8.2 acceptance criteria.
     3. Write the phase completion and overall completion documents.
     4. Return the result with a copy-ready commit message.

## Open Questions

1. Use a ColorBrewer-style orange for `partly disagree` to match the Step 8.2 spec exactly? Recommendation: yes.
2. Keep the existing 8×8 pattern tile unless the dot pattern is too subtle in review? Recommendation: yes, unless the first implementation is visually weak.
