# Plan: Implement Preschool Detail Response Breakdown

Add the full five-category Helhetsbedömning response breakdown to the Swedish preschool detail page using the existing survey data model and i18n labels. The work stays scoped to Step 6.2 by strengthening the detail-page contract first, then rendering the canonical response rows, and finally revalidating the current quality gates.

## Phases

1. **Phase 1: Add failing Step 6.2 tests**
   - **Objective**: Capture the missing five-response detail-page behavior before implementation.
   - **Files/Functions to Modify/Create**: [tests/e2e/preschool-detail-page-contract.spec.ts](tests/e2e/preschool-detail-page-contract.spec.ts)
   - **Tests to Write**: A contract assertion that all five canonical Swedish response labels render on the detail page and a question-scoped assertion that the exact source-data percentages are shown for the canonical preschool.
   - **Steps**:
     1. Replace the weak percentage-presence assertion with question-scoped contract checks.
     2. Assert that all five canonical response labels are visible on the detail page.
     3. Assert that the exact source-data percentages, including zero values, render for both Helhetsbedömning questions.

2. **Phase 2: Render the canonical response breakdown**
   - **Objective**: Update the Swedish preschool detail page to render all five response categories in the required order using i18n as the label source of truth.
   - **Files/Functions to Modify/Create**: [src/pages/sv/forskola/[id].astro](src/pages/sv/forskola/[id].astro)
   - **Tests to Write**: No new tests beyond the failing Phase 1 contract unless a narrow regression guard becomes necessary.
   - **Steps**:
     1. Add a stable ordered mapping from survey response fields to i18n keys.
     2. Render a readable per-question breakdown that shows the canonical Swedish label and percentage for all five categories.
     3. Ensure zero-value percentages render and avoid hardcoded response labels.

3. **Phase 3: Verify and document**
   - **Objective**: Confirm the detail-page contract passes and the repository remains green after the Step 6.2 change.
   - **Files/Functions to Modify/Create**: Step-scoped plan/memory-bank artifacts and any minimal follow-up fixes required by review.
   - **Tests to Write**: None beyond the validation runs.
   - **Steps**:
     1. Run the targeted detail-page e2e spec and confirm the new breakdown behavior passes.
     2. Run `pnpm validate` as required by the repository instructions.
     3. Update the task file, memory bank, and completion artifacts with the verified outcome.

## Open Questions

1. Should Step 6.2 remain covered only by the detail-page e2e contract, or is a separate unit helper warranted for the response-field mapping?
2. Should the question breakdown remain list-based for now, or should it move to table semantics as part of a later chart/accessibility pass?
