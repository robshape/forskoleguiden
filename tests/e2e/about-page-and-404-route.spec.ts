import { test as base } from '@playwright/test'

import { expect, test } from './fixtures'
import { ABOUT_URL } from './helpers'

test.describe('about page /sv/om/', () => {
  test('should return HTTP 200', async ({ page }) => {
    const response = await page.goto(ABOUT_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${ABOUT_URL}")`,
      )
    }
    expect(response.status()).toBe(200)
  })

  test('should render the heading with Swedish about text', async ({
    page,
  }) => {
    await page.goto(ABOUT_URL)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Datakälla',
    )
  })

  test('should render the body paragraph', async ({ page }) => {
    await page.goto(ABOUT_URL)

    await expect(
      page.getByText(
        'Förskoleguiden använder officiella enkätresultat från Malmö stad för att hjälpa föräldrar att jämföra förskolor.',
      ),
    ).toBeVisible()
  })
})

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
