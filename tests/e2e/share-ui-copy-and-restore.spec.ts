import { expect, test } from './fixtures'
import { COMPARISON_URL, DIRECTORY_URL, encodeSharePayload } from './helpers'

const PRESCHOOL_A = 'almgardens-forskola'
const PRESCHOOL_B = 'bellevuegardens-montessoriforskola'

// ---------------------------------------------------------------------------
// US1: Comparison page share button
// ---------------------------------------------------------------------------

test.describe('share UI on comparison page', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    // Seed sessionStorage with two preschools
    await page.goto(DIRECTORY_URL)
    await page.evaluate(
      ([a, b]) => {
        sessionStorage.setItem('compareIds', JSON.stringify([a, b]))
      },
      [PRESCHOOL_A, PRESCHOOL_B] as const,
    )
  })

  test('share button is visible and copies a URL with ?s= parameter to clipboard', async ({
    page,
  }) => {
    await page.goto(COMPARISON_URL)

    const shareButton = page.getByTestId('share-comparison-button')
    await expect(shareButton).toBeVisible()

    await shareButton.click()

    // Confirmation feedback appears
    const copied = page.getByTestId('share-feedback-copied')
    await expect(copied).toBeVisible()

    // Clipboard contains a valid share URL
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    )
    expect(clipboardText).toContain('/sv/jamfor/?s=')
    expect(clipboardText.length).toBeLessThan(2000)
  })

  test('confirmation auto-dismisses after a few seconds', async ({ page }) => {
    await page.goto(COMPARISON_URL)

    const shareButton = page.getByTestId('share-comparison-button')
    await shareButton.click()

    const copied = page.getByTestId('share-feedback-copied')
    await expect(copied).toBeVisible()

    // Wait for auto-dismiss (2500ms + buffer)
    await expect(copied).not.toBeVisible({ timeout: 5000 })
  })

  test('share button is not shown with only 1 preschool selected', async ({
    page,
  }) => {
    // Override to single selection
    await page.evaluate((id) => {
      sessionStorage.setItem('compareIds', JSON.stringify([id]))
    }, PRESCHOOL_A)

    await page.goto(COMPARISON_URL)

    const shareButton = page.getByTestId('share-comparison-button')
    await expect(shareButton).toHaveCount(0)
  })

  test('share button is keyboard accessible via Tab + Enter', async ({
    page,
  }) => {
    await page.goto(COMPARISON_URL)

    const shareButton = page.getByTestId('share-comparison-button')
    await shareButton.focus()
    await page.keyboard.press('Enter')

    const copied = page.getByTestId('share-feedback-copied')
    await expect(copied).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// US2: Share restoration from URL
// ---------------------------------------------------------------------------

test.describe('share restoration from ?s= URL', () => {
  test('valid share URL restores comparison with correct preschools', async ({
    page,
  }) => {
    const encoded = encodeSharePayload([PRESCHOOL_A, PRESCHOOL_B])
    await page.goto(`${COMPARISON_URL}?s=${encoded}`)

    // The comparison view should show both preschools
    const selectedCount = page.getByTestId('selected-count-label')
    await expect(selectedCount).toBeVisible()
    await expect(selectedCount).toContainText('2')

    // ?s= should be stripped from URL
    await expect(page).not.toHaveURL(/[?&]s=/)
  })

  test('share URL with stale IDs shows warning and valid preschools', async ({
    page,
  }) => {
    const encoded = encodeSharePayload([
      PRESCHOOL_A,
      'non-existent-preschool-xyz',
    ])
    await page.goto(`${COMPARISON_URL}?s=${encoded}`)

    // Warning feedback should appear
    const warning = page.getByTestId('share-feedback-warning')
    await expect(warning).toBeVisible()
    await expect(warning).toContainText('1')

    // Valid preschool should still be shown
    const selectedCount = page.getByTestId('selected-count-label')
    await expect(selectedCount).toBeVisible()
  })

  test('corrupted share URL shows error with directory link', async ({
    page,
  }) => {
    await page.goto(`${COMPARISON_URL}?s=corrupted-garbage-data`)

    const error = page.getByTestId('share-feedback-error')
    await expect(error).toBeVisible()

    // Should contain a link back to the directory
    const directoryLink = error.getByRole('link')
    await expect(directoryLink).toBeVisible()
  })

  test('share URL with all stale IDs shows error state', async ({ page }) => {
    const encoded = encodeSharePayload(['non-existent-a', 'non-existent-b'])
    await page.goto(`${COMPARISON_URL}?s=${encoded}`)

    const error = page.getByTestId('share-feedback-error')
    await expect(error).toBeVisible()
  })
})
