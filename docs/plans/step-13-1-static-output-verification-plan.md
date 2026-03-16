# Plan: Step 13.1 Static Output Verification

Add a post-build verification contract for the final static output so the repo continuously proves that Astro generates the expected Swedish routes, the root redirect, and a bounded production artifact size. The work stays in the existing post-build lane to avoid runtime changes and to keep final verification aligned with current CI and local validation flows.

## Phases

1. **Phase 1: Add Static Output Presence Contract**
   - **Objective**: Add a failing post-build test that verifies the required generated HTML files exist after `pnpm build`.
   - **Files/Functions to Modify/Create**: `tests/post-build/static-output-verification.test.ts`
   - **Tests to Write**: `static output verification` tests for the root redirect, directory page, comparison page, and all preschool detail pages generated from `data/malmo/index.json`
   - **Steps**:
     1. Write a post-build test that reads preschool IDs from `data/malmo/index.json` and asserts the expected `dist/` HTML files exist.
     2. Run the post-build suite to confirm the new contract fails when the build output is missing and passes with a current build.
     3. Keep the assertions focused on generated artifacts, not implementation details.

2. **Phase 2: Add Output Count And Size Contract**
   - **Objective**: Verify the built `dist/` output meets the final verification thresholds for HTML file count and overall artifact size.
   - **Files/Functions to Modify/Create**: `tests/post-build/static-output-verification.test.ts`
   - **Tests to Write**: post-build assertions for HTML file count and total non-image `dist/` size under 500 KB
   - **Steps**:
     1. Extend the post-build test file with an HTML file counting assertion based on the built `dist/` tree.
     2. Add a total artifact size assertion that excludes image files and enforces the Step 13.1 size threshold.
     3. Re-run the post-build suite and refine diagnostics so failures are actionable.

3. **Phase 3: Validate And Close The Step**
   - **Objective**: Run the relevant verification commands, record completion, and update project memory for the finished step.
   - **Files/Functions to Modify/Create**: `docs/plans/step-13-1-static-output-verification-complete.md`, `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, `docs/memory-bank/tasks/TASK037-implement-step-13-1-static-output-verification.md`
   - **Tests to Write**: no new tests beyond the post-build contract; validation runs cover `pnpm build`, `pnpm test:post-build`, and `pnpm validate`
   - **Steps**:
     1. Run the final verification commands against the updated post-build contract.
     2. Update the task record and memory bank with the completed Step 13.1 status and any relevant decisions.
     3. Write the completion artifact with the final summary and verification outcome.

## Open Questions

1. Resolved: keep the implementation plan minimum of 8 as the aggregate HTML-count floor, and assert the current `sv/om` route explicitly so the test remains accurate without coupling the floor to the current route inventory.
