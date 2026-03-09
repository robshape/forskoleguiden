# Plan: Restore pnpm check Node types

Restore `pnpm check` by fixing the missing Node.js type dependency at the root instead of patching individual files. The work stays narrow: pin the latest safe exact `@types/node` version for the repo's Node 22 baseline, confirm `pnpm check` returns to green, then run the full validation pipeline and sync documentation.

## Phases

1. **Phase 1: Pin Node type dependency**
   - **Objective**: Add the exact Node typings package version needed for TypeScript to resolve Node built-ins and `process` across config, source, and test files.
   - **Files/Functions to Modify/Create**: `package.json`, `pnpm-lock.yaml`
   - **Tests to Write**: None, per user instruction to skip test additions for this fix.
   - **Steps**:
     1. Determine the latest exact `@types/node` release that matches the repo's Node 22 runtime baseline and complies with the workspace release-age policy.
     2. Add the pinned `@types/node` dependency to `package.json`.
     3. Refresh the lockfile with `pnpm` so the dependency is installed and available to Astro/TypeScript.

2. **Phase 2: Restore type-check green state**
   - **Objective**: Verify that the missing Node typings fix clears the current `pnpm check` failures without any unrelated code changes.
   - **Files/Functions to Modify/Create**: `package.json`, `pnpm-lock.yaml`
   - **Tests to Write**: None, per user instruction to skip test additions for this fix.
   - **Steps**:
     1. Run `pnpm check` against the updated dependency graph.
     2. Confirm the previous Node built-in and `process` errors are resolved.
     3. If any residual diagnostics remain, limit changes strictly to the minimum needed to satisfy the existing check contract.

3. **Phase 3: Validate and document recovery**
   - **Objective**: Reconfirm the repo's full quality baseline and update project documentation to reflect the fix.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, `docs/memory-bank/tasks/completed/TASK014-restore-pnpm-check-node-types.md`
   - **Tests to Write**: None, per user instruction to skip test additions for this fix.
   - **Steps**:
     1. Run `pnpm validate` in full after `pnpm check` is green.
     2. Record the regression cause and recovery in the memory bank task tracking.
     3. Prepare the phase-completion and plan-completion artifacts.

## Open Questions

None. The user specified both deviations from the default workflow: skip test additions and pin the latest exact compatible version.
