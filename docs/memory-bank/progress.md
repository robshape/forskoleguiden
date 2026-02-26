# Progress

Current status: Step 0.4 is completed. `astro.config.ts` now includes static output, Preact integration, Sitemap integration, Tailwind v4 Vite plugin, and i18n locale routing with prefixed default locale.

Review follow-up applied: a valid placeholder `site` URL is set for sitemap generation (`https://example.com`) and an explicit Step 3.4 TODO comment is added for `redirects: { '/': '/sv/' }` once `src/pages/index.astro` is replaced.

Validation complete: `pnpm build` succeeds and `@astrojs/sitemap` generates `sitemap-index.xml`.

Next step is Step 0.5 (Tailwind CSS v4 setup in `src/styles/global.css`).
