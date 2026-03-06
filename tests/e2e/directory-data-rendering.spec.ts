import { expect, test, type Locator, type Page } from '@playwright/test'

test.describe('Swedish directory data rendering contracts', () => {
  const getDirectoryCard = (page: Page, name: string) =>
    page.getByTestId('preschool-card').filter({
      has: page.getByRole('link', { name }),
    })

  const waitForCompareButtonToBeInteractive = async (button: Locator) => {
    await expect(button).toHaveAttribute('aria-pressed', 'false')

    await expect(async () => {
      // Reset any prior retry attempt so each probe starts from the same state.
      if ((await button.getAttribute('aria-pressed')) === 'true') {
        await button.click()
        await expect(button).toHaveAttribute('aria-pressed', 'false')
      }

      await button.click()
      await expect(button).toHaveAttribute('aria-pressed', 'true')
      await button.click()
      await expect(button).toHaveAttribute('aria-pressed', 'false')
    }).toPass()
  }

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

  test('selects two preschool compare buttons and deselects one while keeping pressed-state semantics in sync', async ({
    page,
  }) => {
    await page.goto('/forskoleguiden/sv/')

    const bellevueButton = getDirectoryCard(
      page,
      'Bellevuegårdens montessoriförskola',
    ).getByRole('button')
    const bladinsButton = getDirectoryCard(
      page,
      'Bladins internationella förskola',
    ).getByRole('button')

    await waitForCompareButtonToBeInteractive(bellevueButton)
    await waitForCompareButtonToBeInteractive(bladinsButton)

    await expect(bellevueButton).toHaveText('Jämför')
    await expect(bladinsButton).toHaveText('Jämför')

    await bellevueButton.click()
    await bladinsButton.click()

    await expect(bellevueButton).toHaveText(/Tillagd/)
    await expect(bellevueButton).toHaveAttribute('aria-pressed', 'true')
    await expect(bladinsButton).toHaveText(/Tillagd/)
    await expect(bladinsButton).toHaveAttribute('aria-pressed', 'true')

    await bellevueButton.click()

    await expect(bellevueButton).toHaveText('Jämför')
    await expect(bellevueButton).toHaveAttribute('aria-pressed', 'false')
    await expect(bladinsButton).toHaveText(/Tillagd/)
    await expect(bladinsButton).toHaveAttribute('aria-pressed', 'true')
  })
})
