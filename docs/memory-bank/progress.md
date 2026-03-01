# Progress

Current status (2026-03-01): Steps 0.5 through 0.11 and Steps 1.1-1.5 are complete with green quality gates.

## Completed Scaffolding Summary

- **Step 0.5 (Tailwind v4 global CSS)**: completed and validated with build artifacts.
- **Step 0.6 (TypeScript path aliases)**: completed; aliases verified and temporary probes removed.
- **Step 0.7 (package scripts)**: completed; required scripts added and validated (`build`, `check`).
- **Step 0.8 (ESLint/Prettier)**: completed; lint/format pipeline established and passing.
- **Step 0.9 (Vitest)**: completed; unit test harness in place and passing.
- **Step 0.10 (Playwright)**: configuration complete; validation run confirmed route-scoped failure only (`/sv/` 404 until route work lands).
- **Step 0.11 (.gitignore)**: completed with command evidence and automated regression guard (`tests/unit/gitignore.test.ts`).

## Current Priorities

1. **Step 2 i18n foundation** (`TASK006`) — pending and next focus; prerequisite for Step 3.1-3.3 `Locale` type usage.
2. **Step 3.1-3.3 layout shell** (`TASK001`) — pending/blocked until Step 2.3 is complete.
3. **Step 3.4 root redirect** (`TASK002`) — pending and independently implementable.

## Recent Follow-up

- Completed Step 1.5 scoring utility and validation: `src/lib/scoring.ts` now provides `computeAgreeShare` and `computeOverallScore`, with `null` for missing/empty `Helhetsbedömning`.
- Added shared scoring exports for downstream reuse: `OVERALL_ASSESSMENT_GROUP` and `byOverallScoreDesc`.
- Verified required repository gates pass: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Marked `TASK005` complete (Step 1 fully complete).

## Next Focus

Start Step 2 i18n foundation (`TASK006`), then unblock Step 3.1-3.3 route/layout work.
