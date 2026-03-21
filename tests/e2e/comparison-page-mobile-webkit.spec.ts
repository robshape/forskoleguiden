import { expect, test } from './fixtures'
import { COMPARISON_URL, DIRECTORY_URL } from './helpers'

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

test.describe('mobile comparison — WebKit/iPhone 13 mini', () => {
  test('4-preschool comparison renders card layout, scroll container overflows horizontally, and question heading is sticky', async ({
    page,
  }) => {
    // Seed 4 known preschool IDs so the card layout is wide enough to
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

    // The scroll container must overflow horizontally on a 375 px viewport
    // with 4 preschool columns.
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

    // The question heading container must be sticky so question labels remain
    // visible when the user scrolls horizontally.
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
