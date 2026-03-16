# Plan: Step 13.2 End-to-End User Flow

Add one comprehensive Playwright flow that proves the full Phase 1 user journey works end to end across real Astro MPA navigations, persisted compare state, comparison rendering, and preschool detail navigation. The application behavior already exists; this step closes the remaining final-verification gap by asserting the full chained journey in a single high-value test.

## Phases

1. **Phase 1: Add Comprehensive Flow Test**
   - **Objective**: Create a single long Playwright test that follows the exact 14-step Step 13.2 journey from the implementation plan.
   - **Files/Functions to Modify/Create**: `tests/e2e/user-flow-phase1.spec.ts`, optionally `tests/e2e/fixtures.ts` only if a tiny shared helper is clearly justified
   - **Tests to Write**: one behavior-driven end-to-end test covering directory load, sort toggling, selecting 3 preschools, tray count, comparison navigation, 3-column comparison assertions, chart presence, summary text, attribution, return to directory, detail-page navigation, and state persistence after back navigation
   - **Steps**:
     1. Write the new spec first against the current UI, using real compare-button clicks rather than `sessionStorage` seeding.
     2. Run the targeted e2e spec to get the initial result.
     3. If the test exposes a real bug, make the minimal product fix needed and rerun until green.

2. **Phase 2: Harden Flow Reliability**
   - **Objective**: Remove flake risk and keep the test aligned with current repo patterns.
   - **Files/Functions to Modify/Create**: `tests/e2e/user-flow-phase1.spec.ts`, optionally `tests/e2e/fixtures.ts`
   - **Tests to Write**: no additional test files; refine the same long test with stable hydration and navigation waits
   - **Steps**:
     1. Reuse existing accessibility and state assertions, especially waiting for compare buttons to expose `aria-pressed` before interaction.
     2. Prefer real directory and comparison navigation over browser-history shortcuts so the test matches Astro MPA behavior.
     3. Keep assertions high-signal and domain-based, not overly coupled to layout internals.

3. **Phase 3: Validate And Close The Step**
   - **Objective**: Run the relevant validation commands and update project tracking for the completed step.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, a new task file in `docs/memory-bank/tasks`, and a new completion file in `docs/plans`
   - **Tests to Write**: no new tests beyond the end-to-end flow spec; validation runs cover targeted Playwright execution and full `pnpm validate` flow
   - **Steps**:
     1. Run the new spec directly, then run the broader validation commands.
     2. Record completion in the memory bank and task index.
     3. Write the Step 13.2 completion artifact and report the final result.

## Open Questions

1. Resolved: keep this as one long spec with one long test, not several smaller tests, because the requirement is specifically to prove the chained user journey.
2. Resolved: start with a test-only implementation and only touch app code if the new flow exposes a real bug.
