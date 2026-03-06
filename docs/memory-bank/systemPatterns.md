# System Patterns

## Architecture

Static Astro MPA with selective Preact islands for interactivity. Zero JS by default; islands hydrate only where needed. The current shipped islands are the directory sort toggle and the per-card compare button, while compare tray, shortlist, and charts remain planned follow-up islands. Data flows from repository JSON at build time into pre-rendered pages. Client-side shared state is handled with nanostores; URL-state compression (lz-string) will be added when the sharing feature is built.

For the full architectural overview, module boundaries, and data-flow rationale, see `docs/tech-stack.md`. Product constraints and behavior requirements are in `docs/prd.md`.

## SessionStorage-Backed Nanostore State

- `src/lib/state.ts` keeps compare selections in an `atom<string[]>` so Preact islands can share state across page navigations.
- Hydration and persistence must stay behind browser guards (`window` / `sessionStorage` checks) so module evaluation remains safe during Astro SSR/prerender and Vitest node imports.
- Enforce the five-item cap in store helpers (`MAX_COMPARE`, `toggleCompare`) rather than UI components so every entry point honors the same limit.
- Keep the writable atom private and export a read-only store via `readonlyType(...)` so consumers cannot mutate compare state directly.
- Use `listen()` rather than `subscribe()` for persistence side effects so browser-backed stores do not immediately write default state back to `sessionStorage` on registration.
- Export persistence keys such as `COMPARE_STORAGE_KEY` from the store module so tests and other consumers reuse the same literal.

## Global Compare Tray Mount Pattern

- The compare tray lives in `src/components/preact/CompareTray.tsx` and is mounted once from `src/layouts/BaseLayout.astro` with `client:only="preact"` so it can initialize directly from browser-persisted compare state without SSR/client hydration mismatches after a reload.
- Keep the tray island dumb: pass localized labels and the locale/base-aware compare href from Astro rather than importing translation helpers or recomputing routing inside Preact.
- Determine compare-page availability in `BaseLayout.astro` with a build-time `import.meta.glob('/src/pages/*/jamfor/index.astro')` check and pass a boolean prop into the tray. If the route is missing for the current locale, render a focusable `aria-disabled` button instead of a live link.
- The tray must return `null` when `compareIds` is empty so the hidden-state contract is enforced by rendering, not by CSS toggles.
- The tray writes its measured height to a global `--tray-height` CSS variable. Base styles consume that variable on `body` to reserve enough bottom space so the fixed tray cannot obscure footer or end-of-page content.
- For Step 5.3 specifically, avoid SSR hydration for the tray because compare selections are session-backed client state. A server-rendered empty tray can mismatch with persisted browser state on reload; `client:only` sidesteps that class of bug cleanly.
- The Step 5.3 tray is intentionally count-based only. If future work needs selected preschool names in the tray, pass a lookup map deliberately rather than broadening the shared store API.

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
- **Fewer, longer tests**: Related assertions are grouped into single test blocks rather than isolated one-assertion-per-test. Example: `scoring-overall-score-utilities.test.ts` has 4 tests covering the core scoring behavior set in one cohesive suite.
- **No source-inspection tests**: Tests must verify behavior and output, not implementation details. Tests that read `.astro` source files and regex-match CSS class tokens or HTML attributes were removed. Runtime behavior is verified via e2e tests instead.
- **No redundant coverage**: Tests that duplicate coverage provided by other layers (e.g., `types.test.ts` duplicating TypeScript strict mode, `root-redirect.test.ts` duplicating e2e smoke test) are removed.
- **Current test counts**: 18 unit tests + 15 e2e tests = 33 total.

## Shared Test Helper Pattern

Test utilities live in `tests/unit/helpers/`:

- `malmo-data.ts` — resolves file paths to index/survey JSON for test assertions.
- `survey-assertions.ts` — exports `assertResponseShape` (basic 5-key shape check) and `assertResponseContract` (shape + range 0..100 + sum ~100 ± 1). All survey-data test files import from here rather than duplicating key lists.

## Infrastructure Regression Guards

Critical infrastructure invariants are tested as unit tests rather than relying on manual checks:

- `tests/unit/infrastructure-gitignore-regression.test.ts` — verifies `.gitignore` covers required paths (`node_modules/`, `dist/`, `.astro/`, `.DS_Store`, `test-results/`) using `git check-ignore`.

Note: Source-inspection tests were removed during KCD test alignment — they tested implementation details rather than behavior. Runtime assertions (viewport-meta, favicon) moved to e2e `layout-shell-accessibility.spec.ts`.

## Shell Composition Boundaries

- **CityYearSelector** is a **page-content component**, not a nav component. It is rendered within the main content area of each page, not inside the global `<nav>`. The nav contains only the brand text and a compact language pill.
- **Attribution / data-source** text lives in the **main content area**, not in `<footer>`. It is displayed as two separate lines without a border.
- **`<footer>` landmark**: The `<footer>` element in `BaseLayout.astro` wraps the `Footer.astro` component **outside `<main>`**, preserving the ARIA `contentinfo` landmark for screen readers. Visual styling is borderless (matching mockup) but the semantic landmark must remain.
- **External links**: Footer source link uses `target="_blank"` for external URLs (e.g., Malmö stad).

## Constants Pattern

- **`SURVEY_YEAR`** (`src/lib/constants.ts`): Shared build-time constant (`2025`) imported by components (e.g., CityYearSelector) instead of hardcoding. Centralizes the survey-year value for future year transitions.

## Reusable CI Workflow Pattern

- **`quality-gates.yml`** (`.github/workflows/quality-gates.yml`) is a `workflow_call` reusable workflow that encapsulates all quality gate steps (checkout, pnpm/node setup, install, lint, lint:md, format:check, check, test, build, Playwright install, e2e). Takes no inputs — pure validation only. Artifact upload is the caller's responsibility (deploy.yml has a separate build job for that).
- Both `deploy.yml` and `dependabot.yml` consume `quality-gates.yml` instead of inlining duplicate step definitions. This eliminates step drift between the two pipelines.
- A reusable workflow was chosen over a local composite action (`.github/actions/`) because Dependabot's `github-actions` ecosystem only scans `.github/workflows/*.yml` for pinned action version updates — a composite action's pinned versions would not receive automated update PRs.

## Base Path Pattern

- Astro `base: '/forskoleguiden'` is set in `astro.config.ts` for GitHub Pages project-site deployment (content served under `https://robshape.github.io/forskoleguiden/`).
- Components normalize `import.meta.env.BASE_URL` by stripping any trailing slash: `const base = import.meta.env.BASE_URL.replace(/\/$/, '')`. This prevents double-slash hrefs if Astro ever changes BASE_URL to include a trailing slash. All internal `href` attributes use `${base}/...`.
- The root redirect target in `astro.config.ts` uses the extracted `base` constant to keep the redirect URL in sync: `redirects: { '/': \`${base}/sv/\` }`.
- E2e tests navigate to `/forskoleguiden/sv/` (not `/sv/`). The Playwright webServer health-check URL includes the base path.

## i18n City Names

- City name keys follow the pattern `cityYear.cities.<slug>` (e.g., `cityYear.cities.malmo`). All three locale JSONs (sv, en, ar) must have identical key structures. Arabic uses transliterated names; English uses local English names (e.g., "Gothenburg" for Göteborg). Components use `t()` for all user-visible city names.

## i18n Typing Pattern

- In `src/i18n/utils.ts`, keep locale maps type-safe by defining `translations` with `satisfies Record<Locale, typeof sv>` so compile-time checks catch locale-structure drift. Keep `t()` as the single formatting path for user-facing copy, including placeholder interpolation (e.g., `{score}`).

## Island String Interpolation Pattern

Preact islands receive pre-localized label strings from Astro props rather than importing `t()` directly. When a label depends on dynamic client state (e.g. `aria-pressed` toggling between "Compare" and "Added", or the tray showing a count), the island receives a _template string_ and interpolates at runtime. This is a conscious trade-off: the alternative (passing every possible pre-interpolated variant) scales poorly as state combinations grow. Accept this pattern — do not try to refactor it away.

## Code Organization

- **`src/lib/`** for shared utilities: types, data loading, scoring, compare state.
- **`src/pages/`** for Astro file-based routing with locale prefixes.
- **`tests/unit/helpers/`** for shared test utilities.
- **`data/`** for static JSON; `data/malmo/index.json` is the directory, `data/malmo/2025/*.json` are per-preschool survey files.
