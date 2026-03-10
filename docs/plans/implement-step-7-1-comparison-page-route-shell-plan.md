# Plan: Step 7.1 Comparison Shell

Add the Swedish comparison route as a thin Astro shell that enables the existing tray CTA, passes all survey data into a minimal client-only Preact island, and keeps the scope limited to the route, empty state, and route-activation regressions. This keeps Step 7.1 aligned with the implementation plan and avoids leaking Step 7.2 table work into this slice.

## Phases

1. **Phase 1: Add failing route-shell coverage**
   - **Objective**: Lock in the Step 7.1 behavior before any implementation.
   - **Files/Functions to Modify/Create**: tests/e2e/comparison-page-route-shell.spec.ts, tests/e2e/compare-tray-interaction.spec.ts
   - **Tests to Write**: comparison page route is reachable at /forskoleguiden/sv/jamfor/; comparison page shows the empty-state copy when no preschools are selected; compare tray CTA is a live link after the route exists; keyboard activation of the tray CTA navigates to the comparison route
   - **Steps**:
     1. Add the new comparison-shell e2e spec with failing assertions for the missing route.
     2. Update the two existing tray tests so they expect a live link instead of a disabled button.
     3. Run the targeted e2e tests and confirm they fail for the expected reasons.

2. **Phase 2: Implement the Step 7.1 route shell**
   - **Objective**: Create the comparison page route and minimal island without building the comparison table yet.
   - **Files/Functions to Modify/Create**: src/pages/sv/jamfor/index.astro, src/components/preact/ComparisonView.tsx
   - **Tests to Write**: No new tests beyond Phase 1; make the failing tests pass.
   - **Steps**:
     1. Create the Astro page using BaseLayout, locale = 'sv', getAllPreschoolSurveys(), and resolved Swedish strings.
     2. Create a minimal ComparisonView island that accepts serialized survey data, subscribes to compareIds, and renders the empty state plus back link when nothing is selected.
     3. Mount the island with client:only="preact" so session-backed compare state does not produce SSR/client mismatches.
     4. Ensure the new route automatically enables the tray CTA via the existing build-time route detection in src/layouts/BaseLayout.astro.

3. **Phase 3: Verify and document**
   - **Objective**: Prove the Step 7.1 slice is stable and record the new project state.
   - **Files/Functions to Modify/Create**: docs/memory-bank/tasks/\_index.md, docs/memory-bank/tasks/TASK017-implement-step-7-1-comparison-page-route-shell.md, docs/memory-bank/activeContext.md, docs/memory-bank/progress.md
   - **Tests to Write**: No additional tests; rerun the relevant suites.
   - **Steps**:
     1. Run the targeted e2e tests, then run pnpm validate.
     2. Update task tracking and memory-bank state for completed Step 7.1 work.
     3. Write the phase-complete document and return the summary for review before moving on.

## Open Questions

1. Use a minimal placeholder island now or defer it to Step 7.2? Recommendation: create the minimal island now, because Step 7.1 explicitly requires a Preact island mount point and serialized survey props.
2. Should this be tracked as a new memory-bank task entry before implementation starts? Recommendation: yes, create TASK017 when implementation begins so the task history stays consistent with earlier steps.
