# Phase 2 Complete: Add Playwright Config and Smoke Test

Phase 2 implemented Step 0.10 artifacts by adding Playwright test runner configuration and a placeholder smoke E2E test for `/sv/` with explicit status and title assertions. The implementation is intentionally minimal and format/lint clean.

**Files created/changed**:

- playwright.config.ts
- tests/e2e/smoke.spec.ts

**Functions created/changed**:

- Test case: smoke check for /sv/ route availability and non-404 title

**Tests created/changed**:

- tests/e2e/smoke.spec.ts

**Review Status**: APPROVED

**Git Commit Message**: test: add playwright smoke config and spec

- Add Playwright config with baseURL and preview webServer
- Add e2e smoke spec for /sv/ status and title checks
- Keep red result tied to missing /sv/ route state
