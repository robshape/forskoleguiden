# Plan: Deterministic Comparison Summary Logic

Add the Step 9.1 comparison-summary engine behind a small public API, using the existing scoring primitives in [src/lib/scoring.ts](src/lib/scoring.ts) and the current comparison data shape in [src/components/preact/ComparisonView.tsx](src/components/preact/ComparisonView.tsx). The plan is test-first and keeps rendering out of scope so Step 9.2 can build on a stable summary contract.

## Phases

1. **Phase 1: Establish Summary Contract**
   - **Objective**: Define the Step 9.1 public API through a first failing unit test and the minimal summary types needed for a two-school comparison.
   - **Files/Functions to Modify/Create**: new comparison summary module under `src/features/comparison/`; a new unit test file in `tests/unit/`
   - **Tests to Write**: a behavior test that a 6-point delta is classified as `higher` and the inverse side is represented correctly by the summary data shape
   - **Checkpoint**: Completed 2026-03-14. Added `computeSummary(surveys)` with the initial summary types and a first contract test for a two-school `higher` classification.
   - **Steps**:
     1. Write one failing BDD-style unit test for a simple two-school, one-question case.
     2. Add the minimal exported types and `computeSummary(surveys)` signature needed to satisfy that test.
     3. Implement the minimal logic using `computeAgreeShare` and `OVERALL_ASSESSMENT_GROUP`.
     4. Re-run the targeted unit test and refactor names only if needed.

2. **Phase 2: Expand Pairwise Coverage**
   - **Objective**: Grow the summary logic to cover the full Step 9.1 contract for threshold behavior, multiple questions, and three-school comparisons.
   - **Files/Functions to Modify/Create**: the new comparison summary module; the new comparison summary unit test file
   - **Tests to Write**: `higher` at threshold, `lower` at threshold, `similar` below threshold, and three-school pair generation across all Helhetsbedömning questions
   - **Checkpoint**: Completed 2026-03-14. Generalized the contract to all unique pairwise comparisons and added threshold plus multi-question coverage.
   - **Steps**:
     1. Add the next failing test for exact-threshold and below-threshold classification.
     2. Add the next failing test for three surveys producing all expected pair comparisons.
     3. Extend `computeSummary` incrementally to satisfy each new test without adding rendering concerns.
     4. Refactor duplicated test fixtures and internal loops once all new tests are green.

3. **Phase 3: Harden Edge Cases and Verify**
   - **Objective**: Lock down non-happy-path behavior and validate the feature against the repo’s quality bar.
   - **Files/Functions to Modify/Create**: the new comparison summary module; the same unit test file; possibly memory-bank docs if the implementation changes project context materially
   - **Tests to Write**: fewer-than-two-surveys returns an empty summary; missing or unmatched Helhetsbedömning data is skipped deterministically
   - **Checkpoint**: Completed 2026-03-14. Locked the invariant that only pairs with at least one matched question are emitted and finished with a green `pnpm validate` run.
   - **Steps**:
     1. Add failing tests for empty or partial comparison inputs.
     2. Implement the smallest defensive behavior needed to make those tests pass.
     3. Run the targeted unit suite, then `pnpm validate`.
     4. Summarize the phase result and hand it to review before moving on.

## Final Contract

1. Each preschool pair is emitted once as a unique combination with one directional classification per question.
2. The question set is anchored to the first selected survey's `Helhetsbedömning` group so the summary engine explains the same question rows the comparison UI renders in [src/components/preact/ComparisonView.tsx](src/components/preact/ComparisonView.tsx).
3. If the first selected survey has no `Helhetsbedömning` group, the summary is empty.
4. Pairs with zero matched questions are omitted entirely.
