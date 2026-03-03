import { expect, test } from '@playwright/test'

test('should load the Swedish homepage and redirect from root to /sv/', async ({
  page,
}) => {
  // Root path redirects to Swedish homepage
  const rootResponse = await page.goto('/forskoleguiden/')
  if (rootResponse === null) {
    throw new Error(
      'Expected non-null response from page.goto("/forskoleguiden/")',
    )
  }
  await expect(page).toHaveURL(/\/sv\/$/)
  expect(rootResponse.status()).toBe(200)
  await expect(page).not.toHaveTitle(/404/i)

  // Direct navigation to /sv/ also works
  const svResponse = await page.goto('/forskoleguiden/sv/')
  if (svResponse === null) {
    throw new Error(
      'Expected non-null response from page.goto("/forskoleguiden/sv/")',
    )
  }
  expect(svResponse.status()).toBe(200)
  await expect(page).not.toHaveTitle(/404/i)
})
