import { expect, test } from '@playwright/test'
import { MALMO_SOURCE_URL } from '../../src/lib/constants'

test('layout and navigation shell render required semantics on /sv/', async ({
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

  const nav = page.getByRole('navigation', { name: 'Huvudnavigering' })
  await expect(nav).toBeVisible()
  await expect(
    nav.getByRole('link', { name: 'Förskoleguiden' }),
  ).toHaveAttribute('href', '/sv/')

  const cityList = nav.getByRole('list')
  await expect(cityList).toBeVisible()
  await expect(cityList.getByRole('listitem')).toHaveCount(3)

  await expect(nav.getByText('Malmö')).toBeVisible()
  await expect(
    cityList.getByRole('button', { name: 'Stockholm' }),
  ).toBeDisabled()
  await expect(
    cityList.getByRole('button', { name: 'Göteborg' }),
  ).toBeDisabled()
  await expect(nav.getByText('2025')).toBeVisible()
  await expect(
    nav.getByText('Språk: SV | EN | AR (kommer snart)'),
  ).toBeVisible()

  const footer = page.locator('footer')
  await expect(footer).toContainText('Enkätdata kommer från Malmö stad.')

  const sourceLink = footer.getByRole('link', {
    name: 'Källa hos Malmö stad',
  })
  await expect(sourceLink).toHaveAttribute('href', MALMO_SOURCE_URL)
  await expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(sourceLink).toHaveAttribute('referrerpolicy', 'no-referrer')
})
