# Phase 1 Complete: Add Failing Route-Shell Coverage

Added the Step 7.1 e2e contract before implementation so the missing comparison route and the tray CTA state change are both captured as intentional failures. The test suite now has a precise red state for the route shell without pulling in any Step 7.2 comparison-table work.

**Files created/changed**:

- tests/e2e/comparison-page-route-shell.spec.ts
- tests/e2e/compare-tray-interaction.spec.ts

**Functions created/changed**:

- None

**Tests created/changed**:

- comparison route is reachable at /sv/jamfor/ and returns HTTP 200
- comparison page shows empty-state content when no preschools are selected, with a back link to the directory
- tray appears after selecting preschools and shows correct count and live compare CTA link
- tray controls are keyboard reachable and navigate to the comparison route

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: add comparison route shell coverage

- add failing e2e coverage for the /sv/jamfor/ route shell
- update compare tray assertions for live route activation
- confirm red-state failures match missing-route expectations
