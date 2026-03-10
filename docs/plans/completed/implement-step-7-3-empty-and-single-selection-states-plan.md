# Plan: Implement Step 7.3 Empty and Single Selection States

Close Step 7.3 by proving the already-shipped empty and single-selection behaviors through the intended end-to-end flow, then harden the one-school clear path and sync project documentation. This keeps scope tight and avoids unnecessary component churn when the behavior itself is already in place.

## Phases

1. **Phase 1: Lock the Step 7.3 flow with failing e2e coverage**
   - **Objective**: Add a test that matches the implementation-plan intent instead of relying only on seeded state.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: empty-state back-link round trip; one-preschool flow via real directory interaction
   - **Steps**:
     1. Add a failing Playwright scenario that opens `/sv/jamfor/` with no selections and asserts the empty state.
     2. Click the back link to return to the directory and verify navigation to `/sv/`.
     3. Select one preschool through the real compare button UI and open the comparison page through the tray CTA.
     4. Assert the single-selection prompt and the selected preschool's results table.

2. **Phase 2: Harden the one-preschool clear-state path**
   - **Objective**: Verify that the one-school comparison state can be cleared cleanly back to the empty state.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: one-preschool clear returns to comparison empty state
   - **Steps**:
     1. Add a failing e2e test that starts with one selected preschool.
     2. Open `/sv/jamfor/` and confirm the single-selection state.
     3. Clear via the compare tray and confirm the page stays on `/sv/jamfor/`.
     4. Re-assert the empty-state message and back link.

3. **Phase 3: Verify and document completion**
   - **Objective**: Run the relevant validation, then record completion in the plan and memory-bank docs.
   - **Files/Functions to Modify/Create**: `docs/plans/implement-step-7-3-empty-and-single-selection-states-phase-1-complete.md`, `docs/plans/implement-step-7-3-empty-and-single-selection-states-phase-2-complete.md`, `docs/plans/implement-step-7-3-empty-and-single-selection-states-phase-3-complete.md`, `docs/plans/implement-step-7-3-empty-and-single-selection-states-complete.md`, `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`
   - **Tests to Write**: none beyond Phases 1-2
   - **Steps**:
     1. Run the targeted comparison e2e spec to confirm green behavior.
     2. Run `pnpm validate` as required by the repo instructions.
     3. Write the phase-complete and plan-complete docs.
     4. Update the memory bank and task tracking to mark Step 7.3 complete.

## Open Questions

1. No real product ambiguity remains. The only decision is scope discipline: keep this as a test-and-verification task instead of rewriting already-correct UI. Recommendation: keep it narrow.
