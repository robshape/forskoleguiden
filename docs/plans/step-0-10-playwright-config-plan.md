# Plan: Step 0.10 Playwright Configuration

Implement Step 0.10 by setting up Playwright configuration and a placeholder end-to-end smoke test for `/sv/`, using strict red/green validation to confirm setup correctness while acknowledging that route-dependent pass state may remain pending until Step 3.1 creates `/sv/`.

## Phases

1. **Phase 1: Establish Red Baseline**
   - **Objective**: Capture current failing baseline for Playwright smoke behavior and ensure browser runtime prerequisites are installed.
   - **Files/Functions to Modify/Create**: None (execution-only baseline verification).
   - **Tests to Write**: None.
   - **Steps**:
     1. Run Playwright browser install command to ensure required browser binaries are present.
     2. Run build plus E2E test command to capture pre-implementation baseline behavior.
     3. Record the exact failure mode to ensure it aligns with missing Step 0.10 artifacts.

2. **Phase 2: Add Playwright Config and Smoke Test**
   - **Objective**: Implement Step 0.10 artifacts exactly as specified.
   - **Files/Functions to Modify/Create**:
     - `playwright.config.ts`
     - `tests/e2e/smoke.spec.ts`
   - **Tests to Write**:
     - `tests/e2e/smoke.spec.ts` should validate `/sv/` response status and non-404 title.
   - **Steps**:
     1. Create Playwright config with `baseURL`, `webServer.command`, `webServer.port`, and `testDir` per Step 0.10.
     2. Create smoke E2E test that calls `page.goto('/sv/')` and asserts status `200`.
     3. Add page title assertion that the title does not contain `404`.

3. **Phase 3: Validate and Document Outcome**
   - **Objective**: Verify Step 0.10 setup is complete and outcome is correctly documented.
   - **Files/Functions to Modify/Create**:
     - `docs/memory-bank/activeContext.md`
     - `docs/memory-bank/progress.md`
     - `docs/memory-bank/tasks/_index.md` (if status transitions are needed)
   - **Tests to Write**: None additional.
   - **Steps**:
     1. Run `pnpm build && pnpm test:e2e` after implementation.
     2. Confirm whether the only remaining failure condition is route availability for `/sv/`.
     3. Update memory-bank context with Step 0.10 status and verification evidence.

## Open Questions

1. Should Step 0.10 be considered complete if E2E remains failing only because `/sv/` route is not implemented yet? Approved: Yes.
