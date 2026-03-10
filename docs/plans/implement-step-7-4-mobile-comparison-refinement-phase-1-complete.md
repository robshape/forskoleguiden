# Phase 1 Complete: Lock the mobile requirement with a failing e2e test

Phase 1 added the missing Step 7.4 Playwright regression for the comparison page at the iPhone 13 mini target viewport. The new test fails for the intended reason: the comparison table lacks a sticky question-label column while horizontally scrolling.

**Files created/changed**:

- docs/plans/implement-step-7-4-mobile-comparison-refinement-plan.md
- tests/e2e/comparison-page-route-shell.spec.ts

**Functions created/changed**:

- comparison page Step 7.4 mobile regression test

**Tests created/changed**:

- mobile viewport (375×812): 4-preschool comparison table is DOM-complete and scroll container overflows horizontally

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: add mobile comparison regression coverage
