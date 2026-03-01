# Plan: Implement Step 2.1 Swedish i18n contract

Add a complete Swedish translation source for Phase 1 and lock it with unit tests so later i18n work (Steps 2.2/2.3 and UI wiring) builds on a stable key contract.

## Phases

1. **Phase 1: Add Swedish i18n contract tests and pass them**
   - **Objective**: Define the Step 2.1 key contract in unit tests, run them red first, then implement the minimal Swedish translation file so tests pass.
   - **Files/Functions to Modify/Create**: `tests/unit/i18n-sv.test.ts`, `src/i18n/sv.json`
   - **Tests to Write**:
     - `sv.json loads as an object`
     - `sv.json contains required keys (site.title, directory.heading, compare.heading)`
     - `sv.json contains Phase 1 key groups (nav, directory, compareTray, compare, responses, summary, attribution, footer, about)`
   - **Steps**:
     1. Write key-contract tests using dot-path assertions and run targeted unit tests to confirm failure.
     2. Create `src/i18n/sv.json` with grouped, shallow keys and Swedish values for Phase 1 user-facing strings.
     3. Re-run targeted tests until they pass.

2. **Phase 2: Verify repository quality gates**
   - **Objective**: Ensure the Step 2.1 implementation is stable and consistent with project standards.
   - **Files/Functions to Modify/Create**: No new product files expected unless quality checks require minimal adjustments.
   - **Tests to Write**:
     - No additional tests expected.
   - **Steps**:
     1. Run `pnpm lint`.
     2. Run `pnpm lint:md`.
     3. Run `pnpm format`.
     4. Run `pnpm test` and confirm all tests pass.

3. **Phase 3: Update Memory Bank task tracking**
   - **Objective**: Record Step 2.1 completion context and progress for future sessions.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/TASK006-implement-step-2-i18n-foundation.md`, `docs/memory-bank/tasks/_index.md` (if status changes)
   - **Tests to Write**:
     - No additional tests expected.
   - **Steps**:
     1. Update TASK006 progress table/log for Step 2.1 completion.
     2. Update active/progress context to reflect Step 2.1 done and next i18n steps pending.
     3. Update task index status only if warranted by current completion state.

## Open Questions

1. Confirmed default: include broad Phase 1 key coverage now and use shallow grouped keys with interpolation placeholders like `{count}`.
