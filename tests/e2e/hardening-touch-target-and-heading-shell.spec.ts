import { expect, test } from './fixtures'

const DIRECTORY_URL = '/forskoleguiden/sv/'
const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'

const expectMinTouchTarget = async (
  width: number | undefined,
  height: number | undefined,
  label: string,
) => {
  expect(width, `${label} width`).toBeDefined()
  expect(height, `${label} height`).toBeDefined()
  expect(width ?? 0, `${label} width`).toBeGreaterThanOrEqual(44)
  expect(height ?? 0, `${label} height`).toBeGreaterThanOrEqual(44)
}

test.describe('hardening: heading shell and mobile touch targets', () => {
  test('directory and comparison routes expose server-rendered h1 headings in main content', async ({
    page,
  }) => {
    const directoryResponse = await page.request.get(DIRECTORY_URL)
    expect(directoryResponse.ok()).toBe(true)

    const directoryHtml = await directoryResponse.text()
    expect(directoryHtml).toMatch(/<main[^>]*>[\s\S]*<h1[^>]*>/i)

    const comparisonResponse = await page.request.get(COMPARISON_URL)
    expect(comparisonResponse.ok()).toBe(true)

    const comparisonHtml = await comparisonResponse.text()
    expect(comparisonHtml).toMatch(/<main[^>]*>[\s\S]*<h1[^>]*>/i)
  })

  test('primary interactive controls meet 44x44 touch-target minimum on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    const response = await page.goto(DIRECTORY_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    const alphabeticalSortButton = page.getByRole('button', { name: 'A–Ö' })
    const rankingSortButton = page.getByRole('button', { name: 'Betyg' })

    await expect(alphabeticalSortButton).toBeVisible()
    await expect(rankingSortButton).toBeVisible()

    const alphabeticalSortBox = await alphabeticalSortButton.boundingBox()
    const rankingSortBox = await rankingSortButton.boundingBox()

    await expectMinTouchTarget(
      alphabeticalSortBox?.width,
      alphabeticalSortBox?.height,
      'Alphabetical sort button',
    )
    await expectMinTouchTarget(
      rankingSortBox?.width,
      rankingSortBox?.height,
      'Ranking sort button',
    )

    const firstCardCompareButton = page
      .getByTestId('preschool-card')
      .first()
      .getByRole('button', { name: /Jämför|Tillagd/ })

    await expect(firstCardCompareButton).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    const compareButtonBox = await firstCardCompareButton.boundingBox()
    await expectMinTouchTarget(
      compareButtonBox?.width,
      compareButtonBox?.height,
      'Directory compare button',
    )

    await firstCardCompareButton.click()

    const tray = page.getByTestId('compare-tray')
    await expect(tray).toBeVisible()

    const trayCompareButton = tray.getByRole('link', {
      name: 'Visa jämförelse',
    })
    const trayClearButton = tray.getByRole('button', { name: 'Rensa' })

    const trayCompareBox = await trayCompareButton.boundingBox()
    const trayClearBox = await trayClearButton.boundingBox()

    await expectMinTouchTarget(
      trayCompareBox?.width,
      trayCompareBox?.height,
      'Compare tray CTA button',
    )
    await expectMinTouchTarget(
      trayClearBox?.width,
      trayClearBox?.height,
      'Compare tray clear button',
    )
  })
})
