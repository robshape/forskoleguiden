# Plan: Step 5.4 Compare MPA Persistence

Implement Step 5.4 by locking compare-state persistence across real Astro MPA navigations before changing any product logic. The compare store already persists through `sessionStorage`; this step adds the missing cross-page regression coverage and only introduces the smallest possible secondary page if a real navigation target is required.

## Phases

1. **Phase 1: Add failing MPA persistence tests**
   - **Objective**: Define the Step 5.4 contract in failing browser tests before touching product code.
   - **Files/Functions to Modify/Create**: `tests/e2e/compare-tray-interaction.spec.ts` or a new compare-persistence spec.
   - **Tests to Write**: compare selections persist across navigation to a second page and back; compare-button pressed state restores after returning to the directory; clearing compare on the second page persists back to the directory.
   - **Steps**:
     1. Add a new Playwright scenario that selects one or more preschools on `/forskoleguiden/sv/`.
     2. Navigate to a second Astro page in the same tab to exercise a real MPA page load.
     3. Navigate back to the directory and assert the tray count and button `aria-pressed` states restore from persisted state.
     4. Run the targeted spec and confirm it fails for the expected missing-navigation-target or persistence reasons.

2. **Phase 2: Add the smallest valid navigation target and fix any uncovered bug**
   - **Objective**: Make the MPA persistence test pass without pulling Step 6 detail-page scope forward.
   - **Files/Functions to Modify/Create**: one minimal secondary Astro page using the shared layout; any compare-store or island files only if the failing test exposes a real defect.
   - **Tests to Write**: no new test files; make the Phase 1 scenarios pass.
   - **Steps**:
     1. Add a minimal secondary page that mounts the global compare tray through `BaseLayout.astro`.
     2. Re-run the MPA persistence spec against a real cross-URL navigation.
     3. Apply the smallest product fix only if the new test exposes a persistence bug.
     4. Re-run the targeted test until it passes.

3. **Phase 3: Verify and document completion**
   - **Objective**: Confirm Step 5.4 is complete and non-regressive.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, `docs/memory-bank/tasks/completed/TASK013-implement-step-5-4-compare-mpa-persistence.md`, and the phase completion note.
   - **Tests to Write**: none.
   - **Steps**:
     1. Re-run the Step 5.4 e2e coverage.
     2. Run `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, `pnpm check`, and `pnpm test`.
     3. Record the completed Step 5.4 state in the memory bank and task log.
     4. Prepare the phase completion summary and git commit message.

## Open Questions

1. Should this step depend on the real preschool detail page from Step 6.1? Recommendation: no; use the smallest shared-layout stub page now so Step 5.4 stays focused on persistence rather than detail-page content.
