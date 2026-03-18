import { expect, type Page, test } from './fixtures'

const DIRECTORY_URL = '/forskoleguiden/sv/'
const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'
const SEEDED_ID = 'almgardens-forskola'
const SEEDED_IDS_FOR_SCROLL_HINT = [
  'almgardens-forskola',
  'augustenborgs-forskola',
  'bellevuegardens-montessoriforskola',
]

const getComputedFontSize = async (selector: string, page: Page) => {
  return page.evaluate((targetSelector) => {
    const element = document.querySelector(targetSelector)
    if (!(element instanceof HTMLElement)) return null

    return Number.parseFloat(window.getComputedStyle(element).fontSize)
  }, selector)
}

test.describe('typography system normalization', () => {
  test('uses a distinctive sans font stack on body text', async ({ page }) => {
    const response = await page.goto(DIRECTORY_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    const bodyFontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily
    })

    expect(bodyFontFamily).toContain('Noto Sans')
    expect(bodyFontFamily).not.toContain('Source Sans 3')
  })

  test('directory and comparison body copy uses at least 16px text', async ({
    page,
  }) => {
    const directoryResponse = await page.goto(DIRECTORY_URL)
    if (directoryResponse === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL}")`,
      )
    }

    expect(directoryResponse.status()).toBe(200)

    const directoryCardBodyFontSize = await getComputedFontSize(
      '[data-testid="preschool-card"] p',
      page,
    )

    expect(directoryCardBodyFontSize).not.toBeNull()
    expect(directoryCardBodyFontSize ?? 0).toBeGreaterThanOrEqual(16)

    const comparisonEmptyResponse = await page.goto(COMPARISON_URL)
    if (comparisonEmptyResponse === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }

    expect(comparisonEmptyResponse.status()).toBe(200)

    await page.evaluate(() => {
      sessionStorage.clear()
    })
    await page.goto(COMPARISON_URL)
    await expect(page.getByTestId('comparison-empty-body')).toBeVisible()

    const emptyStateBodyFontSize = await getComputedFontSize(
      '[data-testid="comparison-empty-body"]',
      page,
    )

    expect(emptyStateBodyFontSize).not.toBeNull()
    expect(emptyStateBodyFontSize ?? 0).toBeGreaterThanOrEqual(16)
  })

  test('single-selection guidance text keeps readable base size', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    await page.evaluate((id) => {
      sessionStorage.setItem('compareIds', JSON.stringify([id]))
    }, SEEDED_ID)

    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    await expect(page.getByTestId('single-selection-prompt')).toBeVisible()

    const singlePromptFontSize = await getComputedFontSize(
      '[data-testid="single-selection-prompt"]',
      page,
    )

    expect(singlePromptFontSize).not.toBeNull()
    expect(singlePromptFontSize ?? 0).toBeGreaterThanOrEqual(16)
  })

  test('mobile action and helper labels are never smaller than 14px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    const directoryResponse = await page.goto(DIRECTORY_URL)
    if (directoryResponse === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL}")`,
      )
    }

    expect(directoryResponse.status()).toBe(200)

    const firstCardCompareButton = page
      .getByTestId('preschool-card')
      .first()
      .getByRole('button', { name: /Jämför|Tillagd/ })

    await expect(firstCardCompareButton).toBeVisible()

    const firstCardCompareButtonFontSize =
      await firstCardCompareButton.evaluate((element) =>
        Number.parseFloat(window.getComputedStyle(element).fontSize),
      )

    expect(firstCardCompareButtonFontSize).not.toBeNull()
    expect(firstCardCompareButtonFontSize ?? 0).toBeGreaterThanOrEqual(14)

    await page.evaluate((ids) => {
      sessionStorage.setItem('compareIds', JSON.stringify(ids))
    }, SEEDED_IDS_FOR_SCROLL_HINT)

    const comparisonResponse = await page.goto(COMPARISON_URL)
    if (comparisonResponse === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }

    expect(comparisonResponse.status()).toBe(200)
    await expect(page.getByTestId('scroll-hint')).toBeVisible()

    const scrollHintFontSize = await getComputedFontSize(
      '[data-testid="scroll-hint"]',
      page,
    )

    expect(scrollHintFontSize).not.toBeNull()
    expect(scrollHintFontSize ?? 0).toBeGreaterThanOrEqual(14)
  })
})
