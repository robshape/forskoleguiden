import { expect, test } from './fixtures'
import { COMPARISON_URL, DIRECTORY_URL } from './helpers'

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
    await expect(
      page.getByRole('heading', { name: 'Inga förskolor valda' }),
    ).toBeVisible()

    // i18n key: compare.emptyStateBody => "Välj förskolor i listan för att se en jämförelse."
    await expect(
      page.locator('p', {
        hasText: 'Välj förskolor i listan för att se en jämförelse.',
      }),
    ).toBeVisible()

    // i18n key: compare.actions.backToDirectory => "Tillbaka till förskolor"
    const backLink = page.getByRole('link', { name: 'Tillbaka till förskolor' })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', DIRECTORY_URL)
  })

  test('clearing selections via compare tray Rensa on /sv/jamfor/ navigates back to the directory', async ({
    page,
  }) => {
    // Seed sessionStorage with preschool selections so ComparisonView mounts
    // with an existing compare set.
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

    // Clearing on the comparison page navigates back to the directory
    await expect(page).toHaveURL(DIRECTORY_URL)
  })
})

// ---------------------------------------------------------------------------
// Tests — no-JS static fallback
// ---------------------------------------------------------------------------

test.describe('no-JS static fallback', () => {
  test('comparison page includes a static <noscript> element with a message directing users to individual preschool pages when JavaScript is unavailable', async ({
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

    // The static HTML must include a <noscript> element — present in the raw
    // server response regardless of whether JavaScript is enabled in the browser.
    // We read response.text() (the raw HTTP body) rather than page.content()
    // (which is the live DOM after JS runs and may strip <noscript> content).
    // i18n key: compare.noscriptMessage
    const pageSource = await response.text()
    expect(
      pageSource,
      'expected a <noscript> element to be present in the comparison page HTML',
    ).toContain('<noscript>')

    // The noscript message must mention JavaScript (the word appears literally in
    // all three locale strings) and must include some directional copy.
    // We check against the Swedish locale since this is the /sv/jamfor/ route.
    expect(
      pageSource,
      'expected the <noscript> content to contain "JavaScript"',
    ).toContain('JavaScript')

    expect(
      pageSource,
      'expected the <noscript> content to mention preschool pages (Swedish: "förskola")',
    ).toContain('förskola')
  })
})
