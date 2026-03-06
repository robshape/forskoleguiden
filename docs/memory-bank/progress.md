# Progress

Current status (2026-03-06): Steps 0–5.1 are complete through the compare-store hardening follow-up. `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, and `pnpm test` are green. `pnpm check` is currently blocked because `@astrojs/check` is not installed. Test suite: 18 unit + 8 e2e = 26 total.

## Completed Scaffolding Summary

- **Step 0.5 (Tailwind v4 global CSS)**: completed and validated with build artifacts.
- **Step 0.6 (TypeScript path aliases)**: completed; aliases verified.
- **Step 0.7 (package scripts)**: completed; required scripts added (`build`, `check`).
- **Step 0.8 (ESLint/Prettier)**: completed; lint/format pipeline passing.
- **Step 0.9 (Vitest)**: completed; unit test harness passing.
- **Step 0.10 (Playwright)**: completed; e2e tests operational.
- **Step 0.11 (.gitignore)**: completed with regression guard (`tests/unit/infrastructure-gitignore-regression.test.ts`).

## Feature Implementation Summary

- **Step 1 (Data layer)**: `src/lib/types.ts`, `src/lib/data.ts`, `src/lib/scoring.ts`, `src/lib/constants.ts`. Scoring returns `null` for missing Helhetsbedömning; `byOverallScoreDesc` sorts nulls last.
- **Step 2 (i18n)**: Three locale JSONs (`sv`, `en`, `ar`) with identical key structures. `src/i18n/utils.ts` exports `Locale`, `t()` (with interpolation params), `getLocaleFromURL()`. City name keys added for all locales.
- **Step 3 (Layout shell)**: `BaseLayout.astro`, `Nav.astro`, `Footer.astro`, `CityYearSelector.astro`. Root redirect (`/` → `/sv/`) via Astro config. Design tokens in `global.css` via Tailwind v4 `@theme`.
- **Step 3.5 (Design foundations)**: Phase A styling (tokens, layout, nav, footer, focus-visible e2e). Phase B documentation (implementation-plan updates for Steps 4–8).
- **Step 4 (Directory page)**: `/sv/` renders ranked preschool cards via `PreschoolCard.astro` with build-time score computation, deterministic score-desc ranking with name tie-breaks, visible rank indices, heading/count row, and ranking explanation copy. Interactive `SortToggle` Preact island (`client:load`) provides Rankning/A–Ö switching with aria-live announcements, cached row metadata, and localized group labels. All user-visible text flows through `t()`. E2e contracts cover card fields, ordering, rank indices, and sort toggling.
- **Step 5.1 (Compare store foundation)**: `src/lib/state.ts` exports `MAX_COMPARE`, `COMPARE_STORAGE_KEY`, a read-only `compareIds` store, `toggleCompare()`, and `clearCompare()` with SSR-safe `sessionStorage` hydration/persistence behind browser guards. Persistence uses `listen()` to avoid immediate default writes, and `tests/unit/compare-store-state-behavior.test.ts` now covers default SSR state, toggle/clear write-back, five-item cap, persisted hydration, and invalid/corrupt storage fallback.
- **KCD test alignment**: Tests follow "fewer, longer tests" and Testing Trophy principles. Current count: 18 unit + 8 e2e = 26 total.

## Verification Summary

- Verified green in the current workspace context: `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, and `pnpm test`.
- `pnpm check` is currently blocked because the repo does not have `@astrojs/check` installed for the `astro check` script.

## Decision Log

### 2026-03-04: `minimumReleaseAge` reduced from 7 days to 3 days

- **Change**: `pnpm-workspace.yaml` `minimumReleaseAge` lowered from `10080` (7 days) to `4320` (3 days).
- **Rationale**: Automated scanners (Socket.dev, Snyk, npm audit) and community reports typically flag malicious packages within 24–48 hours. 3 days provides margin beyond that window while reducing friction for dependency updates.
- **Risk acknowledged**: Scanner detection is probabilistic, not guaranteed. A 3-day window is shorter than the previous 7-day window, which means a sophisticated, slow-to-detect attack has a narrower but non-zero chance of slipping through.
- **Mitigating factors**: This is a low-sensitivity static site with no backend, no user accounts, no secrets at runtime, and no external API calls. The blast radius of a compromised dependency is limited to build-time code execution and static output. Weekly Dependabot schedule further reduces exposure to very-new releases. The `trustPolicy: no-downgrade` setting prevents trust-level regressions.
- **Override mechanism**: For critical hotfixes that need a freshly-published package, add it to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` temporarily.

## Current Priorities

1. **Step 5.2 compare button UI** — connect directory interactions to the shared compare store and reflect selected/full states.
2. **Step 5.3 compare tray UI** — surface persistent selections and the compare call-to-action across the directory flow.

## Next Focus

- Continue Step 5 with compare button and compare tray work only; do not pull Step 5.4+ implementation forward.
