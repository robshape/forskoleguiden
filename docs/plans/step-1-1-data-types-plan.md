# Plan: Implement Step 1.1 Data Types

Add the Step 1.1 TypeScript type contracts and a focused unit contract test that validates both top-level and nested response keys. The work follows strict TDD so the test fails first due to missing types, then passes after minimal implementation.

## Phases

1. **Phase 1: Add failing contract test**
   - **Objective**: Capture the full required data contract in a test before implementation.
   - **Files/Functions to Modify/Create**: `tests/unit/types.test.ts`
   - **Tests to Write**: `data type contract should include required top-level and nested response keys`
   - **Steps**:
     1. Create a `PreschoolSurvey` sample object in `tests/unit/types.test.ts` with full nested response fields.
     2. Add assertions for top-level keys, nested keys, and numeric types for all five response percentages.
     3. Run targeted tests to confirm failure because `src/lib/types.ts` does not yet exist.

2. **Phase 2: Implement Step 1.1 types**

- **Objective**: Implement all required type contracts exactly as specified in Step 1.1.
- **Files/Functions to Modify/Create**: `src/lib/types.ts`
- **Tests to Write**: Existing Phase 1 contract test
- **Steps**:
  1.  Add `SurveyResponse` with the five percentage fields as `number`.
  2.  Add `SurveyQuestion`, `QuestionGroup`, and `PreschoolSurvey` using the required structure.
  3.  Add `PreschoolIndexEntry` and `PreschoolIndex` with exact `operatorType` union values.
  4.  Re-run targeted tests to confirm pass.

1. **Phase 3: Validate and record completion**
   - **Objective**: Verify project quality gates and update task documentation.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/tasks/TASK005-implement-step-1-data-layer-foundations.md`, `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`
   - **Tests to Write**: None
   - **Steps**:
     1. Run required checks: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
     2. Update TASK005 subtask 5.1 status and progress log.
     3. Update active context/progress to reflect Step 1.1 completion.

## Open Questions

1. None. The user explicitly requested asserting full nested key sets in the Step 1.1 test.
