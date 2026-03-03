# Phase 2 Complete: Implement `PreschoolCard` component

Created the reusable Astro card component for Step 4.2 with the required static structure and prop contract, while intentionally leaving `/sv/` integration for Phase 3. The component now encapsulates detail-link routing, operator badge rendering, score presentation, and compare-button placeholder markup.

**Files created/changed**:

- `src/components/astro/PreschoolCard.astro`
- `docs/memory-bank/activeContext.md`
- `docs/memory-bank/progress.md`

**Functions created/changed**:

- `Props` interface in `src/components/astro/PreschoolCard.astro`
- `detailPageHref`
- `operatorLabel`
- `scorePercentText`
- `scoreBadgeToneClass`

**Tests created/changed**:

- No test files changed in this phase (Phase 1 e2e remains intentionally red until Phase 3 wiring)

**Review Status**: APPROVED

**Git Commit Message**: feat: add reusable preschool card component
