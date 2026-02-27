# Förskoleguiden — Copilot Instructions

## IMPORTANT

- ALWAYS pin dependencies to exact versions in `package.json` (no ^ or ~).
- ALWAYS run `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test` after finishing a feature or task.

## Project overview

Static Swedish preschool comparison site (Malmö, 2025 survey data). Parents compare preschools side-by-side using official survey ratings, build a "pick 5" shortlist, and share via URL-encoded state. No backend, no accounts, no external APIs at runtime. Implementation follows the phased plan in `docs/implementation-plan.md`.

## Architecture

- **Astro** (static output) — content-first MPA with islands of interactivity
- **Preact** islands — interactive components hydrated via `client:load`/`client:visible`/`client:idle`
- **nanostores** (`@nanostores/preact`) — cross-island shared state persists across MPA navigations via `sessionStorage`
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`) — see `astro.config.ts`
- **TypeScript** (strict) — `astro/tsconfigs/strict` base; path aliases `@/*` → `src/*`, `@data/*` → `data/*`

Data flow: static JSON (build-time only) → Astro pre-renders HTML → Preact islands hydrate for interactivity → nanostores for client state → lz-string for shareable URL encoding.

## Directory structure (planned, partially implemented)

```text
data/template.json         — Schema template for preschool JSON
data/malmo/index.json      — Directory index (name, address, id, operator type) [planned]
data/malmo/2025/*.json     — Per-preschool survey data [planned]
src/features/              — Feature-organized modules (directory, comparison, shortlist, sharing) [planned]
src/components/astro/      — Static Astro components (layout, nav, footer) [planned]
src/components/preact/     — Interactive Preact islands [planned]
src/i18n/                  — Translation JSON + t() helper [planned]
src/lib/                   — Shared types, state atoms, URL encoding [planned]
src/pages/{sv,en,ar}/      — Astro file-based i18n routing
src/styles/global.css      — Tailwind v4 entry point (@import 'tailwindcss')
tests/unit/**/*.test.ts    — Vitest unit tests
tests/e2e/**/*.spec.ts     — Playwright e2e tests
```

## Key conventions

- **Organize by feature** (`src/features/directory/`, `src/features/comparison/`), not by type. Shared utilities go in `src/lib/`.
- **Astro by default; Preact only for interactivity.** If a component doesn't need client-side state or event handlers, use Astro.
- **No `@astrojs/tailwind`** — Tailwind v4 uses the Vite plugin directly: `@tailwindcss/vite` in `astro.config.ts`. Theme customization via CSS `@theme` blocks in `src/styles/global.css`.
- **i18n**: three locales (`sv`, `en`, `ar`), all prefix-routed (`/sv/`, `/en/`, `/ar/`). Swedish is default. Arabic requires `dir="rtl"` and `rtl:` Tailwind variants.
- **No runtime data fetching** — all preschool data read from `data/` at Astro build time.
- **Formatting**: single quotes, no semicolons (`.prettierrc`). Prettier + prettier-plugin-astro.
- **ESLint**: flat config (`eslint.config.js`) with `@typescript-eslint` + `eslint-plugin-astro`.
- **Markdown linting**: `pnpm lint:md` uses markdownlint-cli2 (MD013/line-length disabled).

## Data model

Preschool JSON follows `data/template.json`: two questions in "Helhetsbedömning" group, five response buckets each. MVP "agree share" = `completelyAgreePercentage + partlyAgreePercentage`.

## Comparison summary logic

Deterministic, non-AI text summaries: delta ≥ 5 pp → "higher"; ≤ −5 pp → "lower"; otherwise "similar". Neutral template phrases only.

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
- **E2e tests**: `tests/e2e/` with Playwright. Config auto-starts `pnpm preview` webserver. See `tests/e2e/smoke.spec.ts` for the baseline pattern.
- **Regression guards**: infrastructure invariants are tested as unit tests (e.g., `tests/unit/gitignore.test.ts` verifies `.gitignore` entries).

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
