# Phase 1 Complete: Stabilize Regression Selectors

Hardened the Step 8.2 Playwright regression so it now targets the semantic chart by accessible name and the pattern nodes by stable id suffixes. The test no longer depends on global chart order or numeric pattern positions.

**Files created/changed**:

- tests/e2e/comparison-page-route-shell.spec.ts

**Functions created/changed**:

- comparison charts expose five distinct pattern types: neutral has dot, partly-disagree uses horizontal line, completely-disagree uses crosshatch

**Tests created/changed**:

- Step 8.2 chart pattern structure

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: harden chart pattern selectors

- scope the Step 8.2 regression to the semantic chart name
- target chart patterns by stable id suffixes instead of nth selectors
- keep the regression resilient to unrelated DOM-order changes
