# Phase 1 Complete: Add failing tray behavior tests

Phase 1 added Playwright coverage that defines the expected compare-tray behavior before any tray UI implementation exists. The new spec establishes the intended red state for Step 5.3 by proving the tray is missing while the existing compare-button flow still works.

**Files created/changed**:

- tests/e2e/compare-tray-interaction.spec.ts

**Functions created/changed**:

- navigateToDirectory
- getCompareTray
- getDirectoryCard
- getCompareButton
- waitForCompareButtonReady

**Tests created/changed**:

- tray is not visible when no preschools are selected
- tray appears after selecting preschools and shows correct count and compare CTA href
- clear button hides the tray and resets all compare-button pressed states
- tray controls are keyboard reachable and operable

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: add compare tray red-state coverage
