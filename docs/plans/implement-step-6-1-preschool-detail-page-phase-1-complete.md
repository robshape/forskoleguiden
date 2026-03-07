# Phase 1 Complete: Add failing Step 6.1 tests

Added dedicated failing e2e coverage that defines the missing Swedish preschool detail-page contract for Step 6.1. The new tests fail for the expected reason: the detail route does not exist yet, so the implementation work can now target explicit acceptance criteria instead of inferred behavior.

**Files created/changed**:

- tests/e2e/preschool-detail-page-contract.spec.ts

**Functions created/changed**:

- None

**Tests created/changed**:

- all preschool detail pages are generated and reachable
- detail page renders preschool name as h1
- detail page renders address and operator type metadata
- detail page renders the survey year
- detail page renders Helhetsbedömning section heading and question texts
- detail page renders survey response percentage values
- detail page renders an interactive CompareButton for the preschool

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: add preschool detail page contract

- add failing e2e coverage for Swedish preschool detail pages
- assert build generation and key detail-page metadata
- cover compare button interaction for the upcoming route
