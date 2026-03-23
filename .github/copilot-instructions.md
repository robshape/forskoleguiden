# Förskoleguiden — Copilot Instructions

## IMPORTANT

- ALWAYS pin dependencies to exact versions in `package.json` (no ^ or ~)
- ALWAYS run `pnpm validate` after finishing a feature or task
- ALWAYS read `docs/prd.md` when planning and before writing any code
- ALWAYS read `docs/tech-stack.md` when planning and before writing any code

## Project overview

Static Swedish preschool comparison site (Malmö, 2025 survey data). Parents compare preschools side-by-side using official survey ratings, build a "pick 5" shortlist, and share via URL-encoded state. No backend, no accounts, no external APIs at runtime. Implementation follows the phased plan in `docs/implementation-plan-phase-1.md`.

## Design Context

See `.impeccable.md` for users, brand personality, aesthetic direction, platforms, and design principles.

**Current phase**: Phase 1 complete (Steps 0–13). Infrastructure, data pipeline, directory page, detail pages with bar charts, comparison page, deterministic summaries, data attribution, accessibility audits, CI/CD pipeline, and final verification are all done. Next: Phase 2 roadmap items (i18n EN/AR page routes, shortlist, sharing, independent preschool queue links) — see `docs/implementation-plan-phase-2.md`.

## Architecture

- **Astro** (static output) — content-first MPA with islands of interactivity
- **Preact** islands — interactive components hydrated via `client:load`/`client:visible`/`client:idle`
- **nanostores** (`@nanostores/preact`) — cross-island shared state persists across MPA navigations via `sessionStorage`
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`) — see `astro.config.ts`
- **TypeScript** (strict) — `astro/tsconfigs/strict` base; path aliases `@/*` → `src/*`, `@data/*` → `data/*`

Data flow: static JSON (build-time only) → Astro pre-renders HTML → Preact islands hydrate for interactivity → nanostores for client state.

## State management

`src/lib/state.ts` manages the compare shortlist with nanostores + `sessionStorage`:

- `compareIds` — read-only atom of selected preschool IDs (max `MAX_COMPARE = 5`)
- `toggleCompare(id)` — add/remove an ID; silently refuses when at max capacity
- `clearCompare()` — reset all selections
- Persistence: `listen()` callback writes to `sessionStorage` on every change; hydration reads persisted state on first client mount
- **SSR-safe**: browser guards on `typeof window` / `typeof sessionStorage` prevent build-time and SSR crashes — safe to import in Astro front matter (the module just returns empty defaults server-side)
- **MPA-safe**: `sessionStorage` survives Astro page navigations; Preact islands re-subscribe on each page's hydration

Preact islands consume the store via `useStore(compareIds)` from `@nanostores/preact`. Never write to the internal atom directly — use `toggleCompare` / `clearCompare`.

## Preact islands inventory

| Island            | File                                        | Hydration                   | Why                                                                                              | Purpose                                                                                                                                                                                              |
| ----------------- | ------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SortToggle`      | `src/components/preact/SortToggle.tsx`      | `client:load`               | Must be immediately operable; no persisted state conflict                                        | Toggle alphabetical/rating sort; defaults to alphabetical; mutates DOM row order; `aria-live` announcements                                                                                          |
| `CompareButton`   | `src/components/preact/CompareButton.tsx`   | `client:only="preact"`      | Reads sessionStorage on mount; SSR would render stale pressed state                              | Select/deselect a preschool for comparison; `aria-pressed` toggle                                                                                                                                    |
| `CompareTray`     | `src/components/preact/CompareTray.tsx`     | `client:only="preact"`      | SSR would render empty tray; sessionStorage may already have items                               | Global compare summary bar; links to `/sv/jamfor/` comparison page. Clearing on the comparison page redirects to the directory page.                                                                 |
| `ComparisonView`  | `src/components/preact/ComparisonView.tsx`  | `client:only="preact"`      | Reads compareIds store from sessionStorage; SSR output would be stale                            | Comparison page orchestrator: resolves selected surveys, renders question sections with `ComparisonCard` sub-components, and best-per-question summary. Reads `compareIds` store.                    |
| `ComparisonCard`  | `src/components/preact/ComparisonCard.tsx`  | _(child of ComparisonView)_ | Sub-component rendered by ComparisonView; not hydrated independently                             | Single preschool row within a comparison question section: remove button, school link, agree-share score, sr-only data table.                                                                        |
| `BreadcrumbLink`  | `src/components/preact/BreadcrumbLink.tsx`  | `client:load`               | Must resolve `?from=compare` query param to swap breadcrumb target immediately                   | Declarative breadcrumb link that renders default directory back-link, or comparison back-link when `?from=compare` is in the URL. Updates parent `<nav>` aria-label.                                 |
| `DetailsBarChart` | `src/components/preact/DetailsBarChart.tsx` | _(none, static render)_     | Rendered inside `QuestionCard.astro` within `aria-hidden="true"`; no client interactivity needed | Scalable SVG bar chart with pattern fills for color-blind safety. Used on detail pages (`/sv/forskola/[id]`). Wrapped by `QuestionCard.astro` which adds the question heading and agree-share badge. |

**Hydration strategy guidance:**

- `client:load` — default for small interactive widgets that must be immediately operable
- `client:only="preact"` — use when the component's client state would conflict with SSR-rendered empty markup (e.g., CompareTray renders "0 selected" on server but sessionStorage may have saved selections)
- `client:visible` / `client:idle` — prefer for below-the-fold or non-critical islands (none currently used but available)

## CI/CD

- `pnpm validate` runs the full quality gate (lint, format, check, test, build, e2e, Lighthouse)
- CI uses `.github/workflows/quality-gates.yml` (reusable `workflow_call`, consumed by `deploy.yml` and `dependabot.yml`)
- Deploy: push to `main` → quality gates → GitHub Pages. Uses `GITHUB_TOKEN` only.
- Dependabot: weekly grouped PRs with 3-day minimum release age (`pnpm-workspace.yaml`)
- Lighthouse CI: accessibility (min 0.95, error) and performance (min 0.9, warn) — `pnpm audit:lighthouse`
- See `.github/workflows/` for full pipeline details.

## Base path

The `base` config defaults to `/forskoleguiden` for GitHub Pages project-site deployment, overridable via `BASE_PATH` env var. `src/lib/base-path.ts` exports `getBasePath()` which normalizes `import.meta.env.BASE_URL` (strips trailing slash). Use it for all internal hrefs: `${getBasePath()}/${locale}/path`. Never hardcode `/` as the root. E2e tests also use the base path: `page.goto('/forskoleguiden/sv/')`.

## Directory structure

```text
.agents/skills/                    — Design/UX skills (21 Impeccable skills)
.github/agents/                    — SpecKit agents (analyze, plan, implement, etc.)
.github/workflows/quality-gates.yml — Reusable workflow_call: lint, test, build, e2e (consumed by deploy.yml and dependabot.yml)
.github/workflows/deploy.yml  — Calls quality-gates.yml + deploys to GitHub Pages
data/malmo/index.json         — City directory: lists all preschool IDs, names, addresses, operator types
data/malmo/2025/*.json        — Per-preschool survey data (one file per preschool, keyed by slug ID)
src/lib/types.ts              — TypeScript interfaces: PreschoolSurvey, PreschoolIndex, SurveyResponse, etc.
src/lib/data.ts               — Build-time data loaders: getPreschoolIndex(), getPreschoolSurveyByYear(id, year), getAllPreschoolSurveys()
src/lib/scoring.ts            — Scoring: computeAgreeShare(), computeOverallScore(), byOverallScoreDesc(), getScoreTier(), SCORE_TIER_BADGE_CLASS, SCORE_TIER_TEXT_CLASS
src/lib/constants.ts          — Shared constants: MALMO_SOURCE_URL, SURVEY_YEAR, SCORE_TIER_*, PLACEHOLDER_RESPONDENTS, MALMO_DATA_DIR
src/lib/base-path.ts          — getBasePath(): normalizes import.meta.env.BASE_URL (strips trailing slash)
src/lib/survey-responses.ts   — RESPONSE_ROWS: canonical field-to-i18n mapping for the five response labels
src/lib/chart-patterns.tsx    — RESPONSE_SERIES (derived from RESPONSE_ROWS), PatternDef type, renderPatternContent(), TILE_SIZE
src/i18n/{sv,en,ar}.json      — Translation strings per locale (flat dot-path keys)
src/i18n/utils.ts             — Locale type, t(key, locale), getLocaleFromURL()
src/layouts/BaseLayout.astro  — Root HTML shell: sets lang, dir (RTL for ar), loads global CSS
src/components/astro/         — Static Astro components: Nav, Footer, CityYearSelector, PreschoolCard, QuestionCard
src/components/preact/        — Interactive Preact islands: SortToggle, CompareButton, CompareTray, ComparisonView, ComparisonCard, BreadcrumbLink, DetailsBarChart; sort-helpers.ts utility
src/features/comparison/      — Comparison domain logic: computeBestPerQuestion(), formatBestPerQuestionText()
src/pages/sv/                 — Swedish pages: index, om/ (about), forskola/[id].astro (detail), jamfor/ (comparison)
src/styles/global.css         — Tailwind v4 entry + @theme tokens (colors, spacing, shadows)
tests/unit/**/*.test.ts       — Vitest unit tests
tests/unit/helpers/           — Shared test utilities (malmo-data.ts, survey-assertions.ts, i18n.ts)
tests/e2e/**/*.spec.ts        — Playwright e2e tests
tests/e2e/helpers.ts          — Shared e2e utilities: URL constants, card locators, hydration guards
tests/post-build/**/*.test.ts — Post-build verification: page-weight-budget (100 KB uncompressed), static-output-verification
```

## Key conventions

- **Arrow functions for utilities; named functions for components.** All utility/helper functions use `const fn = () => {}` (arrow function expression). Preact components use `export default function ComponentName() {}` (named function declaration — better DevTools displayName and stack traces). Never mix `function` declarations into utility code.
- **Organize by feature**, not by type. Shared utilities go in `src/lib/`.
- **Astro by default; Preact only for interactivity.** If a component doesn't need client-side state or event handlers, use Astro. Astro components receive `locale: Locale` as a prop and call `t()` for all user-facing text — see `Nav.astro`, `Footer.astro` for the pattern. Preact islands that depend on persisted client state (e.g., `sessionStorage`) should use `client:only="preact"` to avoid SSR/client hydration mismatches.
- **Layout pattern**: all pages wrap content in `<BaseLayout locale={locale} title={...}>`. BaseLayout sets `lang`, `dir` (RTL for Arabic), loads global CSS, and renders Nav + Footer.
- **No `@astrojs/tailwind`** — Tailwind v4 uses the Vite plugin directly: `@tailwindcss/vite` in `astro.config.ts`. Design tokens are defined as `@theme` variables in `src/styles/global.css` (e.g. `--color-primary-600`, `--max-width-content`).
- **i18n**: three locales (`sv`, `en`, `ar`) defined in `src/i18n/`. Currently **only Swedish pages exist** (`/sv/`); EN/AR page routes are planned but not yet built — see `docs/implementation-plan-phase-1.md`. Arabic requires `dir="rtl"` and `rtl:` Tailwind variants when added. Use `t('dot.path.key', locale)` from `src/i18n/utils.ts` — returns the key string as fallback if missing. Supports interpolation: `t('compareTray.selectedCount', locale, { count: 3 })` replaces `{count}` in the template. All three locale JSONs must have identical key structures (enforced by unit test). `Locale` type and `getLocaleFromURL()` are exported from the same module.
- **No runtime data fetching** — all preschool data read from `data/` at Astro build time via `src/lib/data.ts` loaders (uses `readFileSync` + `process.cwd()`).
- **Formatting**: single quotes, no semicolons — see `.prettierrc`.
- **Linting**: ESLint flat config enforces attribute/import/prop ordering and Tailwind v4 class validation automatically. Markdownlint for Markdown (MD013 disabled). See `eslint.config.ts` for full plugin list.
- **Pre-commit**: Husky runs `lint-staged` (astro check + ESLint + markdownlint + Prettier on staged files). CI skips via `HUSKY=0`.

## Data model

See `src/lib/types.ts` for canonical interfaces. Key types: `PreschoolSurvey`, `PreschoolIndex`, `SurveyResponse`, `OperatorType` (`'municipal' | 'independent'`). Response fields use `*Percent` suffix (e.g. `completelyAgreePercent`, not `Percentage`). Each survey has `id`, `totalRespondentsPercent`, and one or more `questionGroups`. MVP scope: only "Helhetsbedömning" group.

## Scoring & comparison logic

- `OVERALL_ASSESSMENT_GROUP` — constant (`'Helhetsbedömning'`) preventing string drift across codebase
- `computeAgreeShare(response)` → `completelyAgreePercent + partlyAgreePercent` (see `src/lib/scoring.ts`)
- `computeOverallScore(survey)` → average agree share across all questions in the overall assessment group; returns `null` if group is missing
- `byOverallScoreDesc` — comparator for descending sort by overall score (nulls sort last)
- `SCORE_TIER_HIGH` (80) / `SCORE_TIER_MEDIUM` (65) — agree-share percentage thresholds for score badge color tiers in `src/lib/constants.ts`; used by PreschoolCard for visual classification (green/amber/gray)
- `getScoreTier(displayScore)` → maps a display score to a `ScoreTier` (`'high' | 'medium' | 'low' | 'none'`) using the threshold constants; used by `PreschoolCard.astro` for score badge CSS class selection
- Deterministic best-per-question summaries: for each Helhetsbedömning question, identifies the school with the highest agree share; schools within a 5 pp threshold of the best are listed as tied. Uses `computeBestPerQuestion()` and `formatBestPerQuestionText()` from `src/features/comparison/`. Neutral template phrases only.

## Developer workflow

- **Package manager**: `pnpm` (required — enforced via `engines` in `package.json`)
- `pnpm dev` — Astro dev server at `http://localhost:4321`
- `pnpm build` — static output to `dist/`
- `pnpm check` — Astro type checking
- `pnpm test` — Vitest unit tests (`tests/unit/**/*.test.ts`)
- `pnpm test:e2e` — Playwright e2e (`tests/e2e/**/*.spec.ts`); auto-starts `pnpm preview` as webserver
- `pnpm test:e2e:webkit` — narrow WebKit/iPhone 13 mini regression run for `tests/e2e/comparison-page-mobile-webkit.spec.ts`
- `pnpm test:post-build` — post-build verification (page weight budget, static output contracts)
- `pnpm audit:lighthouse` — Lighthouse CI accessibility/performance audit against built site
- `pnpm lint` — ESLint (flat config)
- `pnpm lint:md` — Markdown linting
- `pnpm format` — Prettier (check); `pnpm format:fix` — Prettier (writes)
- `pnpm validate` — runs lint + lint:md + format + check + test + build sequentially (used in CI)

**Pre-commit hook**: `.husky/pre-commit` runs `lint-staged` on staged files only. The `lint-staged` config in `package.json` runs `astro check` + ESLint on `.ts/.tsx/.astro` files, markdownlint on `.md` files, and `prettier --check` on all files. Full `pnpm validate` runs in CI via `quality-gates.yml`.

## Testing patterns

- **Unit tests**: `tests/unit/` with Vitest, node environment. Use `@/` and `@data/` aliases (mirrored in `vitest.config.ts`).
- **Shared test helpers**: `tests/unit/helpers/` — `malmo-data.ts` loads real index/survey paths; `survey-assertions.ts` provides `assertResponseShape()` and `assertResponseContract()` for validating `SurveyResponse` objects.
- **Data contract tests**: `tests/unit/malmo-survey-files-contract.test.ts` validates every JSON file in `data/malmo/2025/` against type contracts — add new preschool JSON and these tests enforce shape/range.
- **E2e tests**: `tests/e2e/` with Playwright. Config auto-starts `pnpm preview` webserver. All e2e paths include the base path: `page.goto('/forskoleguiden/sv/')`. See `tests/e2e/homepage-routing-smoke.spec.ts` for routing, `tests/e2e/preschool-card-contract.spec.ts` for component contracts. Coverage includes `user-flow-phase1.spec.ts` (full Phase 1 user journey), `accessibility-axe-core.spec.ts` (wcag2a/wcag2aa), and `keyboard-navigation-focus-ring.spec.ts`.
- **Shared e2e helpers**: `tests/e2e/helpers.ts` — URL constants (`DIRECTORY_URL`, `COMPARISON_URL`, `DETAIL_URL`), card locators (`getDirectoryCard()`, `getCompareButton()`), and hydration guards (`waitForCompareButtonReady()`, `waitForCompareButtonSelected()`).
- **Post-build tests**: `tests/post-build/` with Vitest, run via `pnpm test:post-build` (uses `vitest.post-build.config.ts`). Enforces page-weight budget (100 KB uncompressed) and static output contracts against the built `dist/` directory.
- **BDD-style test names**: test files use behavior-descriptive names (e.g., `scoring-overall-score-utilities.test.ts`, `i18n-locale-key-parity.test.ts`), not generic names.

## Accessibility requirements

- All interactive elements keyboard navigable
- Charts: ARIA attributes + pattern fills (not color-only), with `<table>` text alternative in static HTML
- Color-blind-safe palette with non-color encodings
- Test with `@axe-core/playwright` in e2e tests

## Important constraints

- Zero JS by default (Astro). Only Preact islands add JS (~3-5 KB total).
- No external APIs at runtime — no map tiles, no analytics, no chart CDNs
- Mobile-first targeting iPhone 13 mini viewport
- Shortlist limited to 5 preschools (matches Malmö municipality application)
- URL share links must stay under ~2,000 chars

## Agent customizations

- `.agents/skills/` — 21 design/UX skills (i-frontend-design, i-audit, i-adapt, etc.)
- `.github/agents/` — SpecKit agents (analyze, plan, implement, etc.)
- User-level `agents.instructions.md` — shared agent preferences (modularity, BDD tests, pnpm enforcement)

## Project documentation

- `docs/implementation-plan-phase-1.md` — Phase 1 implementation roadmap (Steps 0–13)
- `docs/prd.md` — product requirements and user flows
- `docs/tech-stack.md` — architectural decisions and technology rationale
