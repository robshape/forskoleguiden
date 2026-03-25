import { expect, test as base } from '@playwright/test'

// Uses base Playwright test (not the custom fixtures) because a 404 response
// triggers a browser console.error that the _autoPageErrors fixture would
// incorrectly treat as a test failure.
base.describe('non-existent route handling', () => {
  base('should not return HTTP 200 for an arbitrary path', async ({ page }) => {
    const response = await page.goto('/forskoleguiden/sv/nonexistent-page/')
    if (response === null) {
      throw new Error(
        'Expected non-null response from page.goto for non-existent route',
      )
    }
    expect(response.status()).not.toBe(200)
  })
})
