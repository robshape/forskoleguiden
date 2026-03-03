# Phase 1 Complete: Add failing Step 4.2 acceptance e2e test

Added a new Step 4.2 acceptance e2e test that enforces the preschool card contract on `/sv/` before implementation work begins. The test is intentionally red against current Step 4.1 markup, confirming TDD fail-first behavior.

**Files created/changed**:

- `tests/e2e/step-4-2-card-acceptance.spec.ts`

**Functions created/changed**:

- `test('given /sv/ directory when rendered then each preschool card shows required fields and detail link', ...)`

**Tests created/changed**:

- `given /sv/ directory when rendered then each preschool card shows required fields and detail link`

**Review Status**: APPROVED

**Git Commit Message**: test: add step 4.2 card acceptance guard
