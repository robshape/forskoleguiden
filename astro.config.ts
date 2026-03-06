import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'
import tailwindcss from '@tailwindcss/vite'

const base = '/forskoleguiden'

export default defineConfig({
  site: 'https://robshape.github.io/forskoleguiden',
  base,
  output: 'static',
  redirects: {
    '/': `${base}/sv/`,
  },
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
})
