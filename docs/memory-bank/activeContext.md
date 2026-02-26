# Active Context

Step 0.4 is complete: `astro.config.ts` now uses `output: 'static'`, Preact + Sitemap integrations, Tailwind v4 via `@tailwindcss/vite`, and Astro i18n locales (`sv`, `en`, `ar`) with `defaultLocale: 'sv'` and `routing.prefixDefaultLocale: true`.

Verification for Step 0.4 succeeded in dev mode: requesting `/sv/` returns `404`, confirming locale-prefix routing is active before localized pages are created.

Verified open concern: `src/pages/index.astro` still exists as the scaffold placeholder and currently renders with `lang="en"`. This is intentional temporary state and must be replaced in Step 3.4 when adding root redirect behavior (`/` → `/sv/`).

Current focus shifts to Step 0.5 (Tailwind CSS v4 global stylesheet wiring).
