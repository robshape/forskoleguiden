# Progress

Current status (2026-03-02): Steps 0.5 through 0.11, Steps 1.1-1.5, Steps 2.1-2.3, Steps 3.1-3.4, and Phase A design foundations are complete with green quality gates.

## Completed Scaffolding Summary

- **Step 0.5 (Tailwind v4 global CSS)**: completed and validated with build artifacts.
- **Step 0.6 (TypeScript path aliases)**: completed; aliases verified and temporary probes removed.
- **Step 0.7 (package scripts)**: completed; required scripts added and validated (`build`, `check`).
- **Step 0.8 (ESLint/Prettier)**: completed; lint/format pipeline established and passing.
- **Step 0.9 (Vitest)**: completed; unit test harness in place and passing.
- **Step 0.10 (Playwright)**: configuration complete; validation run confirmed route-scoped failure only (`/sv/` 404 until route work lands).
- **Step 0.11 (.gitignore)**: completed with command evidence and automated regression guard (`tests/unit/gitignore.test.ts`).

## Current Priorities

1. **Step 4 directory page foundation** — next implementation target after shell completion.

## Recent Follow-up

- Completed Phase A hardening patch (`TASK008`) to address post-implementation review feedback:
  - Aligned Nav content width with shell container (`max-w-content`) in `src/components/astro/Nav.astro`.
  - Replaced directional Nav utilities with logical equivalents (`text-start`, `ms-auto`) and changed language placeholder from `<p>` to `<span>`.
  - Removed global anchor hover-underline rule from `src/styles/global.css` to avoid style leakage into future CTA/chip links.
  - Expanded primary token scale in `src/styles/global.css` with `--color-primary-50` and `--color-primary-700`.
  - Hardened focus-visible e2e test in `tests/e2e/layout-shell.spec.ts` with bounded tab-loop traversal and documented RGB/token coupling.
  - Split shell contract tests into modular suites:
    - `tests/unit/base-layout.test.ts`
    - `tests/unit/nav.test.ts`
    - `tests/unit/footer.test.ts`
    - `tests/unit/helpers/astro-source.ts`
  - Removed monolithic `tests/unit/sv-index-layout.test.ts` and reduced repeated file reads via module-scope sources.
- Verified hardening patch with required gates:
  - `pnpm lint`
  - `pnpm lint:md`
  - `pnpm format`
  - `pnpm test`
  - `pnpm build`

- Completed Phase A UI styling plan (`docs/plans/implement-phase-a-ui-styling-plan.md`) across four review-approved phases:
  - Phase 1: added Tailwind v4 theme tokens and base interactive styles in `src/styles/global.css`, with contract tests in `tests/unit/global-styles-phase-a.test.ts`.
  - Phase 2: styled shell body/main in `src/layouts/BaseLayout.astro` with centered `max-w-content` main container.
  - Phase 3: styled `src/components/astro/Nav.astro` to mockup-aligned shell/chip states with RTL-aware alignment behavior.
  - Phase 4: styled `src/components/astro/Footer.astro`, added footer style contracts, and added keyboard focus-visible e2e checks in `tests/e2e/layout-shell.spec.ts`.
- Resolved a Phase 4 e2e typing issue by typing the focus helper with Playwright `Locator` in `tests/e2e/layout-shell.spec.ts`.
- Completed required verification commands for final Phase A state:
  - `pnpm test tests/unit/sv-index-layout.test.ts`
  - `pnpm build && CI=1 pnpm test:e2e tests/e2e/layout-shell.spec.ts`
  - `pnpm lint && pnpm lint:md && pnpm format && pnpm test && pnpm build`
- Added completion artifacts:
  - `docs/plans/implement-phase-a-ui-styling-phase-1-complete.md`
  - `docs/plans/implement-phase-a-ui-styling-phase-2-complete.md`
  - `docs/plans/implement-phase-a-ui-styling-phase-3-complete.md`
  - `docs/plans/implement-phase-a-ui-styling-phase-4-complete.md`
  - `docs/plans/implement-phase-a-ui-styling-complete.md`

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
- Completed Step 3.4 root redirect with fail-first coverage in `tests/unit/root-redirect.test.ts`.
- Added Astro native redirect config in `astro.config.ts` (`redirects: { '/': '/sv/' }`) and removed the temporary `src/pages/index.astro` meta refresh page.
- Verified generated build redirect output in `dist/index.html` points to `/sv/`.
- Verified required quality gates pass after redirect changes: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Marked `TASK002` complete.
- Applied review hardening for Step 3.4 redirect tests:
  - Replaced brittle regex text-inspection in `tests/unit/root-redirect.test.ts` with direct config-object assertion via dynamic import of `astro.config.ts`.
  - Removed vacuous negative file-existence assertion for `src/pages/index.astro`.
  - Added runtime e2e redirect coverage in `tests/e2e/smoke.spec.ts` (`page.goto('/')` then `toHaveURL(/\/sv\/$/)`).
- Captured green validation evidence for hardening pass: `pnpm test tests/unit/root-redirect.test.ts`, `pnpm build && CI=1 pnpm test:e2e tests/e2e/smoke.spec.ts`, and required gates (`pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`).

## Next Focus

- Start Step 4.1 directory route implementation using current data/scoring foundations and the completed Phase A shell baseline.
- Optionally apply Phase B documentation updates from `docs/plans/ui-styling.md` into `docs/implementation-plan.md` before Step 4 implementation details expand.
