# Förskoleguiden — Copilot Instructions

## IMPORTANT

- ALWAYS pin dependencies to exact versions in `package.json` (no ^ or ~)
- ALWAYS run `pnpm validate` after finishing a feature or task
- ALWAYS read `docs/memory-bank/` when planning and before writing any code
- ALWAYS read `docs/prd.md` when planning and before writing any code
- ALWAYS read `docs/tech-stack.md` when planning and before writing any code
- After adding a major feature, completing a milestone, or finishing a task, ALWAYS update `docs/memory-bank/`
- ALWAYS use the "frontend-design" SKILL when implementing user interfaces
- ALWAYS use the "tdd" SKILL when writing tests for new code and when updating existing tests

## Project overview

Static Swedish preschool comparison site (Malmö, 2025 survey data). Parents compare preschools side-by-side using official survey ratings, build a "pick 5" shortlist, and share via URL-encoded state. No backend, no accounts, no external APIs at runtime. Implementation follows the phased plan in `docs/implementation-plan-phase-1.md`.

**Current phase**: Phase 1 complete (Steps 0–13). Infrastructure, data pipeline, directory page, detail pages with bar charts, comparison page, deterministic summaries, data attribution, accessibility audits, CI/CD pipeline, and final verification are all done. Next: Phase 2 roadmap items (i18n EN/AR page routes, shortlist, sharing, independent preschool queue links). See `docs/memory-bank/progress.md` for detailed status.

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

| Island           | File                                       | Hydration              | Why                                                                   | Purpose                                                                                                                                                                     |
| ---------------- | ------------------------------------------ | ---------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SortToggle`     | `src/components/preact/SortToggle.tsx`     | `client:load`          | Must be immediately operable; no persisted state conflict             | Toggle alphabetical ↔ rating sort; defaults to alphabetical; mutates DOM row order; `aria-live` announcements                                                               |
| `CompareButton`  | `src/components/preact/CompareButton.tsx`  | `client:only="preact"` | Reads sessionStorage on mount; SSR would render stale pressed state   | Select/deselect a preschool for comparison; `aria-pressed` toggle                                                                                                           |
| `CompareTray`    | `src/components/preact/CompareTray.tsx`    | `client:only="preact"` | SSR would render empty tray; sessionStorage may already have items    | Global compare summary bar; links to `/sv/jamfor/` comparison page. Clearing on the comparison page redirects to the directory page.                                        |
| `ComparisonView` | `src/components/preact/ComparisonView.tsx` | `client:only="preact"` | Reads compareIds store from sessionStorage; SSR output would be stale | Comparison page: card-based layout with score cards, sr-only data tables, and best-per-question summary text. Reads `compareIds` store, renders selected preschools inline. |

**Hydration strategy guidance:**

- `client:load` — default for small interactive widgets that must be immediately operable
- `client:only="preact"` — use when the component's client state would conflict with SSR-rendered empty markup (e.g., CompareTray renders "0 selected" on server but sessionStorage may have saved selections)
- `client:visible` / `client:idle` — prefer for below-the-fold or non-critical islands (none currently used but available)

## CI/CD

**Reusable quality-gates workflow** (`.github/workflows/quality-gates.yml`) — a `workflow_call` workflow containing all quality gate steps: checkout, pnpm/node setup, install, lint, lint:md, format, check, test, build, Playwright browser install, Chromium e2e, and the narrow WebKit Step 7.4 mobile regression. Takes no inputs — pure validation only. Both `deploy.yml` and `dependabot.yml` consume this reusable workflow instead of inlining steps. This pattern was chosen over a local composite action (`.github/actions/`) because Dependabot's `github-actions` ecosystem only scans `.github/workflows/*.yml` for action version updates.

**Deploy workflow** (`.github/workflows/deploy.yml`) triggers on push to `main`. Calls `quality-gates.yml`, then a separate build job (gated on quality-gates passing) rebuilds, uploads the Pages artifact, and a deploy job deploys to GitHub Pages. Uses `GITHUB_TOKEN` for all auth. Concurrency group `pages` cancels in-progress runs. Node and pnpm versions are pinned to exact semver (22.14.0 and 10.29.3).

**Dependabot** (`.github/dependabot.yml`) manages weekly automated dependency and GitHub Actions version updates with grouped PRs and commit prefixes (`deps:`, `ci:`). **`pnpm-workspace.yaml`** enforces `minimumReleaseAge: 4320` (3 days) for supply-chain security — Dependabot PRs may fail CI if a proposed version was published less than 3 days ago; this is expected and self-resolves once the package ages past the threshold.

**Dependabot auto-merge workflow** (`.github/workflows/dependabot.yml`) triggers on `pull_request` (Dependabot PRs) and `push` to `main`. Calls `quality-gates.yml` (without pages artifact) on Dependabot PRs, then auto-approves and enables squash auto-merge once gates pass. On `push` to `main`, it updates open Dependabot PR branches to keep them current. Uses `GITHUB_TOKEN` only (no PAT). Requires "Allow auto-merge" enabled in repo settings.

## Base path

The `base` config is set to `/forskoleguiden` for GitHub Pages project-site deployment. `src/lib/base-path.ts` exports `getBasePath()` which normalizes `import.meta.env.BASE_URL` (strips trailing slash). Use it for all internal hrefs: `${getBasePath()}/${locale}/path`. Never hardcode `/` as the root. E2e tests also use the base path: `page.goto('/forskoleguiden/sv/')`.

## Directory structure

```text
.github/instructions/              — File-scoped instruction files (memory-bank workflow)
.github/skills/                    — Agent skills: tdd/, frontend-design/
.github/workflows/quality-gates.yml — Reusable workflow_call: lint, test, build, e2e (consumed by deploy.yml and dependabot.yml)
.github/workflows/deploy.yml  — Calls quality-gates.yml + deploys to GitHub Pages
data/malmo/index.json         — City directory: lists all preschool IDs, names, addresses, operator types
data/malmo/2025/*.json        — Per-preschool survey data (one file per preschool, keyed by slug ID)
src/lib/types.ts              — TypeScript interfaces: PreschoolSurvey, PreschoolIndex, SurveyResponse, etc.
src/lib/data.ts               — Build-time data loaders: getPreschoolIndex(), getPreschoolSurvey(id), getPreschoolSurveyByYear(id, year), getAllPreschoolSurveys()
src/lib/scoring.ts            — Scoring: computeAgreeShare(), computeOverallScore(), byOverallScoreDesc()
src/lib/constants.ts          — Shared constants: MALMO_SOURCE_URL, SURVEY_YEAR
src/lib/base-path.ts          — getBasePath(): normalizes import.meta.env.BASE_URL (strips trailing slash)
src/lib/survey-responses.ts   — RESPONSE_ROWS: canonical field-to-i18n mapping for the five response labels
src/lib/chart-patterns.tsx    — RESPONSE_SERIES (derived from RESPONSE_ROWS), PatternDef type, renderPatternContent(), TILE_SIZE
src/i18n/{sv,en,ar}.json      — Translation strings per locale (flat dot-path keys)
src/i18n/utils.ts             — Locale type, t(key, locale), getLocaleFromURL()
src/layouts/BaseLayout.astro  — Root HTML shell: sets lang, dir (RTL for ar), loads global CSS
src/components/astro/         — Static Astro components: Nav, Footer, CityYearSelector, PreschoolCard
src/components/preact/        — Interactive Preact islands: SortToggle, CompareButton, CompareTray, ComparisonView
src/pages/sv/                 — Swedish pages: index, om/ (about), forskola/[id].astro (detail), jamfor/ (comparison)
src/styles/global.css         — Tailwind v4 entry + @theme tokens (colors, spacing, shadows)
tests/unit/**/*.test.ts       — Vitest unit tests
tests/unit/helpers/           — Shared test utilities (malmo-data.ts, survey-assertions.ts, i18n.ts)
tests/e2e/**/*.spec.ts        — Playwright e2e tests
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
- **Linting**: ESLint flat config + `@typescript-eslint` + `eslint-plugin-astro` (includes `astro/sort-attributes` for alphabetical attribute ordering in `.astro` files) + `eslint-plugin-better-tailwindcss` (Tailwind v4 class validation: ordering, canonical forms, unknown class detection; `enforce-consistent-line-wrapping` disabled) + `eslint-plugin-simple-import-sort` (auto-sorts/groups imports and exports) + `eslint-plugin-perfectionist` (`sort-jsx-props` rule for alphabetical JSX prop ordering in `.tsx` files); markdownlint-cli2 for Markdown (MD013 disabled).
- **Pre-commit**: Husky runs `lint-staged` before every commit. The `lint-staged` config runs `astro check` + ESLint on TS/Astro files, markdownlint on Markdown, and Prettier on all files. CI skips Husky via `HUSKY=0`.

## Data model

See `src/lib/types.ts` for canonical interfaces. Key types: `PreschoolSurvey`, `PreschoolIndex`, `SurveyResponse`, `OperatorType` (`'municipal' | 'independent'`). Response fields use `*Percent` suffix (e.g. `completelyAgreePercent`, not `Percentage`). Each survey has `id`, `totalRespondentsPercent`, and one or more `questionGroups`. MVP scope: only "Helhetsbedömning" group.

## Scoring & comparison logic

- `OVERALL_ASSESSMENT_GROUP` — constant (`'Helhetsbedömning'`) preventing string drift across codebase
- `computeAgreeShare(response)` → `completelyAgreePercent + partlyAgreePercent` (see `src/lib/scoring.ts`)
- `computeOverallScore(survey)` → average agree share across all questions in the overall assessment group; returns `null` if group is missing
- `byOverallScoreDesc` — comparator for descending sort by overall score (nulls sort last)
- `SCORE_TIER_HIGH` (80) / `SCORE_TIER_MEDIUM` (65) — agree-share percentage thresholds for score badge color tiers in `src/lib/constants.ts`; used by PreschoolCard for visual classification (green/amber/gray)
- Deterministic best-per-question summaries: for each Helhetsbedömning question, identifies the school with the highest agree share; schools within a 5 pp threshold of the best are listed as tied. Uses `computeBestPerQuestion()` and `formatBestPerQuestionText()` from `src/features/comparison/`. Neutral template phrases only.

## Developer workflow

- **Package manager**: `pnpm` (required — enforced via `engines` in `package.json`)
- `pnpm dev` — Astro dev server at `http://localhost:4321`
- `pnpm build` — static output to `dist/`
- `pnpm check` — Astro type checking
- `pnpm test` — Vitest unit tests (`tests/unit/**/*.test.ts`)
- `pnpm test:e2e` — Playwright e2e (`tests/e2e/**/*.spec.ts`); auto-starts `pnpm preview` as webserver
- `pnpm test:e2e:webkit` — narrow WebKit/iPhone 13 mini regression run for `tests/e2e/comparison-page-mobile-webkit.spec.ts`
- `pnpm lint` — ESLint (flat config)
- `pnpm lint:md` — Markdown linting
- `pnpm format` — Prettier (check); `pnpm format:fix` — Prettier (writes)
- `pnpm validate` — runs lint + lint:md + format + check + test + build sequentially (used in CI)

**Pre-commit hook**: `.husky/pre-commit` runs `lint-staged` on staged files only. The `lint-staged` config in `package.json` runs `astro check` + ESLint on `.ts/.tsx/.astro` files, markdownlint on `.md` files, and `prettier --check` on all files. Full `pnpm validate` runs in CI via `quality-gates.yml`.

## Testing patterns

- **Unit tests**: `tests/unit/` with Vitest, node environment. Use `@/` and `@data/` aliases (mirrored in `vitest.config.ts`).
- **Shared test helpers**: `tests/unit/helpers/` — `malmo-data.ts` loads real index/survey paths; `survey-assertions.ts` provides `assertResponseShape()` and `assertResponseContract()` for validating `SurveyResponse` objects.
- **Data contract tests**: `tests/unit/malmo-survey-files-contract.test.ts` validates every JSON file in `data/malmo/2025/` against type contracts — add new preschool JSON and these tests enforce shape/range.
- **E2e tests**: `tests/e2e/` with Playwright. Config auto-starts `pnpm preview` webserver. All e2e paths include the base path: `page.goto('/forskoleguiden/sv/')`. See `tests/e2e/homepage-routing-smoke.spec.ts` for routing, `tests/e2e/preschool-card-contract.spec.ts` for component contracts.
- **Regression guards**: infrastructure invariants are tested as unit tests (e.g., `tests/unit/infrastructure-gitignore-regression.test.ts` verifies `.gitignore` entries).
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

- `.github/instructions/memory-bank.instructions.md` — memory bank workflow (applied to all files via `applyTo: '**'`)
- `.github/skills/tdd/SKILL.md` — test-driven development with red-green-refactor loop
- `.github/skills/frontend-design/SKILL.md` — production-grade frontend interface design
- User-level `agents.instructions.md` — shared agent preferences (modularity, BDD tests, pnpm enforcement)

## Project documentation

- `docs/implementation-plan-phase-1.md` — Phase 1 implementation roadmap (Steps 0–13)
- `docs/prd.md` — product requirements and user flows
- `docs/tech-stack.md` — architectural decisions and technology rationale
- `docs/memory-bank/` — living project context: active work, progress, system patterns, tasks
