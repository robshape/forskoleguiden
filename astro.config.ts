import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://robshape.github.io/forskoleguiden',
  output: 'static',
  integrations: [preact(), sitemap()],
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
