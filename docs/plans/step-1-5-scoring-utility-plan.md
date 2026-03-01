# Plan: Step 1.5 Scoring Utility

Implement deterministic scoring helpers for agree-share calculations using existing repository field names (`...Percent`) and add focused unit tests that prove behavior for normal, missing, and sorting-edge scenarios.

## Phases

1. **Phase 1: Implement `computeAgreeShare` with TDD**
   - **Objective**: Deliver `computeAgreeShare` with a failing-first test cycle ending in passing tests.
   - **Files/Functions to Modify/Create**:
     - `tests/unit/scoring.test.ts`
     - `src/lib/scoring.ts` (`computeAgreeShare`)
   - **Tests to Write**:
     - `computeAgreeShare` returns `85` from `60 + 25`
   - **Steps**:
     1. Write the `computeAgreeShare` unit test in `scoring.test.ts`.
     2. Run targeted tests and confirm initial failure.
     3. Implement minimal `computeAgreeShare` logic using `...Percent` fields.
     4. Re-run targeted tests and confirm pass.

2. **Phase 2: Implement `computeOverallScore` and sorting behavior with TDD**
   - **Objective**: Deliver `computeOverallScore` behavior and sorting rule coverage, ending green.
   - **Files/Functions to Modify/Create**:
     - `tests/unit/scoring.test.ts`
     - `src/lib/scoring.ts` (`computeOverallScore`)
   - **Tests to Write**:
     - `computeOverallScore` returns average `85` from agree shares `80` and `90`
     - `computeOverallScore` returns `null` when `Helhetsbedömning` is missing
     - Descending sorting keeps `null` at the bottom via `byOverallScoreDesc` (`[85, null, 72] -> [85, 72, null]`)
   - **Steps**:
     1. Add `computeOverallScore` and sorting behavior tests.
     2. Run targeted tests and confirm failure for unimplemented behavior.
     3. Implement minimal `computeOverallScore` logic.
     4. Return `null` when group is missing or present-but-empty.
     5. Re-run targeted tests and confirm pass.

3. **Phase 3: Repository quality gates and docs sync**
   - **Objective**: Verify project quality requirements and update memory-bank/task records.
   - **Files/Functions to Modify/Create**:
     - `docs/memory-bank/activeContext.md`
     - `docs/memory-bank/progress.md`
     - `docs/memory-bank/tasks/TASK005-implement-step-1-data-layer-foundations.md`
     - `docs/memory-bank/tasks/_index.md`
   - **Tests to Write**: No new tests; run required validation commands.
   - **Steps**:
     1. Run `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
     2. Update memory-bank and task tracking to reflect Step 1.5 completion state.
     3. Re-check for regressions and finalize phase artifacts.

## Open Questions

1. None currently; empty `Helhetsbedömning` behavior is defined as returning `null`.
