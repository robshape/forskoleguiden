# Plan: Add Husky pre-commit validate hook

Add Husky as a pinned dev dependency, wire it into install via `prepare`, add a committed pre-commit hook that runs `pnpm validate`, and harden CI so the new Husky setup does not run unnecessarily during workflow installs. This is a small infrastructure change, so the work is split into a failing regression guard, the minimal implementation, and final verification.

## Phases

1. **Phase 1: Add failing infrastructure regression coverage**
   - **Objective**: Define the expected Husky contract before changing repo config.
   - **Files/Functions to Modify/Create**: `tests/unit/` infrastructure regression test for Husky package, prepare script, pre-commit hook, and CI disabling.
   - **Tests to Write**: Behavior-focused infrastructure regression test covering the pinned Husky dependency, `prepare` script, `.husky/pre-commit` running `pnpm validate`, and CI workflows disabling Husky where `pnpm install` runs.
   - **Steps**:
     1. Add the failing regression test first.
     2. Run the targeted test to confirm it fails against the current repo state.
     3. Keep assertions narrow so they guard only the intended Husky contract.

2. **Phase 2: Implement Husky integration**
   - **Objective**: Add the actual Husky setup with the smallest correct file changes.
   - **Files/Functions to Modify/Create**: `package.json`, `pnpm-lock.yaml`, `.github/workflows/quality-gates.yml`, `.github/workflows/deploy.yml`, and `.husky/pre-commit`.
   - **Tests to Write**: No new test beyond phase 1; use the existing failing regression test as the acceptance check.
   - **Steps**:
     1. Add pinned `husky` and a `prepare` script in `package.json`.
     2. Create `.husky/pre-commit` to run `pnpm validate`.
     3. Update workflow jobs that run `pnpm install` to set `HUSKY=0`.
     4. Refresh the lockfile with `pnpm install`.
     5. Re-run the targeted regression test to turn it green.

3. **Phase 3: Verify and document**
   - **Objective**: Confirm the repo remains healthy and capture the task state.
   - **Files/Functions to Modify/Create**: Relevant memory-bank/task files if the implementation is completed and approved.
   - **Tests to Write**: None; verification only.
   - **Steps**:
     1. Run `pnpm validate`.
     2. Confirm the targeted Husky regression test and the full validation pass.
     3. Update the relevant memory-bank/task documentation.
     4. Write the phase completion summary and commit message for review.

## Open Questions

1. Include the CI hardening (`HUSKY=0`) along with the hook so adding `prepare` does not make Husky run during workflow installs?
2. Keep the regression coverage as an infrastructure test, matching the repo’s existing infrastructure guard pattern?
