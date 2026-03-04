import { expect, test } from '@playwright/test'

test.describe('Swedish directory Step 4.3 contracts', () => {
  test('renders directory cards in default score-desc ranking order', async ({
    page,
  }) => {
    const response = await page.goto('/forskoleguiden/sv/')
    if (response === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/")',
      )
    }

    expect(response.status(), 'Expected HTTP 200 from /sv/').toBe(200)

    const renderedNames = await page
      .locator('[data-testid="preschool-card"] h3 a')
      .allTextContents()

    // Score-desc order from current Malmö 2025 data: 98.5 > 94.5 > 94.0 > 91.0 > 88.5
    expect(renderedNames.map((name) => name.trim())).toEqual([
      'Bellevuegårdens montessoriförskola',
      'Bladins internationella förskola',
      'Almgårdens förskola',
      'Bulltofta förskola',
      'Augustenborgs förskola',
    ])
  })

  test('renders a visible heading row with total preschool count', async ({
    page,
  }) => {
    await page.goto('/forskoleguiden/sv/')

    await expect(page.getByRole('heading', { level: 2 })).toHaveText(
      /Förskolor i Malmö \(\d+\)/,
    )
  })

  test('renders visible ranking-method explanation copy', async ({ page }) => {
    await page.goto('/forskoleguiden/sv/')

    await expect(
      page.getByText(
        'Rangordnat efter andel instämmande svar i Helhetsbedömningen',
      ),
    ).toBeVisible()

    await expect(
      page.locator('section[aria-label="Förskolelista"] > ul'),
    ).toHaveClass(/mt-4/)
  })

  test('renders rank index text 1..N for each card row', async ({ page }) => {
    await page.goto('/forskoleguiden/sv/')

    const listRows = page.locator(
      'section[aria-label="Förskolelista"] > ul > li',
    )
    const rowCount = await listRows.count()

    expect(rowCount).toBeGreaterThan(0)

    for (let index = 0; index < rowCount; index += 1) {
      await expect(listRows.nth(index).locator('> span')).toHaveText(
        String(index + 1),
      )
    }
  })
})
