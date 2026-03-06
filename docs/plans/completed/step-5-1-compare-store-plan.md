# Plan: Step 5.1 Compare Store

Implement the Step 5.1 compare-state foundation by defining the store contract in tests first, then adding an SSR-safe nanostore with sessionStorage persistence. This keeps scope limited to store behavior only and avoids pulling Step 5.2 UI work forward.

## Phases

1. **Phase 1: Define Compare Store Tests**
   - **Objective**: Lock the Step 5.1 behavior in failing unit tests before adding store code.
   - **Files/Functions to Modify/Create**: `tests/unit/compare-store-state-behavior.test.ts`
   - **Tests to Write**: store initializes empty in SSR, toggle adds and removes IDs, clear resets state, cap stops a 6th item, persisted state hydrates from sessionStorage.
   - **Steps**:
     1. Write a behavior-oriented unit test file that dynamically imports the store module after stubbing or removing browser globals.
     2. Run the targeted test to confirm failure before implementation.
     3. Keep assertions limited to Step 5.1 store behavior and SSR-safe hydration.

2. **Phase 2: Implement SSR-Safe Nanostore State**
   - **Objective**: Add compare state and persistence without breaking Astro prerender imports.
   - **Files/Functions to Modify/Create**: `src/lib/state.ts`
   - **Tests to Write**: no additional test files; make the Phase 1 tests pass.
   - **Steps**:
     1. Create `compareIds` as a `nanostores` atom and export `MAX_COMPARE = 5`.
     2. Implement `toggleCompare(id)` and `clearCompare()` with hard-cap enforcement.
     3. Hydrate from and persist to sessionStorage only when browser globals exist.
     4. Re-run the targeted test until it passes.

3. **Phase 3: Verify and Document**
   - **Objective**: Validate the store against repo quality gates and record the completed work.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, `docs/memory-bank/tasks/TASK010-implement-step-5-1-compare-store.md`
   - **Tests to Write**: none.
   - **Steps**:
     1. Run `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, `pnpm check`, and `pnpm test`.
     2. Update memory-bank status files and task tracking to reflect Step 5.1 completion.
     3. Prepare the phase completion summary and commit message for review.

## Open Questions

1. No blocking questions; enforce the 5-item hard cap in the store now and defer any visible limit message to the Step 5.2 compare-button UI.
