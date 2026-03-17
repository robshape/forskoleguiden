import { expect, test } from './fixtures'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'
const DIRECTORY_URL = '/forskoleguiden/sv/'

// ---------------------------------------------------------------------------
// Tests
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
// Tests — comparison page selection state contracts
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
    await expect(page.getByTestId('comparison-scroll')).not.toBeAttached()
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
    const scroll = page.getByTestId('comparison-scroll')
    await expect(scroll).toBeVisible()
    // The selected preschool name must appear as a heading
    await expect(
      page.getByRole('heading', { level: 2, name: 'Almgårdens förskola' }),
    ).toBeVisible()
  })

  test('three-preschool state renders comparison cards with preschool headings, question headings, and agree-share percentages', async ({
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

    // Comparison scroll container must be present
    const scroll = page.getByTestId('comparison-scroll')
    await expect(scroll).toBeVisible()

    // Three preschool name headings
    await expect(
      page.getByRole('heading', { level: 2, name: 'Almgårdens förskola' }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Augustenborgs förskola',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Bellevuegårdens montessoriförskola',
      }),
    ).toBeVisible()

    // Two Helhetsbedömning question headings
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: '"Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola"',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: '"Jag skulle rekommendera mitt barns förskola till en annan förälder"',
      }),
    ).toBeVisible()

    // Agree-share percentages from seed data:
    // Almgårdens: 95% (Q1: 67+28), 93% (Q2: 70+23)
    // Augustenborgs: 91% (Q1: 68+23), 86% (Q2: 72+14)
    // Bellevuegårdens: 97% (Q1: 86+11), 100% (Q2: 93+7)
    await expect(scroll.getByText('95%').first()).toBeVisible()
    await expect(scroll.getByText('93%').first()).toBeVisible()
    await expect(scroll.getByText('91%').first()).toBeVisible()
    await expect(scroll.getByText('86%').first()).toBeVisible()
    await expect(scroll.getByText('97%').first()).toBeVisible()
    await expect(scroll.getByText('100%').first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Tests — empty-state and single-selection UI flow (real interaction)
// ---------------------------------------------------------------------------

test.describe('comparison page empty-state and single-selection UI flow', () => {
  test('empty-state back-link navigates to directory; one preschool selected via real UI and opened via tray CTA shows single-selection prompt and results', async ({
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

    // Step 5: Assert single-selection prompt and the selected preschool's results
    await expect(page.getByTestId('single-selection-prompt')).toBeVisible()
    const scroll = page.getByTestId('comparison-scroll')
    await expect(scroll).toBeVisible()
    await expect(
      page.getByRole('heading', { level: 2, name: targetName }),
    ).toBeVisible()
  })

  test('clearing one-preschool selection via compare tray navigates back to the directory', async ({
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

    // Single-selection prompt and comparison scroll must be visible
    await expect(page.getByTestId('single-selection-prompt')).toBeVisible()
    await expect(page.getByTestId('comparison-scroll')).toBeVisible()

    // Compare tray must be visible
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
// Tests — mobile comparison refinement contracts
// ---------------------------------------------------------------------------

test.describe('mobile comparison refinement contracts', () => {
  test('mobile viewport (375×812): 4-preschool comparison is DOM-complete, scroll container overflows horizontally, and question heading container is sticky', async ({
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

    // Comparison scroll container must be visible
    const scroll = page.getByTestId('comparison-scroll')
    await expect(scroll).toBeVisible()

    // All 4 preschool name headings (h2) must be attached in the DOM
    await expect(
      page.getByRole('heading', { level: 2, name: 'Almgårdens förskola' }),
    ).toBeAttached()
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Augustenborgs förskola',
      }),
    ).toBeAttached()
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Bellevuegårdens montessoriförskola',
      }),
    ).toBeAttached()
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Bladins internationella förskola',
      }),
    ).toBeAttached()

    // Both Helhetsbedömning question headings (h3) must be attached
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: '"Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola"',
      }),
    ).toBeAttached()
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: '"Jag skulle rekommendera mitt barns förskola till en annan förälder"',
      }),
    ).toBeAttached()

    // The scroll container must actually overflow horizontally on a 375 px viewport
    // with 4 preschool columns. Each card has a fixed width so the content is wider
    // than the screen and reliably scrollable.
    const overflows = await page.evaluate(() => {
      const container = document.querySelector(
        '[data-testid="comparison-scroll"]',
      ) as HTMLElement | null
      if (!container) return null
      return container.scrollWidth > container.clientWidth
    })
    expect(
      overflows,
      'expected scroll container to overflow horizontally on 375 px viewport with 4 preschool columns',
    ).toBe(true)

    // Core UX requirement: the question heading container must be sticky so
    // question labels remain visible when the user scrolls horizontally.
    const firstQuestionHeading = page.getByRole('heading', {
      level: 3,
      name: '"Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola"',
    })
    const isSticky = await firstQuestionHeading.evaluate((el) => {
      const parent = el.closest('.sticky')
      return parent !== null
    })
    expect(isSticky, 'expected question heading container to be sticky').toBe(
      true,
    )
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

// ---------------------------------------------------------------------------
// Tests — deterministic comparison summary text
// ---------------------------------------------------------------------------

test.describe('deterministic comparison summary text', () => {
  // Almgårdens vs Augustenborgs (best-per-question format):
  //   Q1: Best=Almgårdens(95%), Augustenborgs(91%), delta=4 (<5) → TIED
  //   Q2: Best=Almgårdens(93%), Augustenborgs(86%), delta=7 (>=5) → CLEAR WINNER

  test('two-preschool comparison renders deterministic best-per-question summary sentences', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    await page.evaluate(() => {
      sessionStorage.setItem(
        'compareIds',
        JSON.stringify(['almgardens-forskola', 'augustenborgs-forskola']),
      )
    })

    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }
    expect(response.status()).toBe(200)

    // Comparison view must be active before asserting summary
    await expect(page.getByTestId('comparison-scroll')).toBeVisible()

    // The summary section must be present in the DOM
    const summary = page.getByTestId('comparison-summary')
    await expect(summary).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Sammanfattning' }),
    ).toBeVisible()
    await expect(
      summary.getByRole('heading', { name: 'Sammanfattning' }),
    ).toBeVisible()

    // Q1 — tied (delta 4, below 5pp threshold)
    await expect(
      summary.getByText(
        'Almgårdens förskola (95%) och Augustenborgs förskola (91%) fick liknande resultat för "Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola".',
        { exact: true },
      ),
    ).toBeVisible()

    // Q2 — clear winner (delta 7, above 5pp threshold)
    await expect(
      summary.getByText(
        'Almgårdens förskola (93%) fick högst resultat för "Jag skulle rekommendera mitt barns förskola till en annan förälder".',
        { exact: true },
      ),
    ).toBeVisible()
  })

  test('single-preschool state does not render a comparison summary section', async ({
    page,
  }) => {
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

    // Single-selection prompt must be visible (the normal single-preschool state)
    await expect(page.getByTestId('single-selection-prompt')).toBeVisible()

    // Summary must not be present when only one preschool is selected
    await expect(page.getByTestId('comparison-summary')).not.toBeAttached()
  })
})
