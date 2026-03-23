# forskoleguiden Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-23

## Active Technologies

- TypeScript 5.9.3 (strict mode via `astro/tsconfigs/strict`) + Astro 6.0.4 (static output), Tailwind CSS 4.2.1 (via `@tailwindcss/vite`), `src/i18n/utils.ts` (`t()`, `Locale` type), `src/lib/base-path.ts` (`getBasePath()`) (002-language-switcher)
- N/A — no new data entities; `sessionStorage` compare set is unaffected by locale switch (002-language-switcher)

- TypeScript 5.9.3 (strict mode via `astro/tsconfigs/strict`) + Astro 6.0.4 (static output), Preact 10.29.0, nanostores 1.1.1, Tailwind CSS 4.2.1 (via `@tailwindcss/vite`) (001-multi-locale-routes)

## Project Structure

```text
data/
docs/
specs/
src/
tests/
```

## Commands

pnpm validate

## Code Style

TypeScript 5.9.3 (strict mode via `astro/tsconfigs/strict`): Follow standard conventions

## Recent Changes

- 002-language-switcher: Added TypeScript 5.9.3 (strict mode via `astro/tsconfigs/strict`) + Astro 6.0.4 (static output), Tailwind CSS 4.2.1 (via `@tailwindcss/vite`), `src/i18n/utils.ts` (`t()`, `Locale` type), `src/lib/base-path.ts` (`getBasePath()`)

- 001-multi-locale-routes: Added TypeScript 5.9.3 (strict mode via `astro/tsconfigs/strict`) + Astro 6.0.4 (static output), Preact 10.29.0, nanostores 1.1.1, Tailwind CSS 4.2.1 (via `@tailwindcss/vite`)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
