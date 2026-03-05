# Phase 1 Complete: Add Failing Sort Toggle E2E Contract

Phase 1 established the Step 4.4 behavior contract in Playwright before implementation. The new test confirms expected default ranking behavior and intentionally fails on the missing interactive sort controls, creating a clear RED baseline for Phase 2.

**Files created/changed**:

- tests/e2e/directory-data-rendering.spec.ts

**Functions created/changed**:

- switches to alphabetical order when A–Ö is selected and restores ranking order when Rankning is selected (Playwright test case)

**Tests created/changed**:

- tests/e2e/directory-data-rendering.spec.ts — added Step 4.4 toggle behavior contract test

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: add red contract for directory sort toggle

- Add e2e test for ranking to alphabetical toggle flow
- Assert first preschool changes on A–Ö and resets on Rankning
- Verify RED state until Step 4.4 interactive controls exist
