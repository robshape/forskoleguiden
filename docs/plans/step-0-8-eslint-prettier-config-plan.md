# Plan: Step 0.8 ESLint + Prettier Config

Implement Step 0.8 by introducing a flat ESLint configuration with TypeScript and Astro support, plus a Prettier configuration using the Astro plugin. Verify completion by running `pnpm lint` and `pnpm format` successfully.

## Phases

1. **Phase 1: Baseline Red Checks**
   - **Objective**: Capture the current lint/format baseline and confirm Step 0.8 failure mode before implementation.
   - **Files/Functions to Modify/Create**: None.
   - **Tests to Write**: Command-based baseline checks for `pnpm lint` and `pnpm format`.
   - **Steps**:
     1. Run `pnpm lint` and capture the expected failure caused by missing ESLint configuration.
     2. Run `pnpm format` to confirm current formatting command behavior before config changes.
     3. Record baseline outcomes for comparison after implementation.

2. **Phase 2: Implement Flat Configs**
   - **Objective**: Add minimal configuration required to satisfy Step 0.8.
   - **Files/Functions to Modify/Create**: `eslint.config.js`, `.prettierrc`, `package.json` (dev dependencies only if needed).
   - **Tests to Write**: Post-change lint/format checks proving green status.
   - **Steps**:
     1. Add `eslint.config.js` in flat-config format with TypeScript + Astro coverage.
     2. Add `.prettierrc` including `prettier-plugin-astro` and consistent style rules.
     3. Add direct pinned dev dependencies for TypeScript linting support if required.
     4. Run `pnpm lint` and `pnpm format` and resolve only Step 0.8-related issues.

3. **Phase 3: Final Verification and Handoff**
   - **Objective**: Confirm acceptance criteria and produce completion artifacts.
   - **Files/Functions to Modify/Create**: `docs/plans/step-0-8-eslint-prettier-config-phase-3-complete.md` and plan completion files.
   - **Tests to Write**: Final acceptance run for `pnpm lint` and `pnpm format`.
   - **Steps**:
     1. Re-run `pnpm lint` and `pnpm format` as final acceptance checks.
     2. Document outcomes and list changed files.
     3. Prepare commit message for user checkpoint.

## Open Questions

1. Use explicit direct dev dependencies for TS lint support? **Resolved**: Yes, add pinned direct dependencies.
2. Prettier style defaults for this step? **Resolved**: `singleQuote: true` and `semi: false`.
