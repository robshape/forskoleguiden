# Phase 3 Complete: Integrate cards on `/sv/` and validate

Integrated the reusable `PreschoolCard` into the Swedish directory route and brought the Step 4.2 acceptance test to green. Revised the e2e assertion strategy to avoid brittle coupling to aria-label copy and list order, while preserving full card-contract coverage.

**Files created/changed**:

- `src/pages/sv/index.astro`
- `tests/e2e/step-4-2-card-acceptance.spec.ts`
- `docs/memory-bank/activeContext.md`
- `docs/memory-bank/progress.md`

**Functions created/changed**:

- `/sv/` directory list rendering now composes `PreschoolCard`
- `test('given /sv/ directory when rendered then each preschool card shows required fields and detail link', ...)`

**Tests created/changed**:

- `tests/e2e/step-4-2-card-acceptance.spec.ts` (stabilized selectors and per-preschool card assertions)

**Review Status**: APPROVED

**Git Commit Message**: feat: render preschool cards on sv directory
