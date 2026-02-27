# Progress

Current status (2026-02-27): Steps 0.5 through 0.11 are complete.

## Completed Scaffolding Summary

- **Step 0.5 (Tailwind v4 global CSS)**: completed and validated with build artifacts.
- **Step 0.6 (TypeScript path aliases)**: completed; aliases verified and temporary probes removed.
- **Step 0.7 (package scripts)**: completed; required scripts added and validated (`build`, `check`).
- **Step 0.8 (ESLint/Prettier)**: completed; lint/format pipeline established and passing.
- **Step 0.9 (Vitest)**: completed; unit test harness in place and passing.
- **Step 0.10 (Playwright)**: configuration complete; validation run confirmed route-scoped failure only (`/sv/` 404 until route work lands).
- **Step 0.11 (.gitignore)**: completed with command evidence and automated regression guard (`tests/unit/gitignore.test.ts`).

## Current Priorities

1. **Step 1 data layer** (`TASK005`) — in progress.
2. **Step 2 i18n foundation** (`TASK006`) — pending, prerequisite for Step 3.1-3.3 `Locale` type usage.
3. **Step 3.1-3.3 layout shell** (`TASK001`) — pending/blocked until Step 2.3 is complete.
4. **Step 3.4 root redirect** (`TASK002`) — pending and independently implementable.

## Next Focus

Complete Step 1, then Step 2, then unblock Step 3.1-3.3 route/layout work.
