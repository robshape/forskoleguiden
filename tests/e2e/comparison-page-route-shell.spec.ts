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
// Tests — Step 8.1 SVG chart structure contracts
// ---------------------------------------------------------------------------

test.describe('Step 8.1 accessible SVG chart on comparison page', () => {
  test('two-preschool comparison renders one accessible SVG chart per Helhetsbedömning question, with pattern defs, pattern-filled rects, and percentage title elements', async ({
    page,
  }) => {
    // Seed sessionStorage with two known preschools so the comparison view renders
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

    // The comparison table must be present so we know the comparison view is active
    await expect(page.getByTestId('comparison-table')).toBeVisible()

    // There should be one SVG chart per Helhetsbedömning question (2 questions for
    // these preschools). Each chart must declare role="img" for screen readers.
    const charts = page.locator('svg[role="img"]')
    await expect(charts).toHaveCount(2)

    // Each chart must carry an aria-label so assistive tech can announce its purpose.
    // The label is expected to be driven by the i18n key compare.chartAriaLabel.
    const firstChart = charts.nth(0)
    const secondChart = charts.nth(1)
    await expect(firstChart).toHaveAttribute('aria-label', /.+/)
    await expect(secondChart).toHaveAttribute('aria-label', /.+/)

    // Each chart must define at least one <pattern> inside a <defs> element.
    // Patterns encode segment fills accessibly (not color-only), satisfying WCAG.
    const firstChartPatterns = firstChart.locator('defs pattern')
    await expect(firstChartPatterns).not.toHaveCount(0)
    const secondChartPatterns = secondChart.locator('defs pattern')
    await expect(secondChartPatterns).not.toHaveCount(0)

    // Each chart must render <rect> segments whose fill references a pattern via the
    // url(#...) syntax — confirming segments use the accessible pattern fills.
    const firstChartPatternRects = firstChart.locator('rect[fill^="url(#"]')
    await expect(firstChartPatternRects).not.toHaveCount(0)
    const secondChartPatternRects = secondChart.locator('rect[fill^="url(#"]')
    await expect(secondChartPatternRects).not.toHaveCount(0)

    // Each chart must contain <title> elements that include the percentage values
    // for each preschool so screen readers can surface the numbers.
    // Almgårdens Q1 agree-share = 95%, Augustenborgs Q1 agree-share = 91%.
    // These titles must appear somewhere within the first chart.
    const firstChartTitles = firstChart.locator('title')
    const firstChartTitleTexts = await firstChartTitles.allTextContents()
    expect(
      firstChartTitleTexts.some((t) => t.includes('95%')),
      `expected a <title> with "95%" in the first chart, got: ${JSON.stringify(firstChartTitleTexts)}`,
    ).toBe(true)
    expect(
      firstChartTitleTexts.some((t) => t.includes('91%')),
      `expected a <title> with "91%" in the first chart, got: ${JSON.stringify(firstChartTitleTexts)}`,
    ).toBe(true)

    // Second chart (Q2): verify Almgårdens Q2 agree-share = 93% (70+23)
    // and Augustenborgs Q2 agree-share = 86% (72+14)
    const secondChartTitles = secondChart.locator('title')
    const secondChartTitleTexts = await secondChartTitles.allTextContents()
    expect(
      secondChartTitleTexts.some((t) => t.includes('93%')),
      `expected a <title> with "93%" in the second chart, got: ${JSON.stringify(secondChartTitleTexts)}`,
    ).toBe(true)
    expect(
      secondChartTitleTexts.some((t) => t.includes('86%')),
      `expected a <title> with "86%" in the second chart, got: ${JSON.stringify(secondChartTitleTexts)}`,
    ).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Tests — Step 8.1 review: visible question heading + chart data table
// ---------------------------------------------------------------------------

test.describe('Step 8.1 review: chart question heading and data table text alternative', () => {
  test('each chart section has a visible question heading and a visible data table with preschool columns and response category rows', async ({
    page,
  }) => {
    // Seed sessionStorage with two known preschools so the comparison view renders
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

    // The comparison summary table must be visible so we know ComparisonView is active
    await expect(page.getByTestId('comparison-table')).toBeVisible()

    // Each chart section must have a visible h2 heading with the question text.
    // There are 2 Helhetsbedömning questions for these preschools.
    const q1Heading = page.getByRole('heading', {
      level: 2,
      name: 'Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola',
    })
    await expect(q1Heading).toBeVisible()

    const q2Heading = page.getByRole('heading', {
      level: 2,
      name: 'Jag skulle rekommendera mitt barns förskola till en annan förälder',
    })
    await expect(q2Heading).toBeVisible()

    // Each chart must have exactly one data table text alternative (2 charts → 2 tables).
    const chartDataTables = page.getByTestId('chart-data-table')
    await expect(chartDataTables).toHaveCount(2)

    // The first chart's data table must include preschool names as column headers.
    const firstTable = chartDataTables.nth(0)
    await expect(
      firstTable.getByRole('columnheader', { name: 'Almgårdens förskola' }),
    ).toBeVisible()
    await expect(
      firstTable.getByRole('columnheader', { name: 'Augustenborgs förskola' }),
    ).toBeVisible()

    // The first chart's data table must include all five response category row headers.
    // i18n keys: responses.completelyAgree, .partlyAgree, .neitherAgreeNorDisagree,
    //             .partlyDisagree, .completelyDisagree
    await expect(
      firstTable.getByRole('rowheader', { name: 'Instämmer helt' }),
    ).toBeVisible()
    await expect(
      firstTable.getByRole('rowheader', { name: 'Instämmer delvis' }),
    ).toBeVisible()
    await expect(
      firstTable.getByRole('rowheader', { name: 'Varken eller' }),
    ).toBeVisible()
    await expect(
      firstTable.getByRole('rowheader', { name: 'Instämmer inte delvis' }),
    ).toBeVisible()
    await expect(
      firstTable.getByRole('rowheader', { name: 'Instämmer inte alls' }),
    ).toBeVisible()

    // The data cells must contain numeric percentage values from the actual survey data.
    // Almgårdens Q1 completelyAgreePercent = 67, Augustenborgs Q1 = 68.
    await expect(firstTable.getByRole('cell', { name: '67%' })).toBeVisible()
    await expect(firstTable.getByRole('cell', { name: '68%' })).toBeVisible()
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

// ---------------------------------------------------------------------------
// Tests — Step 8.1 follow-up: accessible table names and visible row labels
// ---------------------------------------------------------------------------

test.describe('Step 8.1 follow-up: accessible table names and visible row labels', () => {
  test('each chart data table has an accessible name tied to the question, and each chart SVG shows visible preschool name labels for every bar row', async ({
    page,
  }) => {
    // Seed two known preschools so the comparison view renders with charts
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

    await expect(page.getByTestId('comparison-table')).toBeVisible()

    // ── 1. Accessible name on each chart data table ────────────────────────
    // Every chart-data-table must carry an aria-label tied to the question text
    // so assistive technologies can announce which question the table belongs to.
    const chartDataTables = page.getByTestId('chart-data-table')
    await expect(chartDataTables).toHaveCount(2)

    await expect(chartDataTables.nth(0)).toHaveAttribute(
      'aria-label',
      'Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola',
    )
    await expect(chartDataTables.nth(1)).toHaveAttribute(
      'aria-label',
      'Jag skulle rekommendera mitt barns förskola till en annan förälder',
    )

    // ── 2. Visible preschool label for every bar row in each SVG chart ─────
    // Each chart SVG must render visible <text> elements so sighted users can
    // tell which bar belongs to which preschool without relying on colour alone.
    const charts = page.locator('svg[role="img"]')

    const firstChart = charts.nth(0)
    await expect(
      firstChart
        .locator('text')
        .filter({ hasText: 'Almgårdens förskola' })
        .first(),
    ).toBeVisible()
    await expect(
      firstChart
        .locator('text')
        .filter({ hasText: 'Augustenborgs förskola' })
        .first(),
    ).toBeVisible()

    const secondChart = charts.nth(1)
    await expect(
      secondChart
        .locator('text')
        .filter({ hasText: 'Almgårdens förskola' })
        .first(),
    ).toBeVisible()
    await expect(
      secondChart
        .locator('text')
        .filter({ hasText: 'Augustenborgs förskola' })
        .first(),
    ).toBeVisible()
  })
})
