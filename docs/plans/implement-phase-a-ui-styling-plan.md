# Plan: Implement Phase A UI Styling

Implement the Phase A styling foundation from `docs/plans/ui-styling.md` with strict, incremental TDD. Each phase adds tests first, implements the minimal styling changes to satisfy those tests, and finishes in a green state so every checkpoint is stable and reviewable.

## Phases

1. **Phase 1: Theme Tokens and Global Interaction Defaults**
   - **Objective**: Implement `A.1` and `A.5` by adding Tailwind v4 theme tokens and global interactive/focus-visible defaults.
   - **Files/Functions to Modify/Create**: `src/styles/global.css`, `tests/unit/global-styles-phase-a.test.ts`
   - **Tests to Write**: `defines Phase A theme tokens for colors, layout width, and tray shadow`, `defines global focus-visible, button, and link interaction defaults`
   - **Steps**:
     1. Add fail-first tests asserting the required token names and global interaction selectors in `global.css`.
     2. Run targeted unit tests to confirm failures.
     3. Implement `@theme` token definitions and global interaction/focus-visible styles in `global.css`.
     4. Re-run targeted unit tests to confirm green.

2. **Phase 2: Base Layout Shell Styling**
   - **Objective**: Implement `A.2` by styling `BaseLayout` body/main structure for background, typography, vertical layout, and centered content container.
   - **Files/Functions to Modify/Create**: `src/layouts/BaseLayout.astro`, `tests/unit/sv-index-layout.test.ts`
   - **Tests to Write**: `applies Phase A body class contract`, `applies main flex and centered max-w-content container contract`
   - **Steps**:
     1. Add fail-first layout contract assertions in `sv-index-layout.test.ts`.
     2. Run targeted tests to confirm failures.
     3. Update `BaseLayout.astro` with minimal class changes/wrapper markup needed for the contract.
     4. Re-run targeted tests to confirm green.

3. **Phase 3: Navigation Shell Styling**
   - **Objective**: Implement `A.3` by styling `Nav` to match mockup shell requirements with RTL-safe logical spacing and chip states.
   - **Files/Functions to Modify/Create**: `src/components/astro/Nav.astro`, `tests/unit/sv-index-layout.test.ts`
   - **Tests to Write**: `applies header/nav visual shell classes`, `applies city chip state classes`, `uses logical spacing utilities for direction-sensitive spacing`
   - **Steps**:
     1. Add fail-first nav style contract assertions.
     2. Run targeted tests to confirm failures.
     3. Implement nav header/top-row/city-chip/year styles using existing semantics and i18n wiring.
     4. Re-run targeted tests to confirm green.

4. **Phase 4: Footer Shell Styling and Validation Gates**
   - **Objective**: Implement `A.4`, add end-to-end focus visibility verification requested by user, and complete `A.6` quality gates.
   - **Files/Functions to Modify/Create**: `src/components/astro/Footer.astro`, `tests/unit/sv-index-layout.test.ts`, `tests/e2e/layout-shell.spec.ts`
   - **Tests to Write**: `applies footer separation and muted/link visual classes`, `uses logical spacing/alignment in footer`, `shows visible keyboard focus ring on key shell links`
   - **Steps**:
     1. Add fail-first unit/e2e assertions for footer style contract and focus visibility.
     2. Run targeted tests to confirm failures.
     3. Implement footer styling with logical spacing and link treatment.
     4. Re-run targeted tests to confirm green.
     5. Run required repository quality gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`, `pnpm build`.

## Open Questions

1. None. The focus e2e assertion scope is approved and included in Phase 4.
