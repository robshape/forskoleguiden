# Phase 1 Complete: Add failing Step 6.2 tests

Strengthened the Swedish preschool detail-page contract so Step 6.2 now has an honest red state to drive implementation. The new Playwright coverage fails only because the page still omits four canonical response labels and most response percentages.

**Files created/changed**:

- tests/e2e/preschool-detail-page-contract.spec.ts

**Functions created/changed**:

- Swedish preschool detail page Playwright contract cases in `tests/e2e/preschool-detail-page-contract.spec.ts`

**Tests created/changed**:

- detail page renders all five canonical Helhetsbedömning response labels
- detail page renders exact response percentages per Helhetsbedömning question including zero values

**Review Status**: APPROVED

**Git Commit Message**: test: strengthen detail page response contract

- replace weak percentage smoke test with full label assertions
- verify exact Helhetsbedomning values for the canonical preschool
- keep the change scoped to failing Step 6.2 coverage
