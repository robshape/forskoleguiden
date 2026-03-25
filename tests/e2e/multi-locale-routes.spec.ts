import { expect, test } from './fixtures'

const BASE = '/forskoleguiden'

// This preschool is used across e2e tests (see also helpers.ts DETAIL_URL).
// It is a stable, non-placeholder entry in data/malmo/2025/.
const STABLE_PRESCHOOL_ID = 'almgardens-forskola'

const verifyLocale = async (
  page: import('@playwright/test').Page,
  path: string,
  lang: string,
  rtl: boolean,
) => {
  const response = await page.goto(`${BASE}${path}`)
  expect(response?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', lang)
  if (rtl) {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  } else {
    await expect(page.locator('html')).not.toHaveAttribute('dir', 'rtl')
  }
  await expect(
    page.locator('main').getByRole('heading', { level: 1 }).first(),
  ).toBeVisible()
}

test('serves all English locale pages with lang="en" and correct routes', async ({
  page,
}) => {
  await verifyLocale(page, '/en/', 'en', false)
  await verifyLocale(page, '/en/jamfor/', 'en', false)
  await verifyLocale(page, `/en/forskola/${STABLE_PRESCHOOL_ID}/`, 'en', false)

  // Directory card links stay within /en/ locale
  await page.goto(`${BASE}/en/`)
  const firstHref = await page
    .getByTestId('preschool-card')
    .getByRole('link')
    .first()
    .getAttribute('href')
  expect(firstHref).toContain('/en/forskola/')

  // Breadcrumb on detail page points back to /en/ directory
  await page.goto(`${BASE}/en/forskola/${STABLE_PRESCHOOL_ID}/`)
  const breadcrumbHref = await page
    .locator('[data-breadcrumb] a')
    .getAttribute('href')
  expect(breadcrumbHref).toContain('/en/')
  expect(breadcrumbHref).not.toContain('/sv/')
})

test('serves all Arabic locale pages with lang="ar" and dir="rtl"', async ({
  page,
}) => {
  await verifyLocale(page, '/ar/', 'ar', true)
  await verifyLocale(page, '/ar/jamfor/', 'ar', true)
  await verifyLocale(page, `/ar/forskola/${STABLE_PRESCHOOL_ID}/`, 'ar', true)

  // Directory card links stay within /ar/ locale
  await page.goto(`${BASE}/ar/`)
  const firstHref = await page
    .getByTestId('preschool-card')
    .getByRole('link')
    .first()
    .getAttribute('href')
  expect(firstHref).toContain('/ar/forskola/')

  // Breadcrumb on detail page points back to /ar/ directory
  await page.goto(`${BASE}/ar/forskola/${STABLE_PRESCHOOL_ID}/`)
  const breadcrumbHref = await page
    .locator('[data-breadcrumb] a')
    .getAttribute('href')
  expect(breadcrumbHref).toContain('/ar/')
  expect(breadcrumbHref).not.toContain('/sv/')
})

test('root URL redirects to Swedish locale', async ({ page }) => {
  await page.goto(`${BASE}/`)
  await expect(page).toHaveURL(/\/sv\/$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv')
})
