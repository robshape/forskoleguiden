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

// ---------------------------------------------------------------------------
// Tests — Step 7.3 UI flow (real interaction, no sessionStorage seeding)
// ---------------------------------------------------------------------------

test.describe('comparison page empty-state and single-selection UI flow', () => {
  test('empty-state back-link navigates to directory; one preschool selected via real UI and opened via tray CTA shows single-selection prompt and results table', async ({
    page,
  }) => {
    // Step 1: Visit comparison page with no selections
    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }
    expect(response.status()).toBe(200)

    // Empty state: heading and explanatory body text
    await expect(
      page.getByRole('heading', { name: 'Inga förskolor valda' }),
    ).toBeVisible()
    await expect(
      page.locator('p', {
        hasText: 'Välj förskolor i listan för att se en jämförelse.',
      }),
    ).toBeVisible()

    // Step 2: Click the back link → verify navigation to the directory
    // i18n key: compare.actions.backToDirectory => "Tillbaka till förskolor"
    const backLink = page.getByRole('link', { name: 'Tillbaka till förskolor' })
    await expect(backLink).toBeVisible()
    await backLink.click()
    await expect(page).toHaveURL(DIRECTORY_URL)

    // Step 3: Select one preschool using the real compare button UI
    const targetName = 'Almgårdens förskola'
    const card = page
      .getByTestId('preschool-card')
      .filter({ has: page.getByRole('link', { name: targetName }) })
    // Use the button's accessible name (aria-label template: "{action}: {name}").
    // A regex anchored on the preschool name matches both the initial
    // "Jämför: Almgårdens förskola" and the selected "Tillagd: Almgårdens förskola"
    // labels, so the locator stays valid across the state transition.
    const compareButton = card.getByRole('button', {
      name: new RegExp(targetName),
    })
    await expect(compareButton).toHaveAttribute('aria-pressed', 'false')
    await compareButton.click()
    await expect(compareButton).toHaveAttribute('aria-pressed', 'true')

    // Step 4: Open the comparison page via the compare tray CTA
    const tray = page.getByTestId('compare-tray')
    await expect(tray).toBeVisible()
    // i18n key: compareTray.showComparison => "Visa jämförelse"
    const compareCTA = tray.getByRole('link', { name: 'Visa jämförelse' })
    await expect(compareCTA).toBeVisible()
    await compareCTA.click()
    await expect(page).toHaveURL(COMPARISON_URL)

    // Step 5: Assert single-selection prompt and the selected preschool's results table
    await expect(page.getByTestId('single-selection-prompt')).toBeVisible()
    const table = page.getByTestId('comparison-table')
    await expect(table).toBeVisible()
    await expect(table).toHaveAttribute('aria-label', 'Jämför förskolor')
    await expect(
      table.getByRole('columnheader', { name: 'Fråga' }),
    ).toBeVisible()
    await expect(
      table.getByRole('columnheader', { name: targetName }),
    ).toBeVisible()
  })

  test('clearing one-preschool selection via compare tray stays on comparison page and shows empty state', async ({
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

    // Navigate to the comparison page (one preschool loaded from sessionStorage)
    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }
    expect(response.status()).toBe(200)

    // Single-selection prompt and table must be visible
    await expect(page.getByTestId('single-selection-prompt')).toBeVisible()
    await expect(page.getByTestId('comparison-table')).toBeVisible()

    // Compare tray must be visible
    const tray = page.getByTestId('compare-tray')
    await expect(tray).toBeVisible()

    // i18n key: compareTray.clear => "Rensa"
    const clearButton = tray.getByRole('button', { name: 'Rensa' })
    await expect(clearButton).toBeVisible()
    await clearButton.click()

    // Page must stay on the comparison route after clearing
    await expect(page).toHaveURL(COMPARISON_URL)

    // Empty state must appear — heading, body text, and back link
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

    // Single-selection prompt and table must be gone
    await expect(page.getByTestId('single-selection-prompt')).not.toBeAttached()
    await expect(page.getByTestId('comparison-table')).not.toBeAttached()
  })
})

// ---------------------------------------------------------------------------
// Tests — Step 7.4 mobile comparison refinement contracts
// ---------------------------------------------------------------------------

test.describe('Step 7.4 mobile comparison refinement contracts', () => {
  test('mobile viewport (375×812): 4-preschool comparison table is DOM-complete and scroll container overflows horizontally', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    // Seed 4 known preschool IDs into sessionStorage
    await page.goto(DIRECTORY_URL)
    await page.evaluate(() => {
      sessionStorage.setItem(
        'compareIds',
        JSON.stringify([
          'almgardens-forskola',
          'augustenborgs-forskola',
          'bellevuegardens-montessoriforskola',
          'bladins-internationella-forskola',
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

    // Comparison table must exist in the DOM
    const table = page.getByTestId('comparison-table')
    await expect(table).toBeVisible()

    // All 4 preschool column headers must be reachable in the DOM
    await expect(
      table.getByRole('columnheader', { name: 'Almgårdens förskola' }),
    ).toBeAttached()
    await expect(
      table.getByRole('columnheader', { name: 'Augustenborgs förskola' }),
    ).toBeAttached()
    await expect(
      table.getByRole('columnheader', {
        name: 'Bellevuegårdens montessoriförskola',
      }),
    ).toBeAttached()
    await expect(
      table.getByRole('columnheader', {
        name: 'Bladins internationella förskola',
      }),
    ).toBeAttached()

    // Both Helhetsbedömning question row headers must be present
    await expect(
      table.getByRole('rowheader', {
        name: 'Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola',
      }),
    ).toBeAttached()
    await expect(
      table.getByRole('rowheader', {
        name: 'Jag skulle rekommendera mitt barns förskola till en annan förälder',
      }),
    ).toBeAttached()

    // The scroll container must actually overflow horizontally on a 375 px viewport
    // with 4 preschool columns. Step 7.4 requires each preschool column to have a
    // minimum width so the table is wider than the screen and reliably scrollable.
    const overflows = await page.evaluate(() => {
      const container = document.querySelector(
        '[data-testid="comparison-scroll"]',
      ) as HTMLElement | null
      if (!container) return null
      return container.scrollWidth > container.clientWidth
    })
    expect(
      overflows,
      'expected scroll container to overflow horizontally on 375 px viewport with 4 preschool columns — fix by adding min-width to preschool columns',
    ).toBe(true)

    // Step 7.4 core UX requirement: the question-label column must be sticky so
    // row labels remain visible when the user scrolls the table horizontally.
    // Checks both the CSS property and actual visual pinning after a real scroll.
    const firstRowHeader = page
      .locator('[data-testid="comparison-table"] tbody th[scope="row"]')
      .first()

    const preScrollBox = await firstRowHeader.boundingBox()
    expect(
      preScrollBox,
      'expected sticky row header to be visible and have a layout box before scroll',
    ).not.toBeNull()

    const isSticky = await firstRowHeader.evaluate(
      (el) => window.getComputedStyle(el).position === 'sticky',
    )
    expect(
      isSticky,
      'expected question-label column (tbody th[scope="row"]) to have position:sticky — fix by adding sticky left-0 classes',
    ).toBe(true)

    // Scroll the container 200 px to the right and prove the sticky column
    // does not move in the viewport (its x position stays constant).
    await page.evaluate(() => {
      const container = document.querySelector(
        '[data-testid="comparison-scroll"]',
      ) as HTMLElement | null
      if (container) container.scrollLeft = 200
    })
    await page.waitForFunction(() => {
      const container = document.querySelector(
        '[data-testid="comparison-scroll"]',
      ) as HTMLElement | null
      return container ? container.scrollLeft > 0 : false
    })

    const postScrollBox = await firstRowHeader.boundingBox()
    expect(
      postScrollBox,
      'expected sticky row header to remain visible after horizontal scroll',
    ).not.toBeNull()
    expect(
      Math.abs(postScrollBox!.x - preScrollBox!.x),
      'expected sticky question column to remain pinned at the same viewport x position after 200 px horizontal scroll',
    ).toBeLessThan(3)
  })
})
