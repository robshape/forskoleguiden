import { expect, type Locator, test } from './fixtures'
import { getDirectoryCard } from './helpers'

test.describe('Swedish directory data rendering contracts', () => {
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

  test('renders directory cards in default alphabetical order', async ({
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

    const trimmedNames = renderedNames.map((name) => name.trim())
    const sortedNames = [...trimmedNames].sort((a, b) =>
      a.localeCompare(b, 'sv'),
    )

    expect(trimmedNames.length).toBeGreaterThan(0)
    expect(trimmedNames).toEqual(sortedNames)
  })

  test('renders a visible heading row with total preschool count', async ({
    page,
  }) => {
    await page.goto('/forskoleguiden/sv/')

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /Förskolor i Malmö \(\d+\)/,
    )
  })

  test('renders rank index text 1..N for each card row when sorting by Resultat', async ({
    page,
  }) => {
    await page.goto('/forskoleguiden/sv/')
    await expect(page.getByTestId('sort-toggle')).toHaveAttribute(
      'data-hydrated',
      'true',
    )
    await page.getByRole('button', { name: 'Resultat' }).click()

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

  test('starts in alphabetical order, switches to ranking order when Resultat is selected, and back to alphabetical', async ({
    page,
  }) => {
    await page.goto('/forskoleguiden/sv/')
    await expect(page.getByTestId('sort-toggle')).toHaveAttribute(
      'data-hydrated',
      'true',
    )

    const cardNameLocator = page.locator('[data-testid="preschool-card"] h3 a')

    // Capture the server-rendered alphabetical order — no hardcoded names
    const alphabeticalNames = (await cardNameLocator.allTextContents()).map(
      (n) => n.trim(),
    )
    expect(alphabeticalNames.length).toBeGreaterThan(0)

    // Switch to Resultat
    await page.getByRole('button', { name: 'Resultat' }).click()
    await expect(page.getByTestId('sort-live-region')).toContainText('Resultat')

    // Order should differ from alphabetical (dataset scores are not in alpha order)
    await expect(async () => {
      const betygNames = (await cardNameLocator.allTextContents()).map((n) =>
        n.trim(),
      )
      expect(betygNames).not.toEqual(alphabeticalNames)
    }).toPass()

    // Switch back to A–Ö
    await page.getByRole('button', { name: 'A–Ö' }).click()
    await expect(page.getByTestId('sort-live-region')).toContainText('A–Ö')

    // Alphabetical order should be restored
    await expect(async () => {
      const restoredNames = (await cardNameLocator.allTextContents()).map((n) =>
        n.trim(),
      )
      expect(restoredNames).toEqual(alphabeticalNames)
    }).toPass()
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
