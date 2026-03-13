import { expect, test } from './fixtures'

// ---------------------------------------------------------------------------
// WebKit / iPhone 13 mini regression for mobile comparison refinement
//
// Run independently via: pnpm test:e2e:webkit
// Config: playwright.webkit.config.ts  (webkit-iphone13mini project, 375×812)
//
// These tests duplicate the core mobile comparison contract from
// comparison-page-route-shell.spec.ts but execute on the WebKit engine so that
// Safari-specific sticky-column behaviour is covered separately from the
// default Chromium suite.
// ---------------------------------------------------------------------------

const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'
const DIRECTORY_URL = '/forskoleguiden/sv/'

test.describe('mobile comparison — WebKit/iPhone 13 mini', () => {
  test('4-preschool comparison table renders and sticky question column stays pinned during horizontal scroll', async ({
    page,
  }) => {
    // Seed 4 known preschool IDs so the comparison table is wide enough to
    // overflow a 375 px viewport and require horizontal scrolling.
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

    // Comparison table must be visible
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

    // The scroll container must overflow horizontally on a 375 px viewport
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

    // Get the viewport position of the sticky row header BEFORE scrolling
    const firstRowHeader = page
      .locator('[data-testid="comparison-table"] tbody th[scope="row"]')
      .first()

    const preScrollBox = await firstRowHeader.boundingBox()
    expect(
      preScrollBox,
      'expected sticky row header to be visible and have a layout box before scroll',
    ).not.toBeNull()

    // Computed style must confirm sticky positioning in WebKit
    const isSticky = await firstRowHeader.evaluate(
      (el) => window.getComputedStyle(el).position === 'sticky',
    )
    expect(
      isSticky,
      'expected question-label column to have position:sticky in WebKit — if failing, check that the table does not use border-collapse:collapse (use border-separate + border-spacing-0 instead)',
    ).toBe(true)

    // Scroll the comparison container 200 px to the right
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

    // The sticky column must NOT have moved in the viewport after scrolling.
    // A position shift ≥ 3 px means the cell is scrolling away with the table
    // rather than staying pinned — the classic WebKit sticky-in-table failure.
    const postScrollBox = await firstRowHeader.boundingBox()
    expect(
      postScrollBox,
      'expected sticky row header to remain visible after horizontal scroll',
    ).not.toBeNull()
    expect(
      Math.abs(postScrollBox!.x - preScrollBox!.x),
      'expected question column to remain pinned at the same viewport x position after 200 px horizontal scroll in WebKit',
    ).toBeLessThan(3)
  })
})
