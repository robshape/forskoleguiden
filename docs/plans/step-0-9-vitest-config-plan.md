# Plan: Step 0.9 Vitest Config

Implement Step 0.9 by adding a root Vitest configuration and a unit smoke test using the required include pattern and TypeScript path aliases. Validate completion by running `pnpm test` successfully.

## Phases

1. **Phase 1: Red Baseline and Test Harness**
   - **Objective**: Establish a failing baseline and wire the initial Vitest test harness.
   - **Files/Functions to Modify/Create**: `vitest.config.ts`, `tests/unit/smoke.test.ts`.
   - **Tests to Write**: `tests/unit/smoke.test.ts` (initially failing assertion).
   - **Steps**:
     1. Run `pnpm test` to capture the current red state (no tests/config in place).
     2. Create `vitest.config.ts` using the typed helper from `vitest/config` with `test.include` set to `['tests/unit/**/*.test.ts']` and aliases matching `tsconfig.json`.
     3. Create `tests/unit/smoke.test.ts` with one intentionally failing assertion and run `pnpm test` to confirm red.

2. **Phase 2: Green the Smoke Test**
   - **Objective**: Make the smoke test pass with the minimal required code change.
   - **Files/Functions to Modify/Create**: `tests/unit/smoke.test.ts`.
   - **Tests to Write**: Update smoke assertion to pass.
   - **Steps**:
     1. Update `tests/unit/smoke.test.ts` assertion to passing state.
     2. Run `pnpm test` and confirm green.
     3. Verify test discovery is constrained to `tests/unit/**/*.test.ts`.

3. **Phase 3: Acceptance Verification and Handoff**
   - **Objective**: Re-run final acceptance checks and document completion artifacts.
   - **Files/Functions to Modify/Create**: `docs/plans/step-0-9-vitest-config-phase-3-complete.md` and related completion artifacts.
   - **Tests to Write**: Final acceptance run of `pnpm test`.
   - **Steps**:
     1. Re-run `pnpm test` as final acceptance validation.
     2. Record changed files/functions/tests and final status in phase completion docs.
     3. Prepare commit message and pause for user checkpoint.

## Open Questions

1. Config helper import source? **Resolved**: Use typed helper from `vitest/config`.
