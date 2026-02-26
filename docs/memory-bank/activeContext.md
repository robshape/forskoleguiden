# Active Context

Step 0.1 is complete across all planned phases: Astro project scaffolding is in the repository root, acceptance validation is documented with strict TypeScript and `pnpm dev` startup checks, and memory-bank status is now aligned with that completion.

Current focus shifts to Step 0.2, which is to install core production dependencies (`@astrojs/preact`, `preact`, `@nanostores/preact`, `nanostores`, `lz-string`, `@astrojs/sitemap`) before continuing configuration steps.

Important temporary state: `src/pages/index.astro` is still the initial scaffold placeholder (including `lang="en"`) and is not the intended final root behavior. It must be replaced with the planned root redirect setup in Step 3.4 once i18n routing with prefixed default locale is configured.
