# Phase 2 Complete: Implement tray island and mount it globally

Phase 2 implemented the compare tray as a global Preact island mounted from the shared layout and wired to the existing compare store. The tray now appears when selections exist, shows the selected count, disables the compare CTA until the comparison route exists, clears selections, and reserves enough document space to keep footer content visible above the fixed tray.

**Files created/changed**:

- src/components/preact/CompareTray.tsx
- src/layouts/BaseLayout.astro

**Functions created/changed**:

- CompareTray

**Tests created/changed**:

- tray is not visible when no preschools are selected
- tray appears after selecting preschools and shows correct count and disabled compare CTA
- clear button hides the tray and resets all compare-button pressed states
- tray controls are keyboard reachable and operable

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: feat: add global compare tray
