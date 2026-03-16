# Plan: Step 11.3 Lighthouse Verification

Step 11.3 is best handled as two separate verification tracks: a deterministic page-weight budget that can be enforced in tests, and a Lighthouse audit path for accessibility/performance scoring. The repo currently has no Lighthouse tooling, so the cleanest implementation is to add a focused audit command plus CI wiring without destabilizing the existing validation flow.

## Phases

1. **Phase 1: Add deterministic page-weight coverage**
   - **Objective**: Enforce the `/sv/` page-weight budget in a reproducible test that does not depend on Lighthouse score variance.
   - **Files/Functions to Modify/Create**: `tests/post-build/page-weight-budget.test.ts`, `vitest.post-build.config.ts`
   - **Tests to Write**: `/sv/` built output stays under 100 KB including the page HTML, linked CSS, linked JS, and inline script bytes.
   - **Steps**:
     1. Write a failing unit test that reads the built `/sv/` page from `dist`.
     2. Parse the HTML to discover linked assets and count inline script bytes.
     3. Sum the total bytes and assert the budget stays below the Step 11.3 threshold.
     4. Run the targeted test after a build and confirm it passes.

2. **Phase 2: Add Lighthouse audit tooling**
   - **Objective**: Introduce a local and CI-runnable Lighthouse audit for the Swedish directory page.
   - **Files/Functions to Modify/Create**: `package.json`, a new Lighthouse config file such as `lighthouserc.json` or a dedicated script under `scripts`
   - **Tests to Write**: A failing Lighthouse audit run that targets `http://localhost:4321/forskoleguiden/sv/` and asserts accessibility and performance thresholds.
   - **Steps**:
     1. Add the pinned Lighthouse dependency and a dedicated `pnpm` script for the audit.
     2. Write the audit config first with the required URL, categories, and score assertions.
     3. Run the audit against the preview server until the thresholds pass reliably.

3. **Phase 3: Wire Lighthouse into CI safely**
   - **Objective**: Add Lighthouse verification to the shared quality pipeline without making the repo flaky.
   - **Files/Functions to Modify/Create**: `.github/workflows/quality-gates.yml`
   - **Tests to Write**: Workflow-level verification that the Lighthouse command runs after the existing build and browser setup.
   - **Steps**:
     1. Add the new Lighthouse step after the existing build/e2e setup.
     2. Configure the run for the repo's base path and CI-safe Chrome flags.
     3. Decide whether the step is hard-gating or advisory and encode that explicitly.
     4. Re-run the relevant validation commands locally to confirm the workflow change is sound.

4. **Phase 4: Final verification and project memory updates**
   - **Objective**: Confirm Step 11.3 is complete and document the new verification pattern.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, task index/task file under `docs/memory-bank/tasks`
   - **Tests to Write**: Final end-to-end verification run covering the new page-weight test, Lighthouse audit command, and repo validation commands affected by the change.
   - **Steps**:
     1. Run the new targeted checks and any required existing validation commands.
     2. Record the final Step 11.3 status and verification approach in the memory bank.
     3. Prepare the completion artifact and summary.

## Open Questions

1. **Should Lighthouse be a hard CI gate or an advisory check?**
   Recommendation: advisory for score thresholds, because Lighthouse performance scores are noisy on CI runners.

2. **Should the 100 KB budget use uncompressed on-disk bytes or compressed transfer size?**
   Recommendation: uncompressed bytes, because it is deterministic and easy to enforce in tests.

3. **Should inline script bytes count toward the budget?**
   Recommendation: yes, because they are part of the actual shipped page payload.

## Phase Checkpoints

- Phase 1 complete: `tests/post-build/page-weight-budget.test.ts` — 100 KB uncompressed budget, runs via `pnpm test:post-build` after build in `pnpm validate`.
- Phase 2 complete: `@lhci/cli` pinned, `pnpm audit:lighthouse` script, `.lighthouserc.json`, `.lighthouse-results/` gitignored.
- Phase 3 complete: `quality-gates.yml` — Lighthouse step runs last, after WebKit e2e, to avoid port-4321 conflicts.
- Phase 4 complete: final validation green; memory bank updated; Step 11.3 closed.
