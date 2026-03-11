# Phase 1 Complete: Add Step 8.2 Regression Coverage

Added a focused failing Playwright regression that proves the comparison chart still lacks the full five-pattern Step 8.2 encoding set. The test now locks the missing dot, horizontal-line, and crosshatch requirements before any production chart code changes.

**Files created/changed**:

- tests/e2e/comparison-page-route-shell.spec.ts

**Functions created/changed**:

- comparison charts expose five distinct pattern types: neutral has dot, partly-disagree uses horizontal line, completely-disagree uses crosshatch

**Tests created/changed**:

- Step 8.2 chart pattern structure

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: add chart pattern regression coverage

- add failing Step 8.2 comparison-chart pattern assertions
- verify missing dot, horizontal-line, and crosshatch encodings
- keep production files unchanged before the palette refactor
