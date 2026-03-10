# Phase 2 Complete: Harden the one-preschool clear-state path

The comparison-page spec now proves that clearing a one-preschool comparison returns the user to the empty state without leaving `/sv/jamfor/`. This phase also tightened the real-UI-flow compare-button locator so the test remains stable across the selected-state label change.

**Files created/changed**:

- tests/e2e/comparison-page-route-shell.spec.ts

**Functions created/changed**:

- clearing one-preschool selection via compare tray stays on comparison page and shows empty state
- comparison page empty-state and single-selection UI flow test locator refinement

**Tests created/changed**:

- clearing one-preschool selection via compare tray stays on comparison page and shows empty state
- empty-state back-link navigates to directory; one preschool selected via real UI and opened via tray CTA shows single-selection prompt and results table

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: harden single-school comparison clearing
