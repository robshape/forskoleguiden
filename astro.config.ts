import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://example.com',
  // TODO: Replace with the production URL before first public deployment.
  output: 'static',
  integrations: [preact(), sitemap()],
  // TODO: Step 3.4 — add redirects: { '/': '/sv/' } after replacing src/pages/index.astro.
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    locales: ['sv', 'en', 'ar'],
    defaultLocale: 'sv',
    routing: {
      prefixDefaultLocale: true,
    },
  },
})
