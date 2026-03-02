# Phase 2 Complete: Implement Minimal Step 3.5 Fixes

Phase 2 implemented the remaining Step 3.5 code changes required by the fail-first contracts: safe-area viewport compatibility in the base layout and explicit, subtle global link interaction defaults. Targeted Step 3.5 tests are now green.

**Files created/changed**:

- src/layouts/BaseLayout.astro
- src/styles/global.css

**Functions created/changed**:

- BaseLayout viewport meta content updated to include `viewport-fit=cover`
- Global link base interaction defaults in `@layer base` (`a` transition + `a:hover` color shift)

**Tests created/changed**:

- No new tests in this phase
- Verified existing contracts pass:
  - `tests/unit/base-layout.test.ts`
  - `tests/unit/global-styles-phase-a.test.ts`

**Review Status**: APPROVED

**Git Commit Message**: fix: complete Step 3.5 shell defaults

- Add viewport safe-area support via `viewport-fit=cover`
- Add explicit global link interaction defaults in base styles
- Keep hover behavior subtle and avoid global underline side effects
