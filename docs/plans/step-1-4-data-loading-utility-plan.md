# Plan: Step 1.4 data loading utility

Implement the Malmö data-loading utility with strict TDD: write failing unit tests first, add minimal `src/lib/data.ts` loaders, and validate with required project quality gates. This keeps the data layer build-time safe for Astro pages while enforcing clear error behavior for missing survey files.

## Phases

1. **Phase 1: Add failing Step 1.4 tests**
   - **Objective**: Reproduce missing loader behavior before implementation.
   - **Files/Functions to Modify/Create**: `tests/unit/data.test.ts`
   - **Tests to Write**:
     - `returns preschool index from getPreschoolIndex`
     - `returns known preschool survey from getPreschoolSurvey`
     - `throws clear error for unknown preschool id`
     - `returns all surveys from getAllPreschoolSurveys in index order`
   - **Steps**:
     1. Create `tests/unit/data.test.ts` with Step 1.4 acceptance assertions using the canonical `Percent` naming.
     2. Run only the new test file and confirm red-state failure because loader functions/module do not exist.
     3. Keep assertions aligned to current Malmö 2025 seed data contracts.

2. **Phase 2: Implement data-loading utility and refactor naming drift**
   - **Objective**: Implement loader functions with clear errors and align any `Percentage` naming drift to `Percent` in code/tests.
   - **Files/Functions to Modify/Create**: `src/lib/data.ts`, `tests/unit/types.test.ts` (if needed for naming drift alignment)
   - **Tests to Write**:
     - No additional tests beyond Phase 1 unless needed for `Percent` naming drift adjustments.
   - **Steps**:
     1. Add file-read helpers in `src/lib/data.ts` using Node.js `fs`/`path` and typed JSON parsing.
     2. Implement `getPreschoolIndex`, `getPreschoolSurvey`, `getAllPreschoolSurveys` with index-derived year and deterministic index order.
     3. Ensure missing files throw clear, contextual error messages.
     4. Update remaining `Percentage` naming drift to `Percent` where found in code/tests.
     5. Run the Step 1.4 test file and confirm green state.

3. **Phase 3: Full validation and memory-bank updates**
   - **Objective**: Confirm quality gates and record completion in project memory.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/TASK005-implement-step-1-data-layer-foundations.md`, `docs/memory-bank/tasks/_index.md` (if status changes)
   - **Tests to Write**: None.
   - **Steps**:
     1. Run required gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
     2. Update memory-bank/task status and progress logs for Step 1.4 completion.
     3. Produce phase/plan completion artifacts and hand off commit message checkpoints.

## Open Questions

1. Resolved in approval: canonical response naming is `Percent`; all `Percentage` drift in code/tests should be refactored.
2. Resolved in approval: `getAllPreschoolSurveys()` returns surveys in `index.json` order for deterministic consumers.
