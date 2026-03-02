import { expect, test } from '@playwright/test'

test('layout shell renders html lang and semantic landmarks on /sv/', async ({
  page,
}) => {
  const response = await page.goto('/sv/')

  if (response === null) {
    throw new Error('Expected non-null response from page.goto("/sv/")')
  }

  expect(response.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv')
  await expect(page.locator('header')).toHaveCount(1)
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.locator('footer')).toHaveCount(1)
})
