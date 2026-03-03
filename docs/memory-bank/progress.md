# Progress

Current status (2026-03-03): Steps 0–3 and design foundations are complete. Step 4.1 route-level build-time data wiring is complete, including review hardening fixes and required quality gates.

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
- **Step 4.1 (Directory route wiring)**: `src/pages/sv/index.astro` assembles build-time directory data using `getPreschoolIndex()`, `getPreschoolSurveyByYear(id, year)`, and `computeOverallScore()`. Review hardening added a year-based survey loader to avoid N+1 index reads on the page path, moved score/fallback copy into i18n locale files, and clarified the Step 4.1 e2e test name plus status assertion diagnostics. Validation is green for build + lint + markdown lint + format + unit + targeted/regression e2e gates.
- **i18n utility interpolation**: `src/i18n/utils.ts` now supports optional interpolation params in `t(key, locale, params)` and preserves unresolved placeholders. `/sv` now renders score percent text via `t('directory.scorePercent', locale, { score })`; coverage updated in `tests/unit/i18n-utils.test.ts`.
- **Step 4.1 follow-up patch**: `/sv` route now uses localized page title (`t('site.title', locale)`) and localized list aria-label (`t('directory.listAriaLabel', locale)`). Locale files include `directory.listAriaLabel` in `sv/en/ar`; data-loader tests were simplified to behavioral assertions only (removed readFileSync call-count checks) to align with KCD testing guidance.
- **KCD test alignment**: Consolidated 64 tests → 16 (13 unit + 3 e2e). Removed source-inspection tests, redundant coverage, and one-assertion-per-test patterns. Behavior verified via e2e instead.

## Current Priorities

1. **Step 4 directory page foundation** — next implementation target after shell completion.

## Next Focus

- Start Step 4.2 card component implementation with strict scope isolation from Step 4.3+ behavior.
- Keep Step 4.1 acceptance test and shell smoke tests green during Step 4.2 work.
