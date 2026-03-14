# Plan: Deterministic Summary Text

Implement Step 9.2 as a narrow formatter layer on top of the existing Step 9.1 summary contract. The work stays scoped to deterministic text generation and tests; it does not yet render the text in the comparison UI, because that belongs to Step 9.3.

## Phases

1. **Phase 1: Lock Summary Copy Contract**
   - **Objective**: Make the localized summary templates capable of expressing the exact Step 9.2 sentence shape, including names and percentages, without hardcoding copy in TypeScript.
   - **Files/Functions to Modify/Create**: `src/i18n/sv.json`, `src/i18n/en.json`, `src/i18n/ar.json`, `tests/unit/i18n-swedish-copy-contract.test.ts`, existing locale-parity tests if needed
   - **Tests to Write**: update Swedish copy contract to require summary placeholders for left name, right name, left percentage, right percentage, and question text
   - **Steps**:
     1. Write a failing test for the required summary placeholder contract.
     2. Update locale summary templates to satisfy the contract.
     3. Re-run the targeted i18n tests to confirm the contract is stable.

2. **Phase 2: Build Summary Text Formatter**
   - **Objective**: Add a dedicated formatter that converts `ComparisonSummary` output into deterministic, localized sentences.
   - **Files/Functions to Modify/Create**: `src/features/comparison/summaryText.ts`, formatter exports, `src/i18n/utils.ts` as the interpolation mechanism
   - **Tests to Write**: `tests/unit/comparison-summary-text-contract.test.ts`
   - **Steps**:
     1. Write failing BDD-style tests for `higher`, `lower`, and `similar` outputs using known summary input.
     2. Implement the formatter with the minimal API needed to map IDs to preschool names and interpolate locale templates.
     3. Re-run the new formatter tests until they pass.

3. **Phase 3: Harden Edge Cases And Validate**
   - **Objective**: Ensure the formatter behaves correctly for empty summaries, multiple questions, multiple pairs, and locale selection.
   - **Files/Functions to Modify/Create**: `src/features/comparison/summaryText.ts`, `tests/unit/comparison-summary-text-contract.test.ts`
   - **Tests to Write**: empty-summary case, multi-question output count, three-school pair expansion, locale smoke coverage
   - **Steps**:
     1. Add failing tests for empty pairs and multi-pair/multi-question output.
     2. Refine the formatter without changing the Step 9.1 data contract.
     3. Run targeted unit tests, then run `pnpm validate` as the final verification for the task.

## Open Questions

1. Should percentages live inside the locale templates or be concatenated in code? Recommendation: keep them in the locale templates with explicit placeholders so copy stays translation-controlled.
2. Should Step 9.2 use the full survey question text or introduce a shorter label? Recommendation: use the full question text for now and defer short labels until there is a real UX need.
3. Confirm scope: implement Step 9.2 only, with no UI rendering yet. Recommendation: keep rendering for Step 9.3 to avoid mixing formatter work with presentation work.
