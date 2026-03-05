# Förskoleguiden — Copilot Instructions

## IMPORTANT

- ALWAYS pin dependencies to exact versions in `package.json` (no ^ or ~).
- ALWAYS run `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, `pnpm check`, `pnpm test` after finishing a feature or task (matches CI gate order).

## Project overview

Static Swedish preschool comparison site (Malmö, 2025 survey data). Parents compare preschools side-by-side using official survey ratings, build a "pick 5" shortlist, and share via URL-encoded state. No backend, no accounts, no external APIs at runtime. Implementation follows the phased plan in `docs/implementation-plan.md`.

## Architecture

- **Astro** (static output) — content-first MPA with islands of interactivity
- **Preact** islands — interactive components hydrated via `client:load`/`client:visible`/`client:idle`
- **nanostores** (`@nanostores/preact`) — cross-island shared state persists across MPA navigations via `sessionStorage`
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`) — see `astro.config.ts`
- **TypeScript** (strict) — `astro/tsconfigs/strict` base; path aliases `@/*` → `src/*`, `@data/*` → `data/*`

Data flow: static JSON (build-time only) → Astro pre-renders HTML → Preact islands hydrate for interactivity → nanostores for client state → lz-string for shareable URL encoding.

## CI/CD

**Reusable quality-gates workflow** (`.github/workflows/quality-gates.yml`) — a `workflow_call` workflow containing all quality gate steps: checkout, pnpm/node setup, install, lint, lint:md, format:check, check, test, build, Playwright install, e2e. Takes no inputs — pure validation only. Both `deploy.yml` and `dependabot.yml` consume this reusable workflow instead of inlining steps. This pattern was chosen over a local composite action (`.github/actions/`) because Dependabot's `github-actions` ecosystem only scans `.github/workflows/*.yml` for action version updates.

**Deploy workflow** (`.github/workflows/deploy.yml`) triggers on push to `main`. Calls `quality-gates.yml`, then a separate build job (gated on quality-gates passing) rebuilds, uploads the Pages artifact, and a deploy job deploys to GitHub Pages. Uses `GITHUB_TOKEN` for all auth. Concurrency group `pages` cancels in-progress runs. Node and pnpm versions are pinned to exact semver (22.14.0 and 10.29.3).

**Dependabot** (`.github/dependabot.yml`) manages weekly automated dependency and GitHub Actions version updates with grouped PRs and commit prefixes (`deps:`, `ci:`). **`pnpm-workspace.yaml`** enforces `minimumReleaseAge: 4320` (3 days) for supply-chain security — Dependabot PRs may fail CI if a proposed version was published less than 3 days ago; this is expected and self-resolves once the package ages past the threshold.

**Dependabot auto-merge workflow** (`.github/workflows/dependabot.yml`) triggers on `pull_request` (Dependabot PRs) and `push` to `main`. Calls `quality-gates.yml` (without pages artifact) on Dependabot PRs, then auto-approves and enables squash auto-merge once gates pass. On `push` to `main`, it updates open Dependabot PR branches to keep them current. Uses `GITHUB_TOKEN` only (no PAT). Requires "Allow auto-merge" enabled in repo settings.

## Base path

The `base` config is set to `/forskoleguiden` for GitHub Pages project-site deployment. `src/lib/base-path.ts` exports `getBasePath()` which normalizes `import.meta.env.BASE_URL` (strips trailing slash). Use it for all internal hrefs: `${getBasePath()}/${locale}/path`. Never hardcode `/` as the root. E2e tests also use the base path: `page.goto('/forskoleguiden/sv/')`.

## Directory structure

```text
.github/workflows/quality-gates.yml — Reusable workflow_call: lint, test, build, e2e (consumed by deploy.yml and dependabot.yml)
.github/workflows/deploy.yml  — Calls quality-gates.yml + deploys to GitHub Pages
data/template.json            — Schema template for preschool JSON (reference only — actual shape is in src/lib/types.ts)
data/malmo/index.json         — City directory: lists all preschool IDs, names, addresses, operator types
data/malmo/2025/*.json        — Per-preschool survey data (one file per preschool, keyed by slug ID)
src/lib/types.ts              — TypeScript interfaces: PreschoolSurvey, PreschoolIndex, SurveyResponse, etc.
src/lib/data.ts               — Build-time data loaders: getPreschoolIndex(), getPreschoolSurvey(id), getPreschoolSurveyByYear(id, year), getAllPreschoolSurveys()
src/lib/scoring.ts            — Scoring: computeAgreeShare(), computeOverallScore(), byOverallScoreDesc()
src/lib/constants.ts          — Shared constants: MALMO_SOURCE_URL, SURVEY_YEAR
src/lib/base-path.ts          — getBasePath(): normalizes import.meta.env.BASE_URL (strips trailing slash)
src/i18n/{sv,en,ar}.json      — Translation strings per locale (flat dot-path keys)
src/i18n/utils.ts             — Locale type, t(key, locale), getLocaleFromURL()
src/layouts/BaseLayout.astro  — Root HTML shell: sets lang, dir (RTL for ar), loads global CSS
src/components/astro/         — Static Astro components: Nav, Footer, CityYearSelector, PreschoolCard
src/components/preact/        — Interactive Preact islands: SortToggle
src/features/                 — Feature-organized modules (directory, comparison, shortlist, sharing) [planned]
src/pages/{sv,en,ar}/         — Astro file-based i18n routing (pages pass locale to BaseLayout)
src/styles/global.css         — Tailwind v4 entry + @theme tokens (colors, spacing, shadows)
tests/unit/**/*.test.ts       — Vitest unit tests
tests/unit/helpers/           — Shared test utilities (malmo-data.ts, survey-assertions.ts)
tests/e2e/**/*.spec.ts        — Playwright e2e tests
```

## Key conventions

- **Organize by feature** (`src/features/directory/`, `src/features/comparison/`), not by type. Shared utilities go in `src/lib/`.
- **Astro by default; Preact only for interactivity.** If a component doesn't need client-side state or event handlers, use Astro. Astro components receive `locale: Locale` as a prop and call `t()` for all user-facing text — see `Nav.astro`, `Footer.astro` for the pattern.
- **Layout pattern**: all pages wrap content in `<BaseLayout locale={locale} title={...}>`. BaseLayout sets `lang`, `dir` (RTL for Arabic), loads global CSS, and renders Nav + Footer.
- **No `@astrojs/tailwind`** — Tailwind v4 uses the Vite plugin directly: `@tailwindcss/vite` in `astro.config.ts`. Design tokens are defined as `@theme` variables in `src/styles/global.css` (e.g. `--color-primary-600`, `--max-width-content`).
- **i18n**: three locales (`sv`, `en`, `ar`), all prefix-routed (`/sv/`, `/en/`, `/ar/`). Swedish is default. Arabic requires `dir="rtl"` and `rtl:` Tailwind variants. Use `t('dot.path.key', locale)` from `src/i18n/utils.ts` — returns the key string as fallback if missing. Supports interpolation: `t('compareTray.selectedCount', locale, { count: 3 })` replaces `{count}` in the template. All three locale JSONs must have identical key structures (enforced by unit test). `Locale` type and `getLocaleFromURL()` are exported from the same module.
- **No runtime data fetching** — all preschool data read from `data/` at Astro build time via `src/lib/data.ts` loaders (uses `readFileSync` + `process.cwd()`).
- **Formatting**: single quotes, no semicolons (`.prettierrc`). Prettier + prettier-plugin-astro.
- **ESLint**: flat config (`eslint.config.js`) with `@typescript-eslint` + `eslint-plugin-astro`.
- **Markdown linting**: `pnpm lint:md` uses markdownlint-cli2 (MD013/line-length disabled).

## Data model

See `src/lib/types.ts` for canonical interfaces. Key types: `PreschoolSurvey`, `PreschoolIndex`, `SurveyResponse`, `OperatorType` (`'municipal' | 'independent'`). Response fields use `*Percent` suffix (e.g. `completelyAgreePercent`, not `Percentage`). Each survey has `id`, `totalRespondentsPercent`, and one or more `questionGroups`. MVP scope: only "Helhetsbedömning" group.

## Scoring & comparison logic

- `computeAgreeShare(response)` → `completelyAgreePercent + partlyAgreePercent` (see `src/lib/scoring.ts`)
- `computeOverallScore(survey)` → average agree share across all questions in "Helhetsbedömning"; returns `null` if group is missing
- `byOverallScoreDesc` — comparator for descending sort by overall score (nulls sort last)
- Deterministic text summaries: delta ≥ 5 pp → "higher"; ≤ −5 pp → "lower"; otherwise "similar". Neutral template phrases only.

## Developer workflow

- **Package manager**: `pnpm` (required — enforced via `engines` in `package.json`)
- `pnpm dev` — Astro dev server at `http://localhost:4321`
- `pnpm build` — static output to `dist/`
- `pnpm check` — Astro type checking
- `pnpm test` — Vitest unit tests (`tests/unit/**/*.test.ts`)
- `pnpm test:e2e` — Playwright e2e (`tests/e2e/**/*.spec.ts`); auto-starts `pnpm preview` as webserver
- `pnpm lint` — ESLint (flat config)
- `pnpm lint:md` — Markdown linting
- `pnpm format` — Prettier (writes); `pnpm format:check` (CI-safe check)

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
