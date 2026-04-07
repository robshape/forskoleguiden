import { expect, test } from './fixtures'
import { COMPARISON_URL, DIRECTORY_URL } from './helpers'

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
    // The selected preschool name must appear as a link in the comparison
    await expect(
      scroll.getByRole('link', { name: 'Almgårdens förskola' }).first(),
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

    // Three preschool names as links within the comparison
    await expect(
      scroll.getByRole('link', { name: 'Almgårdens förskola' }).first(),
    ).toBeVisible()
    await expect(
      scroll
        .getByRole('link', {
          name: 'Augustenborgs förskola',
        })
        .first(),
    ).toBeVisible()
    await expect(
      scroll
        .getByRole('link', {
          name: 'Bellevuegårdens montessoriförskola',
        })
        .first(),
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

    // Response rate (totalRespondentsPercent) per card:
    // i18n key: detail.responseRate => "Svarsfrekvens"
    // Almgårdens: 64%, Augustenborgs: 81%, Bellevuegårdens: 88%
    await expect(scroll.getByText('Svarsfrekvens: 64%').first()).toBeVisible()
    await expect(scroll.getByText('Svarsfrekvens: 81%').first()).toBeVisible()
    await expect(scroll.getByText('Svarsfrekvens: 88%').first()).toBeVisible()
  })

  test('two-or-more-preschool state renders a share box with title and description (i18n: compare.share.title / compare.share.description)', async ({
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

    // Comparison view must be active
    await expect(page.getByTestId('comparison-scroll')).toBeVisible()

    const shareBox = page.getByTestId('share-box')
    await expect(shareBox).toBeVisible()

    // Share box title: i18n key compare.share.title => "Dela jämförelse"
    await expect(
      shareBox.locator('p').filter({ hasText: /^Dela jämförelse$/ }),
    ).toBeVisible()

    // Share box description: i18n key compare.share.description => "Kopiera en länk för att dela din jämförelse."
    await expect(
      shareBox.getByText('Kopiera en länk för att dela din jämförelse.', {
        exact: true,
      }),
    ).toBeVisible()

    // Share button must be present and enabled
    const shareButton = page.getByTestId('share-comparison-button')
    await expect(shareButton).toBeVisible()
    await expect(shareButton).toBeEnabled()
  })
})
