# Progress

Current status (2026-03-02): Steps 0–3 and design foundations are complete. KCD test alignment done. Ready for Step 4.

## Completed Scaffolding Summary

- **Step 0.5 (Tailwind v4 global CSS)**: completed and validated with build artifacts.
- **Step 0.6 (TypeScript path aliases)**: completed; aliases verified.
- **Step 0.7 (package scripts)**: completed; required scripts added (`build`, `check`).
- **Step 0.8 (ESLint/Prettier)**: completed; lint/format pipeline passing.
- **Step 0.9 (Vitest)**: completed; unit test harness passing.
- **Step 0.10 (Playwright)**: completed; e2e tests operational.
- **Step 0.11 (.gitignore)**: completed with regression guard (`tests/unit/gitignore.test.ts`).

## Feature Implementation Summary

- **Step 1 (Data layer)**: `src/lib/types.ts`, `src/lib/data.ts`, `src/lib/scoring.ts`, `src/lib/constants.ts`. Scoring returns `null` for missing Helhetsbedömning; `byOverallScoreDesc` sorts nulls last.
- **Step 2 (i18n)**: Three locale JSONs (`sv`, `en`, `ar`) with identical key structures. `src/i18n/utils.ts` exports `Locale`, `t()`, `getLocaleFromURL()`. City name keys added for all locales.
- **Step 3 (Layout shell)**: `BaseLayout.astro`, `Nav.astro`, `Footer.astro`, `CityYearSelector.astro`. Root redirect (`/` → `/sv/`) via Astro config. Design tokens in `global.css` via Tailwind v4 `@theme`.
- **Step 3.5 (Design foundations)**: Phase A styling (tokens, layout, nav, footer) + Phase A hardening (width alignment, logical utilities, focus-visible e2e). Phase B documentation (implementation-plan updates for Steps 4–8).
- **KCD test alignment**: Consolidated 64 tests → 16 (13 unit + 3 e2e). Removed source-inspection tests, redundant coverage, and one-assertion-per-test patterns. Behavior verified via e2e instead.

## Current Priorities

1. **Step 4 directory page foundation** — next implementation target after shell completion.

## Next Focus

- Start Step 4.1 directory route implementation using current data/scoring foundations and the completed shell baseline.
- Execute Step 4+ implementation work against the completed Phase B documentation baseline in `docs/implementation-plan.md`.
