# System Patterns

## Architecture

Static Astro MPA with selective Preact islands for interactivity. Zero JS by default; islands hydrate only where needed (compare tray, shortlist, charts). Data flows from repository JSON at build time into pre-rendered pages. Client-side shared state is handled with nanostores and URL-state compression (lz-string) for share links.

For the full architectural overview, module boundaries, and data-flow rationale, see `docs/tech-stack.md`. Product constraints and behavior requirements are in `docs/prd.md`.

## Data Loading Pattern

`src/lib/data.ts` uses a `readJsonFile<T>(filePath, context)` generic helper that:

1. Reads a JSON file synchronously from disk (valid for Astro build-time and Vitest).
2. Wraps errors with contextual messages (e.g., "Failed to load Malmö preschool survey for id X").
3. Casts the parsed result via `as T` — no runtime schema validation (data is trusted static repo input).

All data paths resolve from `process.cwd()`, which is the project root in both Astro build and Vitest contexts.

For routes that already have the survey year from `getPreschoolIndex()`, use `getPreschoolSurveyByYear(id, year)` to avoid repeated index-file reads inside per-preschool maps. Keep `getPreschoolSurvey(id)` as a convenience wrapper for call sites that do not yet have year context.

## Scoring / Null-Return Pattern

`src/lib/scoring.ts` returns `null` from `computeOverallScore()` when the `Helhetsbedömning` question group is missing or present-but-empty. Downstream consumers sort `null` scores to the bottom via `byOverallScoreDesc()`. Dev-only `console.warn` fires for invalid response percentages (out-of-range or sums ≠ 100 ± 1).

## Testing Philosophy — KCD Alignment

All tests follow Kent C. Dodds's "Testing Trophy" and "Write fewer, longer tests" principles:

- **Testing Trophy layering**: Static analysis (TypeScript strict mode, ESLint) → Unit tests (data/scoring/i18n contracts) → Integration/E2e tests (Playwright for runtime behavior). No redundant tests that duplicate what static analysis already covers.
- **Fewer, longer tests**: Related assertions are grouped into single test blocks rather than isolated one-assertion-per-test. Example: `scoring.test.ts` has 2 tests covering all scoring scenarios instead of 7 separate tests.
- **No source-inspection tests**: Tests must verify behavior and output, not implementation details. Tests that read `.astro` source files and regex-match CSS class tokens or HTML attributes were removed. Runtime behavior is verified via e2e tests instead.
- **No redundant coverage**: Tests that duplicate coverage provided by other layers (e.g., `types.test.ts` duplicating TypeScript strict mode, `root-redirect.test.ts` duplicating e2e smoke test) are removed.
- **Current test counts**: 13 unit tests + 3 e2e tests = 16 total.

## Shared Test Helper Pattern

Test utilities live in `tests/unit/helpers/`:

- `malmo-data.ts` — resolves file paths to index/survey JSON for test assertions.
- `survey-assertions.ts` — exports `assertResponseShape` (basic 5-key shape check) and `assertResponseContract` (shape + range 0..100 + sum ~100 ± 1). All survey-data test files import from here rather than duplicating key lists.

## Infrastructure Regression Guards

Critical infrastructure invariants are tested as unit tests rather than relying on manual checks:

- `tests/unit/gitignore.test.ts` — verifies `.gitignore` covers required paths (`node_modules/`, `dist/`, `.astro/`, `.DS_Store`, `test-results/`) using `git check-ignore`.

Note: Source-inspection tests were removed during KCD test alignment — they tested implementation details rather than behavior. Runtime assertions (viewport-meta, favicon) moved to e2e `layout-shell.spec.ts`.

## Shell Composition Boundaries

- **CityYearSelector** is a **page-content component**, not a nav component. It is rendered within the main content area of each page, not inside the global `<nav>`. The nav contains only the brand text and a compact language pill.
- **Attribution / data-source** text lives in the **main content area**, not in `<footer>`. It is displayed as two separate lines without a border.
- **`<footer>` landmark**: The `<footer>` element in `BaseLayout.astro` wraps the `Footer.astro` component **outside `<main>`**, preserving the ARIA `contentinfo` landmark for screen readers. Visual styling is borderless (matching mockup) but the semantic landmark must remain.
- **External links**: Footer source link uses `target="_blank"` for external URLs (e.g., Malmö stad).

## Constants Pattern

- **`SURVEY_YEAR`** (`src/lib/constants.ts`): Shared build-time constant (`2025`) imported by components (e.g., CityYearSelector) instead of hardcoding. Centralizes the survey-year value for future year transitions.

## Base Path Pattern

- Astro `base: '/forskoleguiden'` is set in `astro.config.ts` for GitHub Pages project-site deployment (content served under `https://robshape.github.io/forskoleguiden/`).
- Components normalize `import.meta.env.BASE_URL` by stripping any trailing slash: `const base = import.meta.env.BASE_URL.replace(/\/$/, '')`. This prevents double-slash hrefs if Astro ever changes BASE_URL to include a trailing slash. All internal `href` attributes use `${base}/...`.
- The root redirect target in `astro.config.ts` uses the extracted `base` constant to keep the redirect URL in sync: `redirects: { '/': \`${base}/sv/\` }`.
- E2e tests navigate to `/forskoleguiden/sv/` (not `/sv/`). The Playwright webServer health-check URL includes the base path.

## i18n City Names

- City name keys follow the pattern `cityYear.cities.<slug>` (e.g., `cityYear.cities.malmo`). All three locale JSONs (sv, en, ar) must have identical key structures. Arabic uses transliterated names; English uses local English names (e.g., "Gothenburg" for Göteborg). Components use `t()` for all user-visible city names.

## i18n Typing Pattern

- In `src/i18n/utils.ts`, keep locale maps type-safe by defining `translations` with `satisfies Record<Locale, typeof sv>` so compile-time checks catch locale-structure drift. Keep `t()` as the single formatting path for user-facing copy, including placeholder interpolation (e.g., `{score}`).

## Code Organization

- **By feature** (`src/features/`) for application modules — planned for Step 4+.
- **`src/lib/`** for shared utilities: types, data loading, scoring.
- **`src/pages/`** for Astro file-based routing with locale prefixes.
- **`tests/unit/helpers/`** for shared test utilities.
- **`data/`** for static JSON; `data/malmo/index.json` is the directory, `data/malmo/2025/*.json` are per-preschool survey files.
