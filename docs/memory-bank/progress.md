# Progress

Current status (2026-03-02): Steps 0.5 through 0.11, Steps 1.1-1.5, Steps 2.1-2.3, and Steps 3.1-3.3 are complete with green quality gates.

## Completed Scaffolding Summary

- **Step 0.5 (Tailwind v4 global CSS)**: completed and validated with build artifacts.
- **Step 0.6 (TypeScript path aliases)**: completed; aliases verified and temporary probes removed.
- **Step 0.7 (package scripts)**: completed; required scripts added and validated (`build`, `check`).
- **Step 0.8 (ESLint/Prettier)**: completed; lint/format pipeline established and passing.
- **Step 0.9 (Vitest)**: completed; unit test harness in place and passing.
- **Step 0.10 (Playwright)**: configuration complete; validation run confirmed route-scoped failure only (`/sv/` 404 until route work lands).
- **Step 0.11 (.gitignore)**: completed with command evidence and automated regression guard (`tests/unit/gitignore.test.ts`).

## Current Priorities

1. **Step 3.4 root redirect** (`TASK002`) — pending and independently implementable.

## Recent Follow-up

- Completed Step 1.5 scoring utility and validation: `src/lib/scoring.ts` now provides `computeAgreeShare` and `computeOverallScore`, with `null` for missing/empty `Helhetsbedömning`.
- Added shared scoring exports for downstream reuse: `OVERALL_ASSESSMENT_GROUP` and `byOverallScoreDesc`.
- Completed Step 2.1 Swedish i18n contract using a test-first approach (`tests/unit/i18n-sv.test.ts` + `src/i18n/sv.json`).
- Completed Step 2.2 placeholder locale implementation using `src/i18n/en.json` and `src/i18n/ar.json`, validated by locale parity coverage in `tests/unit/i18n-locales.test.ts`.
- Completed Step 2.3 i18n utility implementation in `src/i18n/utils.ts` (`Locale`, `getLocaleFromURL()`, `t()`) and validated behavior in `tests/unit/i18n-utils.test.ts`.
- Completed Step 3.1 Phase 3 migration by updating `src/pages/sv/index.astro` to use `src/layouts/BaseLayout.astro` with required `locale` and `title` props.
- Completed Step 3.2 by adding `src/components/astro/Nav.astro` and wiring it into `src/layouts/BaseLayout.astro` header composition.
- Updated `/sv/` shell to inherit header navigation from `BaseLayout` (removed page-level header slot content).
- Added a fail-first regression test `tests/unit/sv-index-layout.test.ts` that enforces `/sv/` BaseLayout composition.
- Added a fail-first e2e nav shell contract in `tests/e2e/layout-shell.spec.ts` for required city/year labels and disabled semantics.
- Verified required repository gates pass: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Verified fresh-build nav e2e validation passes: `pnpm build && CI=1 pnpm test:e2e tests/e2e/layout-shell.spec.ts`.
- Marked `TASK006` complete and unblocked `TASK001` for Step 3.1-3.3 layout implementation.
- Marked `TASK005` complete (Step 1 fully complete).
- Completed Step 3.3 Phase 3 by extending `tests/e2e/layout-shell.spec.ts` with footer attribution text and Malmö source-link assertions on `/sv/`.
- Captured red/green evidence for footer runtime contract:
  - Red run (stale `dist/`): `CI=1 pnpm test:e2e tests/e2e/layout-shell.spec.ts`.
  - Green run (fresh build): `pnpm build && CI=1 pnpm test:e2e tests/e2e/layout-shell.spec.ts`.
- Marked `TASK001` complete after Step 3.3 validation and memory-bank status updates.

## Next Focus

Execute Step 3.4 redirect work in `TASK002`.
