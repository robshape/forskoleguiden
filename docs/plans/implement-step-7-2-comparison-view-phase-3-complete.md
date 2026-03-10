# Phase 3 Complete: Render the Comparison Table and Verify

Phase 3 finished the Step 7.2 comparison rendering by turning the shell stub into a real Helhetsbedömning results table. The final revision also brought the one-selected-preschool state into compliance with the original requirement by showing both the prompt and the selected preschool's results.

**Files created/changed**:

- src/components/preact/ComparisonView.tsx
- tests/e2e/comparison-page-route-shell.spec.ts
- tests/unit/i18n-swedish-copy-contract.test.ts

**Functions created/changed**:

- ComparisonView 1-selected and 2–5 selected rendering path
- comparison page selection state contracts

**Tests created/changed**:

- one-preschool state shows a single-selection prompt and that preschool results
- three-preschool state renders comparison table with preschool columns, question rows, and agree-share percentages
- Swedish copy contract includes compare.singleSelectionPrompt

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: feat: render preschool comparison table

- render Helhetsbedomning agree-share results in ComparisonView
- show one-school results alongside the add-more prompt
- lock comparison page states with Playwright and copy contracts
