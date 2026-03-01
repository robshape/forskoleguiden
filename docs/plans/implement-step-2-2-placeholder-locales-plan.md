# Plan: Implement Step 2.2 Placeholder Locales

Implement Step 2.2 by adding placeholder `en` and `ar` locale files that mirror Swedish i18n structure, plus a parity test to prevent locale drift. Work follows a strict test-first flow and ends with repo quality gates and memory-bank updates.

## Phases

1. **Phase 1: Add Locale Parity Contract Test**
   - **Objective**: Define a failing unit test that enforces top-level key parity across `sv`, `en`, and `ar` locale JSON files.
   - **Files/Functions to Modify/Create**: `tests/unit/i18n-locales.test.ts`
   - **Tests to Write**: `matches top-level key set across sv/en/ar locales`
   - **Steps**:
     1. Add locale imports for Swedish, English, and Arabic JSON files.
     2. Assert each locale export is an object.
     3. Assert exact sorted top-level key equality (`sv` vs `en`, `sv` vs `ar`).
     4. Run targeted test to verify failure before implementation.

2. **Phase 2: Implement Placeholder Locales and Satisfy Test**
   - **Objective**: Create `en` and `ar` placeholder files with the same key structure as Swedish and make tests pass.
   - **Files/Functions to Modify/Create**: `src/i18n/en.json`, `src/i18n/ar.json`
   - **Tests to Write**: None new (use Phase 1 contract test as acceptance)
   - **Steps**:
     1. Create `en.json` with readable placeholder English values and identical key structure to `sv.json`.
     2. Create `ar.json` with readable placeholder Arabic values and identical key structure to `sv.json`.
     3. Preserve interpolation placeholders exactly where used.
     4. Re-run targeted test and confirm pass.

3. **Phase 3: Validate and Document Completion**
   - **Objective**: Verify repository gates pass and update memory-bank records for completed Step 2.2 work.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/TASK006-implement-step-2-i18n-foundation.md`, `docs/memory-bank/tasks/_index.md` (if status changes)
   - **Tests to Write**: None new
   - **Steps**:
     1. Run `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
     2. Update memory-bank task and status docs with dated progress entries.
     3. Summarize outcomes and provide manual verification steps.

## Open Questions

1. Test location decision resolved: use dedicated `tests/unit/i18n-locales.test.ts`.
2. Placeholder content decision resolved: use readable placeholder copy (not `TODO` markers).
