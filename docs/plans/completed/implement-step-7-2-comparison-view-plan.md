# Plan: Implement Step 7.2 Comparison View

This work turns the existing comparison-page shell into a real client-side comparison view by threading build-time survey data into the Astro route, extending the ComparisonView island, and locking the behavior with Playwright first. The approach stays narrow: preserve the current empty state, add the missing single-selection prompt, and render the 2–5 preschool comparison table using the existing compare store and scoring utilities.

## Phases

1. **Phase 1: Lock Comparison Contracts**
   - **Objective**: Add failing end-to-end coverage for the Step 7.2 behaviors before changing implementation.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: single-preschool prompt contract; three-preschool comparison-table contract with expected agree-share values
   - **Steps**:
     1. Extend the existing comparison-page spec instead of creating a new spec.
     2. Add a failing test for the one-selected-preschool state.
     3. Add a failing test for selecting three preschools, opening the comparison page, and asserting three columns, two Helhetsbedömning rows, and correct agree-share percentages.
     4. Run the targeted Playwright spec to confirm the new tests fail for the expected reason.

2. **Phase 2: Wire Comparison Data and Single-Selection State**
   - **Objective**: Pass all survey data and missing copy into the comparison island, then implement the one-selected-preschool view.
   - **Files/Functions to Modify/Create**: `src/pages/sv/jamfor/index.astro`, `src/components/preact/ComparisonView.tsx`, `src/i18n/sv.json`, `src/i18n/en.json`, `src/i18n/ar.json`
   - **Tests to Write**: reuse the failing Playwright single-selection contract from Phase 1
   - **Steps**:
     1. Load all surveys at build time in the Astro route with the existing data loader.
     2. Pass serialized survey data and the new single-selection copy into the island as props.
     3. Split the current non-empty stub branch into `1 selected` and `2+ selected`.
     4. Implement the single-selection prompt and run the targeted spec until that branch passes.

3. **Phase 3: Render the Comparison Table and Verify**
   - **Objective**: Render the side-by-side Helhetsbedömning table for 2–5 selected preschools and confirm the values match seed data.
   - **Files/Functions to Modify/Create**: `src/components/preact/ComparisonView.tsx`, `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: reuse the failing three-preschool comparison contract from Phase 1
   - **Steps**:
     1. Filter the passed surveys by the selected compare IDs while preserving selection order.
     2. Read the Helhetsbedömning group with the existing scoring constant and compute agree-share cells with the existing scoring helper.
     3. Render a mobile-safe `overflow-x-auto` comparison table with stable selectors for Playwright.
     4. Run the targeted comparison spec, then run `pnpm validate` to confirm the full repo stays green.

## Open Questions

1. Column order: selection order, ranking order, or alphabetical. Recommendation: keep selection order because `src/lib/state.ts` already preserves it and the implementation plan does not request re-sorting.
2. Single-preschool scope: minimal prompt only, or richer single-school detail rendering. Recommendation: keep it minimal here and leave richer handling to the later step that explicitly expands single-preschool behavior.
