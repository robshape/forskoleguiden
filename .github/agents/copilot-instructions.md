# forskoleguiden Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-31

## Active Technologies
- TypeScript (strict mode, `astro/tsconfigs/strict`) + Astro (static output), Preact (islands), nanostores + @nanostores/preact, Tailwind CSS v4 (@tailwindcss/vite), lz-string (already installed for share encoding) (006-share-ui)
- sessionStorage (client-side compare state persistence), no server-side storage (006-share-ui)
- TypeScript (strict), Astro static site + Vitest (unit + post-build tests), existing `tests/unit/helpers/i18n.ts` shared helpers (007-translation-quality-verification)
- Static JSON locale files on disk (`src/i18n/sv.json`, `en.json`, `ar.json`) (007-translation-quality-verification)
- TypeScript (strict mode via `astro/tsconfigs/strict`) + Astro 6.0.4, Preact 10.29.0, @playwright/test 1.58.2, @axe-core/playwright 4.11.1 (008-accessibility-audit-phase2)
- N/A (static site, sessionStorage for client state) (008-accessibility-audit-phase2)
- TypeScript (strict), Node.js 22.14.0 + Vitest (post-build tests), Playwright (e2e), Lighthouse CI (`@lhci/cli`), GitHub Actions (009-ci-pipeline-updates)
- N/A (static site — config files and test files only) (009-ci-pipeline-updates)
- TypeScript (strict), Astro 5.x + Vitest (unit/post-build), Playwright + @axe-core/playwright (e2e), lz-string (share encoding in test helpers) (010-final-verification)
- N/A (static site, no runtime storage) (010-final-verification)
- TypeScript (strict), Astro 5.x + Astro, Preact, Tailwind CSS v4 (`@tailwindcss/vite`), nanostores (013-survey-pdf-link)
- Static JSON files in `data/malmo/2025/` (build-time only, `readFileSync`) (013-survey-pdf-link)

- `lz-string` (exact-pinned version) — `compressToEncodedURIComponent` / `decompressFromEncodedURIComponent`; browser-safe, no Node.js `fs` usage; imported only from `src/lib/share.ts` and Preact islands (005-share-state-encoding)
- TypeScript (strict), Astro 5.x + Astro (static rendering), Preact islands (none new for this feature), Tailwind CSS v4, nanostores (no changes) (004-preschool-queue-links)
- Static JSON files in `data/malmo/` — read via `readFileSync` at build time only (004-preschool-queue-links)

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
- 013-survey-pdf-link: Added TypeScript (strict), Astro 5.x + Astro, Preact, Tailwind CSS v4 (`@tailwindcss/vite`), nanostores
- 012-mobile-target-update: Added TypeScript (strict mode, `astro/tsconfigs/strict`) + Astro (static output), Preact (islands), nanostores + @nanostores/preact, Tailwind CSS v4 (@tailwindcss/vite)
- 010-final-verification: Added TypeScript (strict), Astro 5.x + Vitest (unit/post-build), Playwright + @axe-core/playwright (e2e), lz-string (share encoding in test helpers)





<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
