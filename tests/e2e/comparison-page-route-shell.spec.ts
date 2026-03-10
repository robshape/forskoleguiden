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
    await expect(
      page.getByRole('heading', { name: 'Inga förskolor valda' }),
    ).toBeVisible()

    // i18n key: compare.emptyStateBody => "Välj förskolor i listan för att se en jämförelse."
    await expect(
      page.locator('p', {
        hasText: 'Välj förskolor i listan för att se en jämförelse.',
      }),
    ).toBeVisible()

    // Back link must still be present in the empty state
    // i18n key: compare.actions.backToDirectory => "Tillbaka till förskolor"
    const backLink = page.getByRole('link', { name: 'Tillbaka till förskolor' })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute('href', DIRECTORY_URL)
  })
})

// ---------------------------------------------------------------------------
// Tests — Step 7.2 contracts (failing until Phase 2 & 3 are implemented)
// ---------------------------------------------------------------------------

test.describe('comparison page selection state contracts', () => {
  test('stale compare IDs fall back to the existing empty state', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    await page.evaluate(() => {
      sessionStorage.setItem(
        'compareIds',
        JSON.stringify(['removed-preschool-id']),
      )
    })

    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    await expect(
      page.getByRole('heading', { name: 'Inga förskolor valda' }),
    ).toBeVisible()
    await expect(
      page.locator('p', {
        hasText: 'Välj förskolor i listan för att se en jämförelse.',
      }),
    ).toBeVisible()
    await expect(page.getByTestId('comparison-table')).not.toBeAttached()
  })

  test('one-preschool state shows a single-selection prompt and that preschool results', async ({
    page,
  }) => {
    // Seed sessionStorage with exactly one preschool
    await page.goto(DIRECTORY_URL)
    await page.evaluate(() => {
      sessionStorage.setItem(
        'compareIds',
        JSON.stringify(['almgardens-forskola']),
      )
    })

    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }
    expect(response.status()).toBe(200)

    // The island must show a prompt to add more preschools
    await expect(page.getByTestId('single-selection-prompt')).toBeVisible()

    // The selected preschool's results must also be rendered
    const table = page.getByTestId('comparison-table')
    await expect(table).toBeVisible()
    await expect(table).toHaveAttribute('aria-label', 'Jämför förskolor')
    await expect(
      table.getByRole('columnheader', { name: 'Fråga' }),
    ).toBeVisible()
    await expect(
      table.getByRole('columnheader', { name: 'Almgårdens förskola' }),
    ).toBeVisible()
  })

  test('three-preschool state renders comparison table with preschool columns, question rows, and agree-share percentages', async ({
    page,
  }) => {
    // Seed sessionStorage with three known preschools
    await page.goto(DIRECTORY_URL)
    await page.evaluate(() => {
      sessionStorage.setItem(
        'compareIds',
        JSON.stringify([
          'almgardens-forskola',
          'augustenborgs-forskola',
          'bellevuegardens-montessoriforskola',
        ]),
      )
    })

    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }
    expect(response.status()).toBe(200)

    // Comparison table must be present (not yet in markup — will fail)
    const table = page.getByTestId('comparison-table')
    await expect(table).toBeVisible()
    await expect(table).toHaveAttribute('aria-label', 'Jämför förskolor')
    await expect(
      table.getByRole('columnheader', { name: 'Fråga' }),
    ).toBeVisible()

    // Three preschool column headers
    await expect(
      table.getByRole('columnheader', { name: 'Almgårdens förskola' }),
    ).toBeVisible()
    await expect(
      table.getByRole('columnheader', { name: 'Augustenborgs förskola' }),
    ).toBeVisible()
    await expect(
      table.getByRole('columnheader', {
        name: 'Bellevuegårdens montessoriförskola',
      }),
    ).toBeVisible()

    // Two Helhetsbedömning question rows (as row headers in the table)
    await expect(
      table.getByRole('rowheader', {
        name: 'Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola',
      }),
    ).toBeVisible()
    await expect(
      table.getByRole('rowheader', {
        name: 'Jag skulle rekommendera mitt barns förskola till en annan förälder',
      }),
    ).toBeVisible()

    // Agree-share percentages from seed data:
    // Almgårdens: 95% (Q1: 67+28), 93% (Q2: 70+23)
    // Augustenborgs: 91% (Q1: 68+23), 86% (Q2: 72+14)
    // Bellevuegårdens: 97% (Q1: 86+11), 100% (Q2: 93+7)
    await expect(table.getByText('95%')).toBeVisible()
    await expect(table.getByText('93%')).toBeVisible()
    await expect(table.getByText('91%')).toBeVisible()
    await expect(table.getByText('86%')).toBeVisible()
    await expect(table.getByText('97%')).toBeVisible()
    await expect(table.getByText('100%')).toBeVisible()
  })
})
