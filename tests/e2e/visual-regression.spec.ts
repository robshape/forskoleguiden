import { expect, test } from './fixtures'
import { COMPARISON_URL, DETAIL_URL, DIRECTORY_URL } from './helpers'

// Visual regression snapshots for the three main page types (Swedish locale).
// First run creates baseline images in tests/e2e/visual-regression.spec.ts-snapshots/.
// Subsequent runs compare against baselines and fail on visual differences.

test('directory page visual snapshot', async ({ page }) => {
  await page.goto(DIRECTORY_URL)
  await page.waitForLoadState('networkidle')

  await expect(page).toHaveScreenshot('directory-page.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  })
})

test('detail page visual snapshot', async ({ page }) => {
  await page.goto(DETAIL_URL)
  await page.waitForLoadState('networkidle')

  await expect(page).toHaveScreenshot('detail-page.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  })
})

test('comparison page visual snapshot', async ({ page }) => {
  // Seed sessionStorage with two preschools so ComparisonView renders content
  await page.goto(DIRECTORY_URL)
  await page.evaluate(() => {
    sessionStorage.setItem(
      'compareIds',
      JSON.stringify([
        'almgardens-forskola',
        'bellevuegardens-montessoriforskola',
      ]),
    )
  })
  await page.goto(COMPARISON_URL)
  await page.waitForLoadState('networkidle')

  // Wait for ComparisonView (client:only="preact") to hydrate
  await expect(page.getByTestId('comparison-scroll')).toBeVisible()

  await expect(page).toHaveScreenshot('comparison-page.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
  })
})
