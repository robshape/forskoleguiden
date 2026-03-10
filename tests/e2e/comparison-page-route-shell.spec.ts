import { expect, test } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'
const DIRECTORY_URL = '/forskoleguiden/sv/'

// ---------------------------------------------------------------------------
// Tests — failing (route does not exist yet; will pass once Phase 2 is done)
// ---------------------------------------------------------------------------

test.describe('comparison page route shell', () => {
  test('comparison route is reachable at /sv/jamfor/ and returns HTTP 200', async ({
    page,
  }) => {
    const response = await page.goto(COMPARISON_URL)

    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }

    expect(response.status(), `Expected HTTP 200 from ${COMPARISON_URL}`).toBe(
      200,
    )
  })

  test('comparison page shows empty-state content when no preschools are selected, with a back link to the directory', async ({
    page,
  }) => {
    const response = await page.goto(COMPARISON_URL)

    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }

    expect(response.status(), `Expected HTTP 200 from ${COMPARISON_URL}`).toBe(
      200,
    )

    // i18n key: compare.emptyStateTitle => "Inga förskolor valda"
    await expect(page.getByText('Inga förskolor valda')).toBeVisible()

    // i18n key: compare.emptyStateBody => "Välj förskolor i listan för att se en jämförelse."
    await expect(
      page.getByText('Välj förskolor i listan för att se en jämförelse.'),
    ).toBeVisible()

    // i18n key: compare.actions.backToDirectory => "Tillbaka till förskolor"
    const backLink = page.getByRole('link', { name: 'Tillbaka till förskolor' })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', DIRECTORY_URL)
  })

  test('clearing selections via compare tray Rensa on /sv/jamfor/ stays on comparison page and shows empty state', async ({
    page,
  }) => {
    // Seed sessionStorage with preschool selections so ComparisonView mounts
    // with an existing compare set, matching the real clear-on-comparison-page
    // flow that previously redirected away from this route.
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

    // Navigate to the comparison page (selections are present via sessionStorage)
    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }
    expect(response.status(), `Expected HTTP 200 from ${COMPARISON_URL}`).toBe(
      200,
    )

    // Compare tray must be visible because selections were loaded from sessionStorage
    const tray = page.getByTestId('compare-tray')
    await expect(tray).toBeVisible()

    // i18n key: compareTray.clear => "Rensa"
    const clearButton = tray.getByRole('button', { name: 'Rensa' })
    await expect(clearButton).toBeVisible()
    await clearButton.click()

    await expect(page).toHaveURL(COMPARISON_URL)

    // The comparison page empty state must be visible after clearing
    // i18n key: compare.emptyStateTitle => "Inga förskolor valda"
    await expect(page.getByText('Inga förskolor valda')).toBeVisible()

    // i18n key: compare.emptyStateBody => "Välj förskolor i listan för att se en jämförelse."
    await expect(
      page.getByText('Välj förskolor i listan för att se en jämförelse.'),
    ).toBeVisible()

    // Back link must still be present in the empty state
    // i18n key: compare.actions.backToDirectory => "Tillbaka till förskolor"
    const backLink = page.getByRole('link', { name: 'Tillbaka till förskolor' })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', DIRECTORY_URL)
  })
})
