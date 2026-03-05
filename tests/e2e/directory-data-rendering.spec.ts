import { expect, test } from '@playwright/test'

test.describe('Swedish directory data rendering contracts', () => {
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
      await expect(listRows.nth(index).getByTestId('rank-index')).toHaveText(
        String(index + 1),
      )
    }
  })

  test('switches to alphabetical order when A–Ö is selected and restores ranking order when Rankning is selected', async ({
    page,
  }) => {
    await page.goto('/forskoleguiden/sv/')

    const listRows = page.locator(
      'section[aria-label="Förskolelista"] > ul > li',
    )
    const firstPreschoolLink = page
      .locator('section[aria-label="Förskolelista"] > ul > li')
      .first()
      .getByRole('link')
      .first()
    const bellevueRow = listRows.filter({
      has: page.getByRole('link', {
        name: 'Bellevuegårdens montessoriförskola',
      }),
    })

    await expect(firstPreschoolLink).toHaveText(
      'Bellevuegårdens montessoriförskola',
    )
    await expect(bellevueRow.getByTestId('rank-index')).toHaveText('1')

    await page.getByRole('button', { name: 'A–Ö' }).click()
    await expect(firstPreschoolLink).toHaveText('Almgårdens förskola')
    await expect(bellevueRow.getByTestId('rank-index')).toHaveText('3')
    await expect(page.getByTestId('sort-live-region')).toContainText('A–Ö')

    await page.getByRole('button', { name: 'Rankning' }).click()
    await expect(firstPreschoolLink).toHaveText(
      'Bellevuegårdens montessoriförskola',
    )
    await expect(bellevueRow.getByTestId('rank-index')).toHaveText('1')
    await expect(page.getByTestId('sort-live-region')).toContainText('Rankning')
  })
})
