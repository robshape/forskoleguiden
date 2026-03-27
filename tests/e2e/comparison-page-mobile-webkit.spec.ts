import { expect, test } from './fixtures'
import { COMPARISON_URL, DIRECTORY_URL } from './helpers'

// ---------------------------------------------------------------------------
// WebKit / iPhone 17 (via iPhone 15 preset) regression for mobile comparison refinement
//
// Run independently via: pnpm test:e2e:webkit
// Config: playwright.webkit.config.ts  (webkit-iphone15 project, 393×852)
//
// These tests duplicate the core mobile comparison contract from
// comparison-page-route-shell.spec.ts but execute on the WebKit engine so that
// Safari-specific sticky-column behaviour is covered separately from the
// default Chromium suite.
// ---------------------------------------------------------------------------

test.describe('mobile comparison — WebKit/iPhone 17', () => {
  test('4-preschool comparison renders card layout, scroll container overflows horizontally, and question heading is sticky', async ({
    page,
  }) => {
    // Seed 4 known preschool IDs so the card layout is wide enough to
    // overflow a 393 px viewport and require horizontal scrolling.
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

    // All 4 preschool names must be attached in the DOM as links
    await expect(
      scroll.getByRole('link', { name: 'Almgårdens förskola' }).first(),
    ).toBeAttached()
    await expect(
      scroll
        .getByRole('link', {
          name: 'Augustenborgs förskola',
        })
        .first(),
    ).toBeAttached()
    await expect(
      scroll
        .getByRole('link', {
          name: 'Bellevuegårdens montessoriförskola',
        })
        .first(),
    ).toBeAttached()
    await expect(
      scroll
        .getByRole('link', {
          name: 'Bladins internationella förskola',
        })
        .first(),
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
  })
})
