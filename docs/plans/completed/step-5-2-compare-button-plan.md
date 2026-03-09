# Plan: Step 5.2 Compare Button

Implement the Step 5.2 compare-button UI by locking the toggle behavior in browser tests first, then replacing the static directory-card placeholder with a Preact island that reflects shared compare state. This keeps the step scoped to button interaction only and avoids pulling compare-tray work forward.

## Phases

1. **Phase 1: Lock Compare Button Behavior With Tests**
   - **Objective**: Define the Step 5.2 interaction contract in failing tests before UI implementation.
   - **Files/Functions to Modify/Create**: `tests/e2e/directory-data-rendering.spec.ts`, `tests/unit/i18n-swedish-copy-contract.test.ts`
   - **Tests to Write**: clicking compare on two cards marks both selected with `aria-pressed=true`; clicking one selected button again returns it to the unselected state; Swedish copy contract covers any new compare-button labels.
   - **Steps**:
     1. Add a failing e2e test on `/forskoleguiden/sv/` that clicks compare buttons on two preschool cards and asserts their selected state and `aria-pressed` contract.
     2. Extend the same flow to deselect one preschool and assert the button returns to its unselected state.
     3. If new locale keys are introduced for selected-state labels, add failing assertions to the Swedish copy contract.
     4. Run the targeted tests to confirm the current static placeholder fails the new expectations.

2. **Phase 2: Implement The Compare Button Island**
   - **Objective**: Replace the static card button with a Preact island wired to the existing compare store.
   - **Files/Functions to Modify/Create**: `src/components/preact/CompareButton.tsx`, `src/components/astro/PreschoolCard.astro`, `src/i18n/sv.json`, `src/i18n/en.json`, `src/i18n/ar.json`
   - **Tests to Write**: no new test files; make the Phase 1 tests pass.
   - **Steps**:
     1. Create `CompareButton.tsx` using `useStore(compareIds)` and `toggleCompare(id)` to derive and mutate selected state.
     2. Render selected and unselected visual states that match the existing card-button design language, including `aria-pressed` and preschool-specific accessible naming.
     3. Replace the placeholder button in `PreschoolCard.astro` with the interactive island and pass the minimum required props.
     4. Add any needed locale keys across all locale files to keep translation parity intact.

3. **Phase 3: Verify And Document**
   - **Objective**: Validate the completed Step 5.2 work and sync the project memory.

- **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/systemPatterns.md`, `docs/memory-bank/tasks/_index.md`, `docs/memory-bank/tasks/completed/TASK011-implement-step-5-2-compare-button.md`, `docs/memory-bank/tasks/completed/TASK012-implement-step-5-3-compare-tray.md`
- **Tests to Write**: none.
- **Steps**:
  1. Run `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, `pnpm check`, and `pnpm test`.
  2. Record the Step 5.2 completion state in the memory bank and task log.
  3. Prepare the phase completion summary and completion report.

## Open Questions

1. No blocking questions; keep the five-item limit explanation deferred to Step 5.3 so Step 5.2 remains focused on selected and unselected compare-button behavior.
