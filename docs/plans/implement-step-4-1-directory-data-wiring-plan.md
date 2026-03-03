# Plan: Implement Step 4.1 Directory Data Wiring

Implement Step 4.1 by wiring build-time directory data loading on the Swedish route and rendering a minimal data-derived output while preserving the existing shell structure. This keeps scope strictly to Step 4.1 and avoids pulling in Step 4.2+ UI work early.

## Phases

1. **Phase 1: Add failing page-data behavior test**
   - **Objective**: Establish a red test proving `/sv/` does not yet render directory data.
   - **Files/Functions to Modify/Create**: `tests/e2e/step-4-1-directory-data.spec.ts` (new)
   - **Tests to Write**: E2E test that expects at least one known preschool name from data to be visible on `/sv/`.
   - **Steps**:
     1. Add a focused e2e test for directory data visibility on `/sv/`.
     2. Run the targeted test to confirm it fails before implementation.
     3. Keep test scope minimal and non-overlapping with existing shell specs.

2. **Phase 2: Implement route-level build-time data assembly**
   - **Objective**: Load index + per-preschool surveys at build time and compute scores in `src/pages/sv/index.astro`.
   - **Files/Functions to Modify/Create**: `src/pages/sv/index.astro` (update), reuse `getPreschoolIndex`, `getPreschoolSurvey`, `computeOverallScore`
   - **Tests to Write**: Reuse Phase 1 e2e test as the acceptance driver for green.
   - **Steps**:
     1. Add frontmatter data assembly using index entries mapped to survey + score.
     2. Keep `BaseLayout locale="sv"` and preserve existing shell semantics.
     3. Render a minimal data section showing directory entries with score-safe output.

3. **Phase 3: Verify and run required gates**
   - **Objective**: Confirm Step 4.1 acceptance and repository quality requirements.
   - **Files/Functions to Modify/Create**: none
   - **Tests to Write**: none
   - **Steps**:
     1. Re-run targeted e2e test and confirm pass.
     2. Run `pnpm build` and confirm `dist/sv/index.html` is non-empty.
     3. Run `pnpm lint`, `pnpm lint:md`, `pnpm format`, and `pnpm test`.

## Open Questions

1. Should Step 4.1 output include only names and scores, or also address/operator fields?
2. Should Step 4.1 preserve index order until Step 4.3 introduces ranking order in the UI?
