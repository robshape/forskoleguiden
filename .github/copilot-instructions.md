# Förskoleguiden — Copilot Instructions

## IMPORTANT

- ALWAYS pin dependencies to exact versions in `package.json` (no ^ or ~).

## Project overview

Static Swedish preschool comparison site (Malmö, 2025 survey data). Parents compare preschools side-by-side using official survey ratings, build a "pick 5" shortlist, and share via URL-encoded state. No backend, no accounts, no external APIs at runtime.

## Architecture

- **Astro** (static output) — content-first MPA with islands of interactivity
- **Preact** islands — interactive components (compare tray, shortlist panel, charts) hydrated via `client:load`/`client:visible`/`client:idle`
- **nanostores** (`@nanostores/preact`) — cross-island shared state that persists across MPA page navigations via `sessionStorage`
- **Tailwind CSS v4** — utility-first styling with `rtl:` variant for Arabic
- **TypeScript** (strict) — all code is TypeScript; preschool JSON shapes are validated by TS interfaces at build time

Data flows: static JSON → Astro build reads at build time → pre-rendered HTML + hydrated Preact islands → nanostores for client state → lz-string for shareable URL encoding.

## Directory structure

```text
data/malmo/2025/*.json     — Per-preschool survey data (build-time only)
data/malmo/index.json      — Directory index (name, address, id, operator type)
src/features/              — Feature-organized modules (directory, comparison, shortlist, sharing)
src/components/astro/      — Static Astro components (layout, nav, footer)
src/components/preact/     — Interactive Preact islands (CompareTray, ShortlistPanel, Chart)
src/i18n/{sv,en,ar}.json   — Translation strings per locale
src/i18n/utils.ts          — t() helper and locale detection
src/lib/types.ts           — TypeScript interfaces for preschool data model
src/lib/state.ts           — nanostores atoms (compare set, shortlist, locale)
src/lib/url-state.ts       — lz-string encode/decode for shareable URLs
src/pages/{sv,en,ar}/      — Astro file-based i18n routing
```

## Key conventions

- **Organize code by feature** (`src/features/directory/`, `src/features/comparison/`) not by type. Shared utilities go in `src/lib/`.
- **Astro components** for static content; **Preact islands** only where interactivity is needed. Default to Astro — add Preact only when the component needs client-side state or event handlers.
- **Charts are hand-rolled Preact SVG** — `<svg>` with `<rect>`, `<pattern>`, `<text>`, and ARIA attributes. No chart library. Every chart has a static `<table>` fallback rendered by Astro for no-JS/screen-reader access.
- **i18n**: three locales (`sv`, `en`, `ar`). Swedish is default. Use `t('key')` helper from `src/i18n/utils.ts`. Arabic requires `dir="rtl"` on layouts and `rtl:` Tailwind variants.
- **No runtime data fetching** — all preschool data is read from `data/` at Astro build time. Adding a preschool requires adding a JSON file and rebuilding.
- **URL state** uses lz-string to compress `{city, year, compareIds, shortlistIds}` into a URL-safe base64 param. Decode with `try/catch` + type guard (untrusted input).

## Data model

Preschool JSON follows `data/template.json`. Key shape:

```json
{
  "preschoolName": "string",
  "address": "string",
  "surveyYear": 2025,
  "questionGroups": [{
    "name": "Helhetsbedömning",
    "questions": [{
      "text": "string",
      "response": {
        "completelyAgreePercentage": 0,
        "partlyAgreePercentage": 0,
        "neitherAgreeNorDisagreePercentage": 0,
        "partlyDisagreePercentage": 0,
        "completelyDisagreePercentage": 0
      }
    }]
  }]
}
```

MVP scope: only the "Helhetsbedömning" question group (2 questions, 5 response buckets each). "Agree share" = `completelyAgreePercentage + partlyAgreePercentage`.

## Comparison summary logic

Deterministic, non-AI text summaries:

- Compute agree share per question per preschool
- Delta ≥ 5 pp → "higher"; ≤ −5 pp → "lower"; otherwise → "similar"
- Use neutral template phrases — no subjective wording

## Developer workflow

- **Package manager**: `pnpm` (required, not npm/yarn)
- **Dev server**: `pnpm dev` — runs Astro dev server
- **Build**: `pnpm build` — outputs static files to `dist/`
- **Unit tests**: `pnpm test` — Vitest
- **E2E + a11y tests**: `pnpm test:e2e` — Playwright with @axe-core/playwright
- **Lint**: `pnpm lint` — ESLint with eslint-plugin-astro
- **Format**: `pnpm format` — Prettier with prettier-plugin-astro
- **Deploy**: push to `main` → GitHub Actions builds → GitHub Pages

## Accessibility requirements

- All interactive elements must be keyboard navigable
- Charts must include ARIA attributes and pattern fills (not color-only)
- Every chart needs a `<table>` text alternative in the static HTML
- Color palette must be color-blind-safe with non-color encodings
- Test with `@axe-core/playwright` in e2e tests

## Important constraints

- Zero JS shipped by default (Astro). Only Preact islands add JS (~3-5 KB total).
- No external APIs at runtime — no map tiles, no analytics, no chart CDNs
- Mobile-first design targeting iPhone 13 mini viewport
- Shortlist limited to 5 preschools (matches Malmö municipality application process)
- URL share links must stay under ~2,000 chars
