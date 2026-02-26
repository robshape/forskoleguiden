# Phase 2 Complete: Add Required Scripts in package.json

Phase 2 added all Step 0.7-required package scripts with exact command values while preserving existing scripts already present in the repository. Command-resolution evidence was captured and reviewed, and the phase is approved.

**Files created/changed**:

- package.json
- docs/plans/step-0-7-package-scripts-phase-2-validation.md

**Functions created/changed**:

- None

**Tests created/changed**:

- Script resolution checks documented for: `pnpm run check`, `pnpm run test`, `pnpm run test:watch -- --help`, `pnpm run test:e2e -- --help`, `pnpm run lint`, `pnpm run format -- --check`

**Review Status**: APPROVED

**Git Commit Message**: chore: add step 0.7 package scripts

- Add check, test, test:watch, test:e2e, lint, and format scripts
- Preserve existing dev, build, preview, astro, and lint:md scripts
- Document phase-2 script-resolution validation outcomes
