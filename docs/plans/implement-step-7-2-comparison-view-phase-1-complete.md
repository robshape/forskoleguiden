# Phase 1 Complete: Lock Comparison Contracts

Phase 1 added the failing Playwright coverage that defines the missing Step 7.2 behaviors. The comparison-page shell tests still pass, while the new single-selection prompt and three-preschool table tests fail cleanly because the current UI does not render those elements yet.

**Files created/changed**:

- tests/e2e/comparison-page-route-shell.spec.ts

**Functions created/changed**:

- comparison page selection state contracts

**Tests created/changed**:

- one-preschool state shows a single-selection prompt and no comparison table
- three-preschool state renders comparison table with preschool columns, question rows, and agree-share percentages

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: add comparison page contracts

- add failing Step 7.2 selection-state coverage
- lock single-school prompt behavior on /sv/jamfor/
- lock three-school comparison table expectations
