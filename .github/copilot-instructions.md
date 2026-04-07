# Förskoleguiden — Copilot Instructions

## Rules

- ALWAYS pin dependencies to exact versions in `package.json` (no ^ or ~)
- ALWAYS run `pnpm validate` after finishing a feature or task
- ALWAYS read `docs/prd.md` and `docs/tech-stack.md` when planning and before writing any code

## Project overview

Static Swedish preschool comparison site (Malmö, 2025 survey data). No backend, no accounts, no external APIs at runtime. See `docs/prd.md` for product requirements, `docs/tech-stack.md` for architecture decisions, `.impeccable.md` for design context.

**Status**: Phase 1 complete (Steps 0–13). Phase 2 specs 001–010 complete. Specs 012–016 are future roadmap — see `docs/implementation-plan-phase-2.md`.

## Architecture

- **Astro** (static output) with **Preact** islands for interactivity, **nanostores** for cross-island state via `sessionStorage`
- **Tailwind CSS v4** via `@tailwindcss/vite` (NOT `@astrojs/tailwind`) — tokens in `src/styles/global.css`
- **TypeScript** (strict) — path aliases `@/*` → `src/*`, `@data/*` → `data/*`
- **No runtime data fetching** — all data read from `data/` at build time via `src/lib/data.ts`

Data flow: static JSON → Astro pre-renders HTML → Preact islands hydrate → nanostores for client state.

## Key conventions

- **Astro by default; Preact only for interactivity.** Astro components receive `locale: Locale` and call `t()` for text. Preact islands depending on `sessionStorage` use `client:only="preact"` to avoid SSR mismatches.
- **Arrow functions for utilities; named `function` declarations for Preact components** (better DevTools traces).
- **Organize by feature** (`src/features/`), not by type. Shared utilities in `src/lib/`.
- **Layout pattern**: all pages use `<BaseLayout locale={locale} title={...}>` which sets `lang`, `dir` (RTL for Arabic), and renders Nav + Footer.
- **i18n**: three locales (`sv`, `en`, `ar`) in `src/i18n/`. Use `t('key.path', locale)` with `{placeholder}` interpolation. All locale JSONs must have identical key structures (enforced by unit test).
- **Base path**: use `getBasePath()` from `src/lib/base-path.ts` for all internal hrefs — never hardcode `/` as root. E2e tests include base path: `page.goto('/forskoleguiden/sv/')`.
- **Formatting**: single quotes, no semicolons (`.prettierrc`). ESLint enforces import/prop ordering and Tailwind v4 class validation.

## Build and test

- `pnpm dev` — dev server at `localhost:4321`
- `pnpm build` — static output to `dist/`
- `pnpm test` — Vitest unit tests
- `pnpm test:e2e` — Playwright e2e (auto-starts preview server)
- `pnpm test:e2e:webkit` — WebKit/iPhone 17 mobile regression
- `pnpm test:post-build` — page-weight budget + static output contracts
- `pnpm audit:lighthouse` — accessibility (≥0.95) and performance (≥0.9) gates
- `pnpm validate` — full quality gate (lint → format → check → test → build → e2e → Lighthouse)

Pre-commit: Husky runs `lint-staged` (astro check + ESLint + markdownlint + Prettier on staged files).

## Constraints

- Zero JS by default — only Preact islands add JS (~3–5 KB total)
- Mobile-first: iPhone 17 (393×852), responsive 320–430 px
- Shortlist limited to 5 preschools (`MAX_COMPARE` in `src/lib/constants.ts`)
- URL share links must stay under ~2,000 chars

## Documentation

| Doc                                   | Scope                                                   |
| ------------------------------------- | ------------------------------------------------------- |
| `docs/prd.md`                         | Product requirements and user flows                     |
| `docs/tech-stack.md`                  | Architecture decisions and technology rationale         |
| `docs/implementation-plan-phase-2.md` | Phase 2 roadmap (active)                                |
| `.impeccable.md`                      | Design context, brand personality, aesthetic principles |
| `specs/001–016/`                      | Detailed specifications per feature                     |
| `docs/plans/codebase-analysis.md`     | Identified refactoring priorities                       |
