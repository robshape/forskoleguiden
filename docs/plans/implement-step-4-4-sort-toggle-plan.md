# Plan: Implement Step 4.4 Sort Toggle

Implement Step 4.4 by adding a client-side Preact sort toggle for the Swedish directory page so users can switch between default ranking and alphabetical ordering. The work is split into test-first phases to preserve Step 4.3 contracts while introducing minimal-surface interactivity aligned with the existing Astro shell.

## Phases

1. **Phase 1: Add Failing Sort Toggle E2E Contract**
   - **Objective**: Define the required Step 4.4 behavior in Playwright before implementation.
   - **Files/Functions to Modify/Create**: `tests/e2e/directory-data-rendering.spec.ts`
   - **Tests to Write**: `switches to alphabetical order when A–Ö is selected and restores ranking order when Rankning is selected`
   - **Steps**:
     1. Add a new e2e test that opens `/forskoleguiden/sv/` and asserts the default first preschool in ranking mode.
     2. Add interaction assertions for selecting `A–Ö` and validating alphabetical-first ordering.
     3. Add interaction assertions for selecting `Rankning` and validating ranking-first ordering is restored.
     4. Run the targeted e2e test and confirm it fails before feature code is introduced.

2. **Phase 2: Implement SortToggle Island and Wire Directory Rendering**
   - **Objective**: Implement the interactive sort control and client-side list reordering with ranking as the default state.
   - **Files/Functions to Modify/Create**: `src/components/preact/SortToggle.tsx`, `src/pages/sv/index.astro`
   - **Tests to Write**: Re-run Phase 1 failing e2e as the acceptance test for this phase.
   - **Steps**:
     1. Create `SortToggle` as a `client:load` island with segmented controls for `Rankning` and `A–Ö`.
     2. Pass serializable directory card data from `/sv/` into the island while preserving existing ranking comparator logic.
     3. Render the list through the island and implement deterministic sorting for ranking and alphabetical modes.
     4. Ensure visible rank positions reflect active order and keep existing ranking explanation and card contract intact.
     5. Run the targeted e2e test and confirm it passes.

3. **Phase 3: Regression Hardening and Required Quality Gates**
   - **Objective**: Verify Step 4.4 does not regress card contracts, accessibility semantics, or project quality gates.
   - **Files/Functions to Modify/Create**: `tests/e2e/directory-data-rendering.spec.ts` (if assertion hardening needed), optional minimal updates to related tests.
   - **Tests to Write**: No new tests required unless regressions are discovered; strengthen existing assertions only if needed.
   - **Steps**:
     1. Run targeted e2e regression checks for directory rendering and preschool card contract.
     2. Run required project gates: `pnpm lint`, `pnpm lint:md`, `pnpm check`, `pnpm format`, `pnpm test`.
     3. Resolve only Step 4.4-related regressions with minimal changes.
     4. Confirm all checks are green and summarize completion.

## Open Questions

1. Should rank numbers reflect the currently active sort mode? Chosen assumption: yes, rank positions update to match the visible order for both `Rankning` and `A–Ö`.
