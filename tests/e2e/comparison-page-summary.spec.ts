import { expect, test } from './fixtures'
import { COMPARISON_URL, DIRECTORY_URL } from './helpers'

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
