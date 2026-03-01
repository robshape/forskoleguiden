# Phase 1 Complete: Add failing Step 1.4 tests

Phase 1 established TDD red state for Step 1.4 by adding the required data-loader unit tests before any production implementation. The failing test run is explicitly documented and shows the expected missing-module failure for `@/lib/data`.

**Files created/changed**:

- tests/unit/data.test.ts
- docs/plans/step-1-4-data-loading-utility-phase-1-red-proof.md

**Functions created/changed**:

- `describe('Step 1.4 data-loading utility')`
- `it('returns preschool index from getPreschoolIndex')`
- `it('returns known preschool survey from getPreschoolSurvey')`
- `it('throws a clear error for unknown preschool id')`
- `it('returns all surveys from getAllPreschoolSurveys in index order')`

**Tests created/changed**:

- Step 1.4 unit tests in `tests/unit/data.test.ts`
- Red-state proof command and failing output note in `docs/plans/step-1-4-data-loading-utility-phase-1-red-proof.md`

**Review Status**: APPROVED

**Git Commit Message**: test: add red tests for data loaders
