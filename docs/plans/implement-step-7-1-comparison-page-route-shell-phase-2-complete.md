# Phase 2 Complete: Implement Comparison Route Shell

Created the Swedish comparison route at `/sv/jamfor/` and mounted a minimal `ComparisonView` island that renders the Step 7.1 shell without pulling Step 7.2 table work forward. The existing build-time route detection in `BaseLayout.astro` now enables the Swedish compare tray CTA as a live link with no tray-specific logic changes.

**Files created/changed**:

- src/pages/sv/jamfor/index.astro
- src/components/preact/ComparisonView.tsx

**Functions created/changed**:

- ComparisonView

**Tests created/changed**:

- comparison route is reachable at /sv/jamfor/ and returns HTTP 200
- comparison page shows empty-state content when no preschools are selected, with a back link to the directory
- tray appears after selecting preschools and shows correct count and live compare CTA link
- tray controls are keyboard reachable and operable

**Review Status**: APPROVED

**Git Commit Message**: feat: add comparison route shell

- add the Swedish /sv/jamfor/ route and empty-state shell
- mount a client-only ComparisonView island for compare state
- enable the existing tray CTA through route availability
