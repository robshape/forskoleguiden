import { expect, test } from '@playwright/test'

test('smoke /sv/ page loads', async ({ page }) => {
  const response = await page.goto('/sv/')

  expect(response).not.toBeNull()
  if (response === null) {
    throw new Error('Expected non-null response from page.goto("/sv/")')
  }
  expect(response.status()).toBe(200)
  await expect(page).not.toHaveTitle(/404/i)
})
