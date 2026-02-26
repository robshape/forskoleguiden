# Plan: Step 0.7 Package Scripts

Add the required package scripts for Step 0.7 in a minimal, targeted way while keeping already-existing scripts intact. The work is sequenced as red-check, script wiring, and validation so each phase is testable and self-contained.

## Phases

1. **Phase 1: Baseline Script Gap Check**
   - **Objective**: Confirm current Step 0.7 script gaps with explicit failing/passing command checks before edits.
   - **Files/Functions to Modify/Create**: No file modifications.
   - **Tests to Write**: Command checks for missing scripts (`pnpm run check`, `pnpm run test`, `pnpm run test:watch`, `pnpm run test:e2e`, `pnpm run lint`, `pnpm run format`).
   - **Steps**:
     1. Run script commands expected by Step 0.7 and capture failures for missing definitions.
     2. Compare current `package.json` scripts against required Step 0.7 scripts.
     3. Freeze edit scope to script definitions only.

2. **Phase 2: Add Required Scripts in package.json**
   - **Objective**: Add all Step 0.7 required scripts exactly while preserving existing scripts.
   - **Files/Functions to Modify/Create**: `package.json` scripts section.
   - **Tests to Write**: Re-run script resolution checks (`pnpm run check`, `pnpm run test`, `pnpm run test:watch`, `pnpm run test:e2e`, `pnpm run lint`, `pnpm run format`) to verify scripts now exist.
   - **Steps**:
     1. Update `package.json` with required scripts: `check`, `test`, `test:watch`, `test:e2e`, `lint`, `format`.
     2. Keep existing `dev`, `build`, `preview`, and existing extra scripts as requested.
     3. Run script commands again to verify command resolution works after edits.

3. **Phase 3: Step 0.7 Acceptance Validation**
   - **Objective**: Execute the exact validation required by Step 0.7.
   - **Files/Functions to Modify/Create**: No file modifications.
   - **Tests to Write**: Acceptance commands `pnpm build` and `pnpm check`.
   - **Steps**:
     1. Run `pnpm build` and verify static build output succeeds.
     2. Run `pnpm check` and verify Astro type-check completes successfully.
     3. Record completion artifacts and summarize results.

## Open Questions

1. No open questions. Existing extra scripts should remain unchanged as requested.
