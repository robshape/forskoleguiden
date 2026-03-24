import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

const base = process.env.BASE_PATH ?? '/forskoleguiden'

export default defineConfig({
  site: 'https://robshape.github.io/forskoleguiden',
  base,
  output: 'static',
  redirects: {
    '/': `${base}/sv/`,
  },
  integrations: [
    preact(),
    sitemap({
      i18n: {
        defaultLocale: 'sv',
        // Identity mapping (sv→sv, not sv→sv-SE). Generic language codes are
        // correct — the site differentiates by language, not region.
        locales: {
          ar: 'ar',
          en: 'en',
          sv: 'sv',
        },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
