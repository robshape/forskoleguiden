# Plan: Implement Step 4.2 Preschool Card

Build a reusable Astro card component for each preschool on the Swedish directory page, then wire the page to use it while keeping scope strictly limited to Step 4.2. The work follows strict TDD per phase: write failing tests first, add minimal code, and re-run tests to green.

## Phases

1. **Phase 1: Add failing Step 4.2 acceptance e2e test**
   - **Objective**: Lock in Step 4.2 rendering requirements before component implementation.
   - **Files/Functions to Modify/Create**: `tests/e2e/step-4-2-preschool-cards.spec.ts`
   - **Tests to Write**:
     - `renders at least five preschool cards with required content and detail links`
   - **Steps**:
     1. Add a new e2e test for `/sv/` that asserts at least five preschool cards are rendered.
     2. Assert each card contains name, address, operator label, score text, and a name link following `/sv/forskola/{id}/`.
     3. Run only the new test and verify it fails against current Step 4.1 markup.

2. **Phase 2: Implement `PreschoolCard` component**
   - **Objective**: Create the new Astro card component with Step 4.2 structure and static compare placeholder.
   - **Files/Functions to Modify/Create**: `src/components/astro/PreschoolCard.astro`
   - **Tests to Write**: No additional test file; satisfy Phase 1 failing test.
   - **Steps**:
     1. Implement card props: `id`, `name`, `address`, `operatorType`, `score`, `locale`.
     2. Render required card parts: detail link, address, operator badge, score content, and static compare button with `data-id`.
     3. Reuse existing theme tokens and keep behavior static (no Step 5 interactivity).

3. **Phase 3: Integrate cards on `/sv/` and run quality gates**
   - **Objective**: Replace minimal list row rendering with the reusable card and validate project checks.
   - **Files/Functions to Modify/Create**: `src/pages/sv/index.astro` (and locale files only if new copy keys become necessary)
   - **Tests to Write**: Update/adjust selectors only if needed for current e2e files.
   - **Steps**:
     1. Use `PreschoolCard` when rendering `preschoolDirectory` entries.
     2. Re-run the Step 4.2 e2e test and confirm it passes.
     3. Run `pnpm lint`, `pnpm lint:md`, `pnpm format`, and `pnpm test`.

## Open Questions

1. **Score nullability in card props**: keep strict `number` or accept `number | null` from current data path? Recommendation: use `number | null` to preserve current `computeOverallScore` behavior safely.
2. **Static compare button label for Step 4.2**: use `directory.addToCompare` or short `Jämför` label? Recommendation: use existing `directory.addToCompare` key now, then introduce selected-state copy in Step 5.2.
