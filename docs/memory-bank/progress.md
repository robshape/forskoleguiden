# Progress

Current status (2026-03-10): Steps 0–7.4 are complete and Husky pre-commit integration is in place. The repo now ships a fully data-backed comparison view at `/sv/jamfor/`: the Astro route loads all Malmö survey files at build time, and the `client:only="preact"` `ComparisonView` island renders the empty state for 0 selections, a prompt plus one-school results for 1 selection, and a side-by-side Helhetsbedömning comparison table for 2–5 selections. Step 7.4 refined that table for the iPhone 13 mini target viewport with real horizontal overflow, a sticky question column, and dedicated mobile Playwright coverage. The compare tray CTA for Swedish remains a live navigation link, and the clear-on-comparison-page regression remains fixed. `pnpm validate` is green after the Step 7.4 work, and the test suite now stands at 26 unit + 36 e2e = 62 total.

## Completed Scaffolding Summary

- **Step 0.5 (Tailwind v4 global CSS)**: completed and validated with build artifacts.
- **Step 0.6 (TypeScript path aliases)**: completed; aliases verified.
- **Step 0.7 (package scripts)**: completed; required scripts added (`build`, `check`).
- **Step 0.8 (ESLint/Prettier)**: completed; lint/format pipeline passing.
- **Step 0.9 (Vitest)**: completed; unit test harness passing.
- **Step 0.10 (Playwright)**: completed; e2e tests operational.
- **Step 0.11 (.gitignore)**: completed with regression guard (`tests/unit/infrastructure-gitignore-regression.test.ts`).
- **Husky pre-commit hook**: Husky 9.1.7 installed; `prepare` script wired; `.husky/pre-commit` runs `lint-staged` (ESLint + markdownlint + Prettier on staged files) followed by `pnpm check` (Astro type checking); full `pnpm validate` runs in CI only; `lint-staged` 16.3.2 added as pinned devDependency with config in `package.json`; `HUSKY: 0` set in `quality-gates.yml` and `deploy.yml` install steps; 8-test unit contract in `tests/unit/infrastructure-husky-pre-commit-contract.test.ts`.

## Feature Implementation Summary

- **Step 1 (Data layer)**: `src/lib/types.ts`, `src/lib/data.ts`, `src/lib/scoring.ts`, `src/lib/constants.ts`. Scoring returns `null` for missing Helhetsbedömning; `byOverallScoreDesc` sorts nulls last.
- **Step 2 (i18n)**: Three locale JSONs (`sv`, `en`, `ar`) with identical key structures. `src/i18n/utils.ts` exports `Locale`, `t()` (with interpolation params), `getLocaleFromURL()`. City name keys added for all locales.
- **Step 3 (Layout shell)**: `BaseLayout.astro`, `Nav.astro`, `Footer.astro`, `CityYearSelector.astro`. Root redirect (`/` → `/sv/`) via Astro config. Design tokens in `global.css` via Tailwind v4 `@theme`.
- **Step 3.5 (Design foundations)**: Phase A styling (tokens, layout, nav, footer, focus-visible e2e). Phase B documentation (implementation-plan updates for Steps 4–8).
- **Step 4 (Directory page)**: `/sv/` renders preschool cards via `PreschoolCard.astro` with build-time score computation. Default sort is alphabetical; ranking ("Betyg") is available via SortToggle. Rank indices are pre-computed from score-desc order independent of display order. Full-card clickable with hover effects and stacking context for CompareButton. Interactive `SortToggle` Preact island (`client:load`) provides A–Ö/Betyg switching with a "Sort by:" label, aria-live announcements, cached row metadata, and localized group labels. City selector heading simplified to "Stad" (survey year removed from selector, moved to footer attribution with `{year}` interpolation). All user-visible text flows through `t()`. E2e contracts cover card fields, ordering, rank indices, and sort toggling.
- **Step 5.1 (Compare store foundation)**: `src/lib/state.ts` exports `MAX_COMPARE`, `COMPARE_STORAGE_KEY`, a read-only `compareIds` store, `toggleCompare()`, and `clearCompare()` with SSR-safe `sessionStorage` hydration/persistence behind browser guards. Persistence uses `listen()` to avoid immediate default writes, and `tests/unit/compare-store-state-behavior.test.ts` now covers default SSR state, toggle/clear write-back, five-item cap, persisted hydration, and invalid/corrupt storage fallback.
- **Step 5.2 (Compare button UI)**: `src/components/preact/CompareButton.tsx` is wired into `PreschoolCard.astro` and subscribes to the shared compare store so directory cards reflect selected and unselected states with localized copy and `aria-pressed`. `tests/e2e/directory-data-rendering.spec.ts` now verifies selecting two compare buttons, then deselecting one while the remaining button stays selected.
- **Step 5.3 (Compare tray UI)**: `src/components/preact/CompareTray.tsx` is mounted globally from `src/layouts/BaseLayout.astro` as a `client:only="preact"` island and reflects the shared compare store across pages. It renders only when selections exist, shows the localized selected count, disables the compare CTA until the matching compare page route exists, reserves body space with `--tray-height`, and exposes a clear action that resets both tray and compare-button state. `tests/e2e/compare-tray-interaction.spec.ts` covers empty-state hiding, count updates, disabled compare semantics, reload recovery after a full page refresh, clear behavior, keyboard operability, and footer visibility above the tray on a 375×812 viewport.
- **Step 5.4 (Compare MPA persistence)**: `sessionStorage`-backed compare state confirmed to survive Astro cross-page navigations. Minimal `src/pages/sv/om/index.astro` added as MPA navigation target. Three new Playwright cross-page scenarios added to `tests/e2e/compare-tray-interaction.spec.ts` (9 total in that spec): tray selections remain after forward navigation and back, compare-button pressed state is restored after returning from a second page, clearing via the tray on a second page removes tray on return. No compare-store or island logic changes were needed.
- **Step 6.1 (Preschool detail page route)**: Added `src/pages/sv/forskola/[id].astro` with `getStaticPaths()` backed by `getPreschoolIndex()` and `getPreschoolSurveyByYear()`. Each generated detail page renders the preschool name, operator/address metadata, survey year, Helhetsbedömning question text, visible percentage values, and the existing `CompareButton` island. A follow-up patch typed `Astro.props` explicitly and localized the back-navigation landmark label. Playwright coverage in `tests/e2e/preschool-detail-page-contract.spec.ts` now verifies route generation for every preschool, direct detail-page content, compare-button interaction, and the click-through path from the directory.
- **Step 6.2 (Detail-page response breakdown)**: The detail page now renders all five canonical response rows per Helhetsbedömning question using a stable field-to-i18n mapping in `src/pages/sv/forskola/[id].astro`. The detail-page Playwright contract now verifies the ordered Swedish label/value pairs for `almgardens-forskola`, including duplicate `2%` rows and `0%` rows that must not be omitted.
- **Step 7.1 (Comparison route shell)**: `src/pages/sv/jamfor/index.astro` added as the Swedish comparison route. Mounts `ComparisonView` (`client:only="preact"`) with localized heading and empty-state props. The compare tray CTA for Swedish became a live navigation link via the existing `BaseLayout.astro` route-availability check with no tray changes. A review-driven follow-up removed dead unused survey props before scope was confirmed. A later bugfix removed the redirect-on-clear behavior from `ComparisonView`, so the page now stays on `/sv/jamfor/` and renders the empty state after `Rensa`. `tests/e2e/comparison-page-route-shell.spec.ts` now covers route availability, direct empty-state rendering, and the clear-state transition (3 tests); `compare-tray-interaction.spec.ts` covers the now-live CTA plus the corrected keyboard clear behavior.
- **Step 7.2 (ComparisonView table rendering)**: `src/pages/sv/jamfor/index.astro` now calls `getAllPreschoolSurveys()` and passes the serialized data set plus localized single-selection copy into `ComparisonView`. The island reuses `compareIds`, `OVERALL_ASSESSMENT_GROUP`, and `computeAgreeShare()` to render a mobile-safe comparison table in selection order. The one-selected-preschool state now shows both a localized prompt and that preschool's results, and the 2–5 state renders the expected question rows and agree-share percentages. `tests/e2e/comparison-page-route-shell.spec.ts` now covers the one-selected and three-selected states, and `tests/unit/i18n-swedish-copy-contract.test.ts` regression-guards the new `compare.singleSelectionPrompt` key.
- **Step 7.2 follow-up hardening**: comparison-state handling now falls back to the empty state when persisted compare IDs no longer resolve to any loaded survey, preventing a blank comparison shell after data changes. The comparison table now labels its question column explicitly, uses caption-backed semantics for assistive technology support, and resolves comparison cells by question text while the Malmö survey contract test locks the canonical Helhetsbedömning question order.
- **Step 7.3 (empty and single-selection states e2e)**: test-only step. Two new Playwright scenarios added to `tests/e2e/comparison-page-route-shell.spec.ts`: (1) empty-state back-link navigates to directory, one preschool selected via real compare-button UI and opened via tray CTA shows single-selection prompt and results table; (2) clearing one-preschool selection via compare tray stays on comparison page and shows empty state. Spec now stands at 8 tests. No production-code changes. A Prettier issue in the plan file was fixed before `pnpm validate` ran clean.
- **Step 7.4 (mobile comparison refinement)**: `src/components/preact/ComparisonView.tsx` now keeps the question-label column sticky and guarantees real horizontal overflow at 375×812 by switching the comparison table to `w-auto min-w-full`, assigning a stable comparison-scroll wrapper, and enforcing minimum widths for the question and preschool columns. A new Playwright contract in `tests/e2e/comparison-page-route-shell.spec.ts` seeds four preschools, proves the table overflows horizontally, and asserts sticky row labels on the mobile viewport. Spec now stands at 9 tests.
- **KCD test alignment**: Tests follow "fewer, longer tests" and Testing Trophy principles. Current count: 26 unit + 36 e2e = 62 total.

## Verification Summary

- Verified Step 6.1 with `pnpm build && pnpm test:e2e -- tests/e2e/preschool-detail-page-contract.spec.ts`.
- Verified Step 6.2 with `pnpm test:e2e --grep preschool-detail` and `pnpm validate`.
- Reran related regressions with `pnpm test:e2e -- tests/e2e/preschool-card-contract.spec.ts tests/e2e/compare-tray-interaction.spec.ts tests/e2e/directory-data-rendering.spec.ts`.
- Ran `pnpm validate` successfully after a Prettier cleanup and a `pnpm install` resync that removed stale `vite@7.3.1` from `node_modules` and restored the lockfile's pinned `vite@6.4.1`. Reran `pnpm validate` after the review-follow-up patch and it remained green.
- Verified Step 7.1 with `pnpm validate` and `pnpm test:e2e -- tests/e2e/comparison-page-route-shell.spec.ts tests/e2e/compare-tray-interaction.spec.ts` (12/12 passing) after removing the redirect-on-clear regression from `ComparisonView`.
- Verified Step 7.2 with `pnpm test:e2e --grep "comparison page"`, `pnpm test:e2e`, and `pnpm validate` after revising the one-selected-preschool state to show both the prompt and the selected preschool's results.
- Verified the Step 7.2 follow-up hardening with `pnpm exec playwright test tests/e2e/comparison-page-route-shell.spec.ts --reporter=line`, focused unit coverage for `malmo-survey-files-contract.test.ts` and `i18n-swedish-copy-contract.test.ts`, and a final `pnpm validate`.
- Verified Step 7.3 with `pnpm exec playwright test tests/e2e/comparison-page-route-shell.spec.ts --reporter=line` (8/8 passing) and `pnpm validate` (fixed Prettier issue in plan file, then fully green).
- Verified Step 7.4 with `pnpm exec playwright test tests/e2e/comparison-page-route-shell.spec.ts` (9/9 passing, including the 375×812 mobile regression) and `pnpm validate` (lint, markdownlint, format:check, check, unit tests, and build all green).

- `pnpm lint` — 0 ESLint errors.
- `pnpm lint:md` — 0 markdown lint errors.
- `pnpm format:check` — all files match Prettier code style.
- `pnpm check` — 0 errors, 0 warnings, 0 hints.
- `pnpm test` — 10 passing unit test files, 26 passing unit tests.
- `pnpm build` — build passes and includes the generated Swedish preschool detail pages and comparison route shell.

## Decision Log

### 2026-03-04: `minimumReleaseAge` reduced from 7 days to 3 days

- **Change**: `pnpm-workspace.yaml` `minimumReleaseAge` lowered from `10080` (7 days) to `4320` (3 days).
- **Rationale**: Automated scanners (Socket.dev, Snyk, npm audit) and community reports typically flag malicious packages within 24–48 hours. 3 days provides margin beyond that window while reducing friction for dependency updates.
- **Risk acknowledged**: Scanner detection is probabilistic, not guaranteed. A 3-day window is shorter than the previous 7-day window, which means a sophisticated, slow-to-detect attack has a narrower but non-zero chance of slipping through.
- **Mitigating factors**: This is a low-sensitivity static site with no backend, no user accounts, no secrets at runtime, and no external API calls. The blast radius of a compromised dependency is limited to build-time code execution and static output. Weekly Dependabot schedule further reduces exposure to very-new releases. The `trustPolicy: no-downgrade` setting prevents trust-level regressions.
- **Override mechanism**: For critical hotfixes that need a freshly-published package, add it to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` temporarily.

## Current Priorities

1. **Step 8** — add accessible SVG chart rendering, legend, and chart-adjacent table fallback on the comparison page.
2. **Step 9** — implement deterministic comparison summaries and summary text rendering.

## Next Focus

- Move to Step 8 accessible comparison charts and fallback tables.
