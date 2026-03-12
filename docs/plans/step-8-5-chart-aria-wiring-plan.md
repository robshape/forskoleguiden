# Plan: Step 8.5 Chart/Table ARIA Wiring

Step 8.5 is a narrow accessibility hardening pass. The chart already has `role="img"` and an accessible name, and the chart-adjacent table already has deterministic ids. The remaining work is to connect them with `aria-describedby`, prove that link with a failing-first regression, and add an axe check on the comparison page.

## Phases

1. **Phase 1: Add failing Step 8.5 accessibility regressions**
   - **Objective**: Capture the missing chart-to-table semantic link and comparison-page axe coverage before changing production code.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: Chart SVG exposes `aria-describedby` pointing to its matching `chart-{index}-table`; each referenced chart table id exists in the DOM; comparison page has zero axe violations with charts rendered.
   - **Steps**:
     1. Add a new Step 8.5 describe block in the comparison-page e2e spec.
     2. Seed compare state with 2 preschools, navigate to the comparison page, and assert the missing `aria-describedby` contract so the test fails first.
     3. Add the axe-core comparison-page test and run the targeted spec to confirm the intended red state.

2. **Phase 2: Implement the chart ARIA linkage**
   - **Objective**: Wire each chart SVG to its chart-adjacent table using the deterministic table ids already introduced in Step 8.4.
   - **Files/Functions to Modify/Create**: `src/components/preact/BarChart.tsx`
   - **Tests to Write**: No new tests beyond Phase 1; use the failing regressions as the acceptance boundary.
   - **Steps**:
     1. Add `aria-describedby` to the chart SVG using the existing `chartIndex` contract.
     2. Keep the current accessible name behavior unchanged so Step 8.1 semantics remain intact.
     3. Re-run the targeted Step 8.5 e2e coverage until it turns green.

3. **Phase 3: Verify and document completion**
   - **Objective**: Confirm the change is clean, stable, and recorded in the repo’s planning artifacts.
   - **Files/Functions to Modify/Create**: `docs/plans/`, `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, `docs/memory-bank/tasks/TASK028-implement-step-8-5-chart-aria-wiring.md`
   - **Tests to Write**: None
   - **Steps**:
     1. Run the focused comparison-page spec and then `pnpm validate`.
     2. Write the required plan-completion artifact and update the memory bank/task tracking to reflect Step 8.5 completion.
     3. Return a concise implementation summary plus manual verification steps.
