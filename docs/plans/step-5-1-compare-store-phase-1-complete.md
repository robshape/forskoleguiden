# Phase 1 Complete: Define Compare Store Tests

Phase 1 added the failing unit tests that define the Step 5.1 compare-store contract before any store implementation exists. The tests currently fail for the expected missing-module reason, and review confirmed the change stays strictly within the approved test-only scope.

**Files created/changed**:

- tests/unit/compare-store-state-behavior.test.ts

**Functions created/changed**:

- importCompareState
- clearBrowserGlobals
- createSessionStorage

**Tests created/changed**:

- compare store state behavior should stay SSR-safe without browser globals and handle default, toggle, clear, and max-cap behavior
- compare store state behavior should hydrate compare IDs from sessionStorage when persisted state exists before module evaluation

**Review Status**: APPROVED

**Git Commit Message**: test: define compare store behavior
