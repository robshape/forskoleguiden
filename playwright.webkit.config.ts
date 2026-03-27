import { defineConfig, devices } from '@playwright/test'

// Narrowly-scoped WebKit config: only runs comparison-page-mobile-webkit.spec.ts
// using an iPhone 15 device profile (393×852, webkit engine) as proxy for iPhone 17.
// Run with: pnpm test:e2e:webkit
// If WebKit is not installed run: pnpm dlx playwright install webkit
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/comparison-page-mobile-webkit.spec.ts',
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
  },
  projects: [
    {
      name: 'webkit-iphone15',
      use: { ...devices['iPhone 15'] },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm preview',
    url: 'http://localhost:4321/forskoleguiden/',
    reuseExistingServer: !process.env.CI,
  },
})
