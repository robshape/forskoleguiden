# Plan: Step 1.2 Malmö index seed data

Implement Step 1.2 with strict TDD: add a failing unit test for the Malmö index contract, create official-name seed data for five preschools from Malmö 2025 survey results, then validate quality gates and update project memory records.

## Phases

1. **Phase 1: Add Step 1.2 contract test and data**
   - **Objective**: Create a unit test that enforces Step 1.2 and implement `data/malmo/index.json` to satisfy it.
   - **Files/Functions to Modify/Create**: `tests/unit/malmo-index.test.ts`, `data/malmo/index.json`
   - **Tests to Write**: `Step 1.2 Malmö index: has >=5 preschools, required keys, valid operator types`
   - **Steps**:
     1. Add a new test file that reads and parses `data/malmo/index.json`.
     2. Assert `preschools` exists and has length `>= 5`.
     3. Assert each preschool entry has `id`, `name`, `address`, `operatorType` and operator type is `municipal` or `independent`.
     4. Run tests to see failure before data exists.
     5. Create `data/malmo/index.json` with five schools from Malmö 2025 results list and `address: "Malmö"`.
     6. Re-run tests to confirm pass.

2. **Phase 2: Validate lint/format/test gates**
   - **Objective**: Ensure the Step 1.2 change passes required project quality gates.
   - **Files/Functions to Modify/Create**: No new feature files expected; formatting updates only if required.
   - **Tests to Write**: none.
   - **Steps**:
     1. Run `pnpm lint`.
     2. Run `pnpm lint:md`.
     3. Run `pnpm format`.
     4. Run `pnpm test`.
     5. Apply minimal fixes if any gate fails.

3. **Phase 3: Update memory bank task tracking**
   - **Objective**: Record completion status and progress for Step 1.2 in memory-bank files.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/TASK005-implement-step-1-data-layer-foundations.md`, optionally `docs/memory-bank/tasks/_index.md`
   - **Tests to Write**: none.
   - **Steps**:
     1. Update TASK005 subtasks and progress log to mark Step 1.2 complete.
     2. Update active/progress context with latest next-step focus.
     3. Update tasks index only if overall task status bucket changes.

## Open Questions

1. None. Address convention for Step 1.2 is confirmed as `"Malmö"`.
