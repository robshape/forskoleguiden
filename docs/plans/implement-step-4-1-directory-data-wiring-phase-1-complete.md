# Phase 1 Complete: Add failing page-data behavior test

Phase 1 established a focused e2e contract for Step 4.1 and completed the red-to-green loop by wiring build-time Malmö directory data into `/sv/`. The page now visibly renders preschool entries with computed overall scores while preserving the existing shell structure.

**Files created/changed**:

- `tests/e2e/step-4-1-directory-data.spec.ts`
- `src/pages/sv/index.astro`

**Functions created/changed**:

- Build-time directory mapping in `src/pages/sv/index.astro` using `getPreschoolIndex()`, `getPreschoolSurvey(id)`, and `computeOverallScore()`

**Tests created/changed**:

- `renders at least one preschool from Malmö directory data on /sv/` in `tests/e2e/step-4-1-directory-data.spec.ts`

**Review Status**: APPROVED

**Git Commit Message**: feat: wire sv directory data for step 4.1
