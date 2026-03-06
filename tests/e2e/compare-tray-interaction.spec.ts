import { expect, test, type Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const navigateToDirectory = async (page: Page) => {
  const response = await page.goto('/forskoleguiden/sv/')
  if (response === null) {
    throw new Error(
      'Expected non-null response from page.goto("/forskoleguiden/sv/")',
    )
  }
  expect(response.status(), 'Expected HTTP 200 from /sv/').toBe(200)
}

const getCompareTray = (page: Page) => page.getByTestId('compare-tray')

const getDirectoryCard = (page: Page, name: string) =>
  page.getByTestId('preschool-card').filter({
    has: page.getByRole('link', { name }),
  })

const getCompareButton = (page: Page, name: string) =>
  getDirectoryCard(page, name).getByRole('button')

const waitForCompareButtonReady = async (page: Page, name: string) => {
  const button = getCompareButton(page, name)
  await expect(button).toHaveAttribute('aria-pressed', 'false')
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('compare tray visibility and interaction behavior', () => {
  test('tray is not visible when no preschools are selected', async ({
    page,
  }) => {
    await navigateToDirectory(page)

    const tray = getCompareTray(page)

    // Before any selection, the tray must not be present in the DOM or
    // must not be visible. Either condition satisfies the hiding contract.
    const count = await tray.count()
    if (count > 0) {
      await expect(tray).not.toBeVisible()
    }
  })

  test('tray appears after selecting preschools and shows correct count and disabled compare CTA', async ({
    page,
  }) => {
    await navigateToDirectory(page)

    await waitForCompareButtonReady(page, 'Bellevuegårdens montessoriförskola')
    await waitForCompareButtonReady(page, 'Bladins internationella förskola')

    // Select two preschools
    await getCompareButton(page, 'Bellevuegårdens montessoriförskola').click()

    const tray = getCompareTray(page)

    // Tray should now be visible
    await expect(tray).toBeVisible()

    // Selected-count text for 1 selected preschool
    // i18n key: compareTray.selectedCount => "{count} förskolor valda"
    await expect(tray).toContainText('1')

    // Select a second preschool; count should update
    await getCompareButton(page, 'Bladins internationella förskola').click()
    await expect(tray).toContainText('2')

    // Compare CTA must be a disabled button while the compare-page route does not exist.
    // i18n key: compareTray.showComparison => "Visa jämförelse"
    const compareCTA = tray.getByRole('button', { name: 'Visa jämförelse' })
    await expect(compareCTA).toBeVisible()
    await expect(compareCTA).toHaveAttribute('aria-disabled', 'true')
    await expect(
      tray.getByRole('link', { name: 'Visa jämförelse' }),
    ).toHaveCount(0)
  })

  test('clear button hides the tray and resets all compare-button pressed states', async ({
    page,
  }) => {
    await navigateToDirectory(page)

    await waitForCompareButtonReady(page, 'Bellevuegårdens montessoriförskola')
    await waitForCompareButtonReady(page, 'Almgårdens förskola')

    const bellevueButton = getCompareButton(
      page,
      'Bellevuegårdens montessoriförskola',
    )
    const almgardenButton = getCompareButton(page, 'Almgårdens förskola')

    await bellevueButton.click()
    await almgardenButton.click()

    const tray = getCompareTray(page)
    await expect(tray).toBeVisible()
    await expect(bellevueButton).toHaveAttribute('aria-pressed', 'true')
    await expect(almgardenButton).toHaveAttribute('aria-pressed', 'true')

    // i18n key: compareTray.clear => "Rensa"
    const clearButton = tray.getByRole('button', { name: 'Rensa' })
    await expect(clearButton).toBeVisible()
    await clearButton.click()

    // Tray should disappear after clearing
    const trayCount = await tray.count()
    if (trayCount > 0) {
      await expect(tray).not.toBeVisible()
    }

    // Both compare buttons should return to unpressed state
    await expect(bellevueButton).toHaveAttribute('aria-pressed', 'false')
    await expect(almgardenButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('tray controls are keyboard reachable and operable', async ({
    page,
  }) => {
    await navigateToDirectory(page)

    await waitForCompareButtonReady(page, 'Bellevuegårdens montessoriförskola')

    // Select a preschool via keyboard: focus the compare button and press Enter
    const bellevueButton = getCompareButton(
      page,
      'Bellevuegårdens montessoriförskola',
    )
    await bellevueButton.focus()
    await page.keyboard.press('Enter')
    await expect(bellevueButton).toHaveAttribute('aria-pressed', 'true')

    const tray = getCompareTray(page)
    await expect(tray).toBeVisible()

    // Compare CTA in the tray must be focusable via Tab even when disabled
    // (aria-disabled keeps it in the tab order unlike the HTML disabled attribute)
    const compareCTA = tray.getByRole('button', { name: 'Visa jämförelse' })
    await expect(compareCTA).toBeVisible()
    await expect(compareCTA).toHaveAttribute('aria-disabled', 'true')
    await compareCTA.focus()
    await expect(compareCTA).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/forskoleguiden/sv/')

    // Clear button in the tray must be focusable and operable via keyboard
    const clearButton = tray.getByRole('button', { name: 'Rensa' })
    await clearButton.focus()
    await expect(clearButton).toBeFocused()
    await page.keyboard.press('Enter')

    // After keyboard-clear, tray must no longer be visible
    const trayCount = await tray.count()
    if (trayCount > 0) {
      await expect(tray).not.toBeVisible()
    }

    await expect(bellevueButton).toHaveAttribute('aria-pressed', 'false')
  })

  test('footer attribution link remains scrollable above the tray on a 375×812 viewport', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await navigateToDirectory(page)

    await waitForCompareButtonReady(page, 'Bellevuegårdens montessoriförskola')
    await getCompareButton(page, 'Bellevuegårdens montessoriförskola').click()

    const tray = getCompareTray(page)
    await expect(tray).toBeVisible()

    // Scroll to the very bottom of the page so the footer is in view
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
    )

    const trayBox = await tray.boundingBox()
    const footerLink = page.locator('footer').getByRole('link').first()
    const footerLinkBox = await footerLink.boundingBox()

    expect(trayBox).not.toBeNull()
    expect(footerLinkBox).not.toBeNull()

    // The bottom edge of the footer link must sit at or above the top edge of the
    // fixed tray — i.e. the tray must not obscure the footer content.
    expect(footerLinkBox!.y + footerLinkBox!.height).toBeLessThanOrEqual(
      trayBox!.y,
    )
  })

  test('tray state recovers after a full page reload and subsequent compare toggles', async ({
    page,
  }) => {
    await navigateToDirectory(page)

    const bellevueButton = getCompareButton(
      page,
      'Bellevuegårdens montessoriförskola',
    )

    await waitForCompareButtonReady(page, 'Bellevuegårdens montessoriförskola')

    await bellevueButton.click()
    await expect(getCompareTray(page)).toBeVisible()
    await expect(bellevueButton).toHaveAttribute('aria-pressed', 'true')

    await page.reload()
    await expect(page).toHaveURL('/forskoleguiden/sv/')

    const reloadedBellevueButton = getCompareButton(
      page,
      'Bellevuegårdens montessoriförskola',
    )

    await expect(reloadedBellevueButton).toHaveAttribute('aria-pressed', 'true')
    await expect(getCompareTray(page)).toBeVisible()

    await reloadedBellevueButton.click()
    await expect(reloadedBellevueButton).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await expect(getCompareTray(page)).toHaveCount(0)

    await reloadedBellevueButton.click()
    await expect(reloadedBellevueButton).toHaveAttribute('aria-pressed', 'true')
    await expect(getCompareTray(page)).toBeVisible()
  })
})
