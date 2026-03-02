# Plan: Implement Step 3.5 Design Foundations

This plan completes the remaining Step 3.5 requirements by adding missing test contracts first, applying minimal shell/style changes, and validating against targeted and required project gates. The goal is strict compliance with the implementation-plan spec while preserving current shell hardening decisions.

## Phases

1. **Phase 1: Add Missing Step 3.5 Contracts**
   - **Objective**: Encode the missing requirements as failing tests before any implementation changes.
   - **Files/Functions to Modify/Create**: `tests/unit/base-layout.test.ts`, `tests/unit/global-styles-phase-a.test.ts`
   - **Tests to Write**: `BaseLayout viewport meta includes viewport-fit=cover`, `global styles include explicit link interaction defaults`
   - **Steps**:
     1. Add a unit assertion that fails unless viewport meta includes `viewport-fit=cover`.
     2. Add a unit assertion that fails unless explicit global link interaction defaults exist.
     3. Run targeted tests to confirm red state.

2. **Phase 2: Implement Minimal Step 3.5 Fixes**
   - **Objective**: Apply minimal, focused code changes to satisfy the failing contracts.
   - **Files/Functions to Modify/Create**: `src/layouts/BaseLayout.astro`, `src/styles/global.css`
   - **Tests to Write**: No new tests; satisfy Phase 1 contracts.
   - **Steps**:
     1. Update viewport meta content to include `viewport-fit=cover`.
     2. Add explicit global link interaction defaults (subtle transitions and hover color behavior) while avoiding global hover underline side effects.
     3. Re-run targeted tests to confirm green state.

3. **Phase 3: Validate Quality Gates and Sync Project Memory**
   - **Objective**: Confirm no regressions and synchronize memory-bank/project tracking for completed Step 3.5 implementation.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, optional task tracking files if needed
   - **Tests to Write**: No new tests; run validation commands.
   - **Steps**:
     1. Run targeted validations (`unit`, `build`, `e2e`) for Step 3.5 and shell/redirect contracts.
     2. Run required project gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
     3. Update memory-bank context to reflect Step 3.5 completion and validation evidence.

## Open Questions

1. Link interaction default choice: Option A (selected) subtle color/transition defaults without global underline, or Option B global hover underline.
