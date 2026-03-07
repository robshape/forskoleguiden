# Progress

Current status (2026-03-07): Steps 0–6.1 are complete and Husky pre-commit integration is in place. The repo now includes statically generated Swedish preschool detail pages, and the compare-button interaction works there with the same sessionStorage-backed behavior as the directory page. A follow-up hardening pass localized the back-navigation landmark label, typed the detail-page props explicitly, and added a directory-to-detail click-path contract. `pnpm validate` is green, and the test suite now stands at 25 unit + 26 e2e = 51 total.

## Completed Scaffolding Summary

- **Step 0.5 (Tailwind v4 global CSS)**: completed and validated with build artifacts.
- **Step 0.6 (TypeScript path aliases)**: completed; aliases verified.
- **Step 0.7 (package scripts)**: completed; required scripts added (`build`, `check`).
- **Step 0.8 (ESLint/Prettier)**: completed; lint/format pipeline passing.
- **Step 0.9 (Vitest)**: completed; unit test harness passing.
- **Step 0.10 (Playwright)**: completed; e2e tests operational.
- **Step 0.11 (.gitignore)**: completed with regression guard (`tests/unit/infrastructure-gitignore-regression.test.ts`).
- **Husky pre-commit hook**: Husky 9.1.7 installed; `prepare` script wired; `.husky/pre-commit` runs `pnpm validate`; `HUSKY: 0` set in `quality-gates.yml` and `deploy.yml` install steps; 7-test unit contract in `tests/unit/infrastructure-husky-pre-commit-contract.test.ts`, including regression coverage for false-positive workflow matches.

## Feature Implementation Summary

- **Step 1 (Data layer)**: `src/lib/types.ts`, `src/lib/data.ts`, `src/lib/scoring.ts`, `src/lib/constants.ts`. Scoring returns `null` for missing Helhetsbedömning; `byOverallScoreDesc` sorts nulls last.
- **Step 2 (i18n)**: Three locale JSONs (`sv`, `en`, `ar`) with identical key structures. `src/i18n/utils.ts` exports `Locale`, `t()` (with interpolation params), `getLocaleFromURL()`. City name keys added for all locales.
- **Step 3 (Layout shell)**: `BaseLayout.astro`, `Nav.astro`, `Footer.astro`, `CityYearSelector.astro`. Root redirect (`/` → `/sv/`) via Astro config. Design tokens in `global.css` via Tailwind v4 `@theme`.
- **Step 3.5 (Design foundations)**: Phase A styling (tokens, layout, nav, footer, focus-visible e2e). Phase B documentation (implementation-plan updates for Steps 4–8).
- **Step 4 (Directory page)**: `/sv/` renders ranked preschool cards via `PreschoolCard.astro` with build-time score computation, deterministic score-desc ranking with name tie-breaks, visible rank indices, heading/count row, and ranking explanation copy. Interactive `SortToggle` Preact island (`client:load`) provides Rankning/A–Ö switching with aria-live announcements, cached row metadata, and localized group labels. All user-visible text flows through `t()`. E2e contracts cover card fields, ordering, rank indices, and sort toggling.
- **Step 5.1 (Compare store foundation)**: `src/lib/state.ts` exports `MAX_COMPARE`, `COMPARE_STORAGE_KEY`, a read-only `compareIds` store, `toggleCompare()`, and `clearCompare()` with SSR-safe `sessionStorage` hydration/persistence behind browser guards. Persistence uses `listen()` to avoid immediate default writes, and `tests/unit/compare-store-state-behavior.test.ts` now covers default SSR state, toggle/clear write-back, five-item cap, persisted hydration, and invalid/corrupt storage fallback.
- **Step 5.2 (Compare button UI)**: `src/components/preact/CompareButton.tsx` is wired into `PreschoolCard.astro` and subscribes to the shared compare store so directory cards reflect selected and unselected states with localized copy and `aria-pressed`. `tests/e2e/directory-data-rendering.spec.ts` now verifies selecting two compare buttons, then deselecting one while the remaining button stays selected.
- **Step 5.3 (Compare tray UI)**: `src/components/preact/CompareTray.tsx` is mounted globally from `src/layouts/BaseLayout.astro` as a `client:only="preact"` island and reflects the shared compare store across pages. It renders only when selections exist, shows the localized selected count, disables the compare CTA until the matching compare page route exists, reserves body space with `--tray-height`, and exposes a clear action that resets both tray and compare-button state. `tests/e2e/compare-tray-interaction.spec.ts` covers empty-state hiding, count updates, disabled compare semantics, reload recovery after a full page refresh, clear behavior, keyboard operability, and footer visibility above the tray on a 375×812 viewport.
- **Step 5.4 (Compare MPA persistence)**: `sessionStorage`-backed compare state confirmed to survive Astro cross-page navigations. Minimal `src/pages/sv/om/index.astro` added as MPA navigation target. Three new Playwright cross-page scenarios added to `tests/e2e/compare-tray-interaction.spec.ts` (9 total in that spec): tray selections remain after forward navigation and back, compare-button pressed state is restored after returning from a second page, clearing via the tray on a second page removes tray on return. No compare-store or island logic changes were needed.
- **Step 6.1 (Preschool detail page route)**: Added `src/pages/sv/forskola/[id].astro` with `getStaticPaths()` backed by `getPreschoolIndex()` and `getPreschoolSurveyByYear()`. Each generated detail page renders the preschool name, operator/address metadata, survey year, Helhetsbedömning question text, visible percentage values, and the existing `CompareButton` island. A follow-up patch typed `Astro.props` explicitly and localized the back-navigation landmark label. Playwright coverage in `tests/e2e/preschool-detail-page-contract.spec.ts` now verifies route generation for every preschool, direct detail-page content, compare-button interaction, and the click-through path from the directory.
- **KCD test alignment**: Tests follow "fewer, longer tests" and Testing Trophy principles. Current count: 25 unit + 26 e2e = 51 total.

## Verification Summary

- Verified Step 6.1 with `pnpm build && pnpm test:e2e -- tests/e2e/preschool-detail-page-contract.spec.ts`.
- Reran related regressions with `pnpm test:e2e -- tests/e2e/preschool-card-contract.spec.ts tests/e2e/compare-tray-interaction.spec.ts tests/e2e/directory-data-rendering.spec.ts`.
- Ran `pnpm validate` successfully after a Prettier cleanup and a `pnpm install` resync that removed stale `vite@7.3.1` from `node_modules` and restored the lockfile's pinned `vite@6.4.1`. Reran `pnpm validate` after the review-follow-up patch and it remained green.

- `pnpm lint` — 0 ESLint errors.
- `pnpm lint:md` — 0 markdown lint errors.
- `pnpm format:check` — all files match Prettier code style.
- `pnpm check` — 0 errors, 0 warnings, 0 hints.
- `pnpm test` — 10 passing unit test files, 25 passing unit tests.
- `pnpm build` — build passes and includes the generated Swedish preschool detail pages.

## Decision Log

### 2026-03-04: `minimumReleaseAge` reduced from 7 days to 3 days

- **Change**: `pnpm-workspace.yaml` `minimumReleaseAge` lowered from `10080` (7 days) to `4320` (3 days).
- **Rationale**: Automated scanners (Socket.dev, Snyk, npm audit) and community reports typically flag malicious packages within 24–48 hours. 3 days provides margin beyond that window while reducing friction for dependency updates.
- **Risk acknowledged**: Scanner detection is probabilistic, not guaranteed. A 3-day window is shorter than the previous 7-day window, which means a sophisticated, slow-to-detect attack has a narrower but non-zero chance of slipping through.
- **Mitigating factors**: This is a low-sensitivity static site with no backend, no user accounts, no secrets at runtime, and no external API calls. The blast radius of a compromised dependency is limited to build-time code execution and static output. Weekly Dependabot schedule further reduces exposure to very-new releases. The `trustPolicy: no-downgrade` setting prevents trust-level regressions.
- **Override mechanism**: For critical hotfixes that need a freshly-published package, add it to `minimumReleaseAgeExclude` in `pnpm-workspace.yaml` temporarily.

## Current Priorities

1. **Step 6.2 follow-up** — add the full five-response breakdown on preschool detail pages without breaking the new Step 6.1 route contract.
2. **Comparison route** — implement `/sv/jamfor/` so the existing compare tray CTA can activate via the established route-availability check.

## Next Focus

- Build on the now-stable directory, compare, and detail-page foundation by implementing Step 6.2 or Step 7 next; when the compare page route lands, re-enable the tray CTA by satisfying the build-time route-availability check rather than changing the Step 5.3 disabled contract ad hoc.
