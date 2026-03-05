# Progress

Current status (2026-03-05): Steps 0–4 are complete through Step 4.4 sort toggle delivery. Required quality gates and targeted Step 4.4 e2e regressions are green.

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
- **Step 2 (i18n)**: Three locale JSONs (`sv`, `en`, `ar`) with identical key structures. `src/i18n/utils.ts` exports `Locale`, `t()`, `getLocaleFromURL()`. City name keys added for all locales.
- **Step 3 (Layout shell)**: `BaseLayout.astro`, `Nav.astro`, `Footer.astro`, `CityYearSelector.astro`. Root redirect (`/` → `/sv/`) via Astro config. Design tokens in `global.css` via Tailwind v4 `@theme`.
- **Step 3.5 (Design foundations)**: Phase A styling (tokens, layout, nav, footer) + Phase A hardening (width alignment, logical utilities, focus-visible e2e). Phase B documentation (implementation-plan updates for Steps 4–8).
- **Step 4.1 (Directory route wiring)**: `src/pages/sv/index.astro` assembles build-time directory data using `getPreschoolIndex()`, `getPreschoolSurveyByYear(id, year)`, and `computeOverallScore()`. Review hardening added a year-based survey loader to avoid N+1 index reads on the page path, moved score/fallback copy into i18n locale files, and clarified the Step 4.1 e2e test name plus status assertion diagnostics. Validation is green for build + lint + markdown lint + format + unit + targeted/regression e2e gates.
- **i18n utility interpolation**: `src/i18n/utils.ts` now supports optional interpolation params in `t(key, locale, params)` and preserves unresolved placeholders. `/sv` now renders score percent text via `t('directory.scorePercent', locale, { score })`; coverage updated in `tests/unit/i18n-utilities-behavior.test.ts`.
- **Step 4.1 follow-up patch**: `/sv` route now uses localized page title (`t('site.title', locale)`) and localized list aria-label (`t('directory.listAriaLabel', locale)`). Locale files include `directory.listAriaLabel` in `sv/en/ar`; data-loader tests were simplified to behavioral assertions only (removed readFileSync call-count checks) to align with KCD testing guidance.
- **Step 4.2 (Phase 2 component only)**: Created `src/components/astro/PreschoolCard.astro` with required props (`id`, `name`, `address`, `operatorType`, `score`, `locale`), static detail link pattern (`/{locale}/forskola/{id}/`), operator badge, score percentage badge + supporting label text, defensive null-score fallback, and static compare placeholder button (`data-id={id}`). Phase 3 page integration is intentionally pending.
- **Step 4.2 (Phase 3 integration)**: `src/pages/sv/index.astro` now renders `PreschoolCard` for each preschool entry (instead of plain inline list rows), preserving build-time data assembly and locale wiring. Acceptance e2e `tests/e2e/preschool-card-contract.spec.ts` is green on fresh build output (`pnpm build && CI=1 pnpm test:e2e tests/e2e/preschool-card-contract.spec.ts`) after minimal selector alignment to `directory.listAriaLabel` semantics and localized score-percent spacing.
- **Step 4.2 (Phase 3 review revision)**: Acceptance e2e now verifies cards via stable detail-link href targeting (`/sv/forskola/{id}/`) per preschool index entry, removing dependence on exact section aria-label text and list-order/index-order coupling while preserving card contract assertions (name, address, operator label, and score-or-fallback presence).
- **Step 4.2 (a11y/i18n hardening patch)**: `PreschoolCard` now uses i18n keys for compare label and score badge labels across locales (`sv/en/ar`), includes interpolated compare button `aria-label` with preschool name, removes redundant score-circle `aria-label` in favor of null-state `sr-only` text, and exposes `data-testid="preschool-card"` for resilient e2e selection. Step 4.2 e2e no longer imports `data.ts`/`fs` path; it validates rendered card contract via DOM structure and accessible-name assertions.
- **Post-rename test hardening (2026-03-04)**: `tests/unit/data-loader-contract.test.ts` now throws explicitly when Helhetsbedömning is missing (no silent pass path), and `src/components/astro/PreschoolCard.astro` adds `data-testid="score-fallback"` so `tests/e2e/preschool-card-contract.spec.ts` can assert fallback behavior without brittle `.sr-only` class coupling.
- **Step 4.3 (complete)**:
  - `/sv/` directory now sorts preschools by descending overall score using `byOverallScoreDesc` with deterministic name tie-breaks.
  - Directory list renders visible rank positions (`1..N`) for each card row.
  - Heading row renders localized count text (`Förskolor i Malmö (N)`) and static active sort label (`Rankning`).
  - Ranking transparency copy is rendered via `directory.rankingExplanation` i18n key.
  - Locale parity updated across `src/i18n/sv.json`, `src/i18n/en.json`, and `src/i18n/ar.json`.
  - Contract coverage added in `tests/e2e/directory-data-rendering.spec.ts` and Swedish copy contract extended in `tests/unit/i18n-swedish-copy-contract.test.ts`.
  - Final validation passes: `pnpm lint`, `pnpm lint:md`, `pnpm check`, `pnpm format`, `pnpm test`, and `pnpm build && CI=1 pnpm test:e2e tests/e2e/directory-data-rendering.spec.ts`.
- **Step 4.3 hardening follow-up (complete)**:
  - Replaced in-place sort mutation in `/sv/` route with immutable `sortedDirectory` copy before sorting.
  - Added visual rhythm fix by applying `mt-4` between ranking explanation text and directory list.
  - Hardened Step 4.3 e2e contracts by documenting current score-derived order, switching heading-count assertion to regex (`\(\d+\)`), and replacing prefix-based rank checks with exact rank-span assertions.
- **Step 4.4 (Phase 2 complete)**:
  - Added `src/components/preact/SortToggle.tsx` and wired it into `/sv/` with `client:load`.
  - Preserved default Step 4.3 ranking render (score-desc with deterministic name tie-break + visible rank indices) and kept existing heading/explanation copy intact.
  - Added row metadata (`data-name`, `data-rank-order`) and list id wiring so `Rankning` / `A–Ö` toggles deterministically reorder cards and update visible row rank spans.
  - Hardened TSX type-checking with file-scoped `/** @jsxImportSource preact */` in `src/components/preact/SortToggle.tsx` and added `src/env.d.ts` (`astro/client`) for stable Astro typing.
  - Validation green: targeted sort-toggle e2e, full `directory-data-rendering` e2e spec, `pnpm lint`, `pnpm lint:md`, `pnpm check`, `pnpm format`, and `pnpm test`.
- **Step 4.4 (Phase 3 complete)**:
  - Strengthened sort-toggle e2e behavior contract in `tests/e2e/directory-data-rendering.spec.ts` to assert rank-index updates for known row content during mode toggles.
  - Ran targeted e2e regressions for directory sorting and preschool-card contract; both pass.
  - Completed required gate suite (`pnpm lint`, `pnpm lint:md`, `pnpm check`, `pnpm format`, `pnpm test`) with green status.
- **Step 4.4 (review-feedback patch complete)**:
  - Added localized sort group accessibility labels via `directory.sort.groupLabel` across `src/i18n/sv.json`, `src/i18n/en.json`, and `src/i18n/ar.json`; `/sv/` now passes `groupLabel` into `SortToggle`.
  - Replaced fragile positional rank span selectors with stable `data-testid="rank-index"` hooks and renamed ranking metadata to explicit `data-rank-index-zero-based`.
  - Added `aria-live="polite"` announcement region (`data-testid="sort-live-region"`) for sort mode changes.
  - Added initial-effect mount guard and cached row metadata in `SortToggle` to avoid redundant initial DOM churn and repeated per-toggle DOM traversal.
  - Tightened typing by using `Locale` for `SortToggle` locale props and renamed e2e suite label to `Swedish directory data rendering contracts`.
  - Validation green: `pnpm lint`, `pnpm lint:md`, `pnpm check`, `pnpm format`, `pnpm test`, `pnpm build`, and `pnpm playwright test tests/e2e/directory-data-rendering.spec.ts`.
- **KCD test alignment**: Consolidated 64 tests → 16 (13 unit + 3 e2e). Removed source-inspection tests, redundant coverage, and one-assertion-per-test patterns. Behavior verified via e2e instead.

## Decision Log

### 2026-03-04: `minimumReleaseAge` reduced from 7 days to 3 days

- **Change**: `pnpm-workspace.yaml` `minimumReleaseAge` lowered from `10080` (7 days) to `4320` (3 days).
- **Rationale**: Automated scanners (Socket.dev, Snyk, npm audit) and community reports typically flag malicious packages within 24–48 hours. 3 days provides margin beyond that window while reducing friction for dependency updates.
- **Risk acknowledged**: Scanner detection is probabilistic, not guaranteed. A 3-day window is shorter than the previous 7-day window, which means a sophisticated, slow-to-detect attack has a narrower but non-zero chance of slipping through.
- **Mitigating factors**: This is a low-sensitivity static site with no backend, no user accounts, no secrets at runtime, and no external API calls. The blast radius of a compromised dependency is limited to build-time code execution and static output. Weekly Dependabot schedule further reduces exposure to very-new releases. The `trustPolicy: no-downgrade` setting prevents trust-level regressions.
- **Override mechanism**: For critical hotfixes that need a freshly-published package, add it to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` temporarily.

## Current Priorities

1. **Step 5.1 compare-store foundation** — implement `compareIds`, `toggleCompare`, `clearCompare`, and max-cap behavior in `src/lib/state.ts`.

## Next Focus

- Begin Step 5 implementation while keeping compare-tray and compare-button UI interactions for subsequent Step 5.2/5.3 tasks.
