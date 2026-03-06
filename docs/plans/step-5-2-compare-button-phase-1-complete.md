# Phase 1 Complete: Lock Compare Button Behavior With Tests

Phase 1 added the failing tests that define the Step 5.2 compare-button contract before any UI implementation exists. The browser test now captures selected and deselected button behavior with `aria-pressed` semantics, and review confirmed the scope stays limited to Phase 1 test work.

**Files created/changed**:

- tests/e2e/directory-data-rendering.spec.ts
- tests/unit/i18n-swedish-copy-contract.test.ts

**Functions created/changed**:

- getDirectoryCard

**Tests created/changed**:

- Swedish directory data rendering contracts selects two preschool compare buttons and deselects one while keeping pressed-state semantics in sync
- Swedish translation keys should have all required namespaces, key paths, and approved Swedish copy

**Review Status**: APPROVED

**Git Commit Message**: test: define compare button behavior
