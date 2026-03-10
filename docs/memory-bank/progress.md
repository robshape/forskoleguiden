# Progress

Current status (2026-03-10): Steps 0–7.1 are complete and Husky pre-commit integration is in place. The repo now ships a comparison route shell at `/sv/jamfor/` with a `client:only="preact"` `ComparisonView` island that renders the empty state. The compare tray CTA for Swedish is a live navigation link — the existing `BaseLayout.astro` route-availability check enabled it when the new route landed, with no tray logic changes. A follow-up fix removed the redirect-on-clear regression, so clearing compare selections on `/sv/jamfor/` now keeps the user on the comparison page and shows the empty state as specified. Step 7.1 intentionally stops at the shell; full data rendering is deferred to Step 7.2. `pnpm validate` is green, and the test suite now stands at 25 unit + 30 e2e = 55 total.

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
- **KCD test alignment**: Tests follow "fewer, longer tests" and Testing Trophy principles. Current count: 25 unit + 29 e2e = 54 total.

## Verification Summary

- Verified Step 6.1 with `pnpm build && pnpm test:e2e -- tests/e2e/preschool-detail-page-contract.spec.ts`.
- Verified Step 6.2 with `pnpm test:e2e --grep preschool-detail` and `pnpm validate`.
- Reran related regressions with `pnpm test:e2e -- tests/e2e/preschool-card-contract.spec.ts tests/e2e/compare-tray-interaction.spec.ts tests/e2e/directory-data-rendering.spec.ts`.
- Ran `pnpm validate` successfully after a Prettier cleanup and a `pnpm install` resync that removed stale `vite@7.3.1` from `node_modules` and restored the lockfile's pinned `vite@6.4.1`. Reran `pnpm validate` after the review-follow-up patch and it remained green.
- Verified Step 7.1 with `pnpm validate` and `pnpm test:e2e -- tests/e2e/comparison-page-route-shell.spec.ts tests/e2e/compare-tray-interaction.spec.ts` (12/12 passing) after removing the redirect-on-clear regression from `ComparisonView`.

- `pnpm lint` — 0 ESLint errors.
- `pnpm lint:md` — 0 markdown lint errors.
- `pnpm format:check` — all files match Prettier code style.
- `pnpm check` — 0 errors, 0 warnings, 0 hints.
- `pnpm test` — 10 passing unit test files, 25 passing unit tests.
- `pnpm build` — build passes and includes the generated Swedish preschool detail pages and comparison route shell.

## Decision Log

### 2026-03-04: `minimumReleaseAge` reduced from 7 days to 3 days

- **Change**: `pnpm-workspace.yaml` `minimumReleaseAge` lowered from `10080` (7 days) to `4320` (3 days).
- **Rationale**: Automated scanners (Socket.dev, Snyk, npm audit) and community reports typically flag malicious packages within 24–48 hours. 3 days provides margin beyond that window while reducing friction for dependency updates.
- **Risk acknowledged**: Scanner detection is probabilistic, not guaranteed. A 3-day window is shorter than the previous 7-day window, which means a sophisticated, slow-to-detect attack has a narrower but non-zero chance of slipping through.
- **Mitigating factors**: This is a low-sensitivity static site with no backend, no user accounts, no secrets at runtime, and no external API calls. The blast radius of a compromised dependency is limited to build-time code execution and static output. Weekly Dependabot schedule further reduces exposure to very-new releases. The `trustPolicy: no-downgrade` setting prevents trust-level regressions.
- **Override mechanism**: For critical hotfixes that need a freshly-published package, add it to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` temporarily.

## Current Priorities

1. **Step 7.2** — wire selected preschool survey data into `ComparisonView` and render the side-by-side comparison table.
2. **Shared response-row reuse** — keep the comparison view on the existing `src/lib/survey-responses.ts` mapping so canonical response labels stay consistent across detail and comparison pages.

## Next Focus

- Implement Step 7.2 by reading the `compareIds` store inside `ComparisonView`, reintroducing only the survey data needed for selected preschools, and rendering the Helhetsbedömning comparison rows while reusing `src/lib/survey-responses.ts`.
