# Plan: Step 0.3 Dev Dependencies

Install the required development tooling dependencies for Step 0.3, verify installation through dependency and CLI checks, and then update project memory to reflect completion and the next focus area.

## Phases

1. **Phase 1: Baseline + Install**
   - **Objective**: Add the exact Step 0.3 development dependencies in one command.
   - **Files/Functions to Modify/Create**: `package.json`, `pnpm-lock.yaml` (command-generated updates only).
   - **Tests to Write**: None for this phase.
   - **Steps**:
     1. Confirm current dependency baseline from `package.json`.
     2. Run the single required install command with `pnpm add -D ...`.
     3. Confirm install completed without command errors.

2. **Phase 2: Verification**
   - **Objective**: Verify all required tools are installed and callable.
   - **Files/Functions to Modify/Create**: None.
   - **Tests to Write**: None for this phase.
   - **Steps**:
     1. Run `pnpm ls --dev --depth 0` and verify all required packages appear.
     2. Run `npx vitest --version` and verify successful output.
     3. Run `npx playwright --version` and verify successful output.

3. **Phase 3: Documentation Sync**
   - **Objective**: Update memory-bank files to reflect Step 0.3 completion and next step.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`.
   - **Tests to Write**: None for this phase.
   - **Steps**:
     1. Document installed dependencies and verification outcomes.
     2. Update active focus to Step 0.4.
     3. Keep wording concise and consistent with existing memory-bank style.

## Open Questions

1. No open questions. Use the exact command and package set from Step 0.3.
