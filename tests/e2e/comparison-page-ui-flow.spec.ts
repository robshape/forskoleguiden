import { expect, test } from './fixtures'
import { COMPARISON_URL, DIRECTORY_URL } from './helpers'

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
      page.getByRole('link', { name: targetName }).first(),
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
  test('mobile viewport (393×852): 4-preschool comparison is DOM-complete and vertically stacked', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 })

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

    // Comparison container must be visible
    const scroll = page.getByTestId('comparison-scroll')
    await expect(scroll).toBeVisible()

    // All 4 preschool names must be attached in the DOM as links
    await expect(
      scroll.getByRole('link', { name: 'Almgårdens förskola' }).first(),
    ).toBeAttached()
    await expect(
      scroll.getByRole('link', { name: 'Augustenborgs förskola' }).first(),
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
