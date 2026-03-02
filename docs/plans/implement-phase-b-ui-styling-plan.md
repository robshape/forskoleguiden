# Plan: Implement Phase B UI Styling

Update implementation documentation so UI/styling requirements from the mockups are embedded directly in Steps 4–8, with an explicit Phase A baseline step and memory-bank task tracking. This keeps implementation visual-first and avoids deferred retrofit styling.

## Phases

1. **Phase 1: Add Task Tracking for Phase B**
   - **Objective**: Create and register a Memory Bank task for the Phase B documentation update.
   - **Files/Functions to Modify/Create**:
     - `docs/memory-bank/tasks/TASK009-implement-phase-b-ui-styling-plan-update.md` (create)
     - `docs/memory-bank/tasks/_index.md`

- **Verification Steps**:
  - Verify `TASK009` is listed in the task index under Pending before implementation (expected fail).
  - Verify `TASK009` task file exists and follows required task template after implementation (expected pass).
- **Steps**:
  1.  Check current tasks and confirm next available task id is `TASK009`.
  2.  Add a Pending entry for `TASK009` in the task index.
  3.  Create the `TASK009` task file with original request, plan, and progress table/log.
  4.  Validate task index and task file consistency.

1. **Phase 2: Add Step 3.5 Design Foundations Baseline**
   - **Objective**: Insert an explicit Step 3.5 in the implementation plan documenting the completed Phase A foundation.
   - **Files/Functions to Modify/Create**:
     - `docs/implementation-plan.md`

- **Verification Steps**:
  - Confirm Step 3.5 does not exist before insertion (expected fail).
  - Confirm Step 3.5 exists between Step 3.4 and Step 4 after insertion (expected pass).
- **Steps**:
  1.  Locate Step 3.4 and Step 4 boundaries.
  2.  Insert Step 3.5 with scope: theme tokens, shell styling, base interactive styles, and viewport-fit requirement reference.
  3.  Add a test section in the same style as surrounding steps.
  4.  Validate ordering and heading consistency.

1. **Phase 3: Embed Visual Design Requirements in Steps 4–5**
   - **Objective**: Add mockup-aligned visual-design requirements for directory and compare-tray implementation.
   - **Files/Functions to Modify/Create**:
     - `docs/implementation-plan.md`

- **Verification Steps**:
  - Confirm new Step 4 top-level note exists (style implemented alongside functionality).
  - Confirm `Visual design` subsections are present in 4.2, 4.3, 4.4, 5.2, and 5.3 (expected pass).
- **Steps**:
  1.  Add a Step 4 note that styling must be implemented with functionality, not deferred.
  2.  Append `Visual design` subsections to 4.2/4.3/4.4 using `docs/mockups/homepage.svg`.
  3.  Append `Visual design` subsections to 5.2/5.3 including safe-area and tray constraints.
  4.  Keep all copy aligned with Swedish Phase 1 scope.

1. **Phase 4: Embed Visual Design Requirements in Steps 6–8**
   - **Objective**: Add mockup-aligned visual-design requirements for detail/comparison/chart sections and cross-step references.
   - **Files/Functions to Modify/Create**:
     - `docs/implementation-plan.md`

- **Verification Steps**:
  - Confirm `Visual design` subsections are present in 6.1, 6.2, 7.2, 7.4, 8.1, 8.3, and 8.4 (expected pass).
  - Confirm explicit references to Step 9 summary styling and Step 10 attribution styling (expected pass).
- **Steps**:
  1.  Append `Visual design` subsections to 6.1/6.2 using `docs/mockups/preschool-details.svg`.
  2.  Append `Visual design` subsections to 7.2/7.4 using `docs/mockups/comparison-view.svg`.
  3.  Add Step 8 visual notes for chart/legend styling and explicitly resolve 3-segment detail vs 5-segment canonical model.
  4.  Add references that Step 9 and Step 10 carry corresponding summary/attribution visual styles.

1. **Phase 5: Validate, Close Task, and Update Memory Bank Context**
   - **Objective**: Run required quality checks and mark documentation work complete in memory-bank state.
   - **Files/Functions to Modify/Create**:
     - `docs/memory-bank/tasks/TASK009-implement-phase-b-ui-styling-plan-update.md`
     - `docs/memory-bank/tasks/_index.md`
     - `docs/memory-bank/activeContext.md`
     - `docs/memory-bank/progress.md`

- **Verification Steps**:
  - Documentation quality checks pass (`pnpm lint:md`).
  - Required project gates for completed tasks pass (`pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`).
  - `TASK009` moves from Pending/In Progress to Completed with updated progress log.
- **Steps**:
  1.  Run required quality gates and resolve any markdown/style issues introduced by the edits.
  2.  Update task status and progress logs for `TASK009`.
  3.  Update active context and progress to reflect completed Phase B documentation.
  4.  Verify all references remain consistent with current implementation status.

## Open Questions

1. Should detail-page charts be rendered as a derived 3-segment view while preserving the canonical 5-response data model for comparisons? Option A: yes (recommended). Option B: use 5-segment everywhere.

Resolution: Option A chosen. Reflected in `docs/implementation-plan.md` Step 8.1 under "Visual design (Step 8.1, comparison charts)", which preserves canonical 5-category comparison charts and allows derived 3-segment detail presentation only.

1. Should shortlist UI elements shown in mockups be treated as Phase 1 visual placeholders only? Option A: yes (recommended). Option B: remove those references entirely from Steps 6–7.

Resolution: Option A chosen. Reflected in `docs/implementation-plan.md` Step 6.1 under "Visual design (Step 6.1, preschool details)", where shortlist controls are explicitly treated as visual placeholders only in Phase 1.
