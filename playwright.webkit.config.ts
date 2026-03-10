import { defineConfig, devices } from '@playwright/test'

// Narrowly-scoped WebKit config: only runs comparison-page-mobile-webkit.spec.ts
// using an iPhone 13 mini device profile (375×812, webkit engine).
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
      name: 'webkit-iphone13mini',
      use: { ...devices['iPhone 13 mini'] },
    },
  ],
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4321/forskoleguiden/',
    reuseExistingServer: !process.env.CI,
  },
})
