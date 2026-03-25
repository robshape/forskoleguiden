import { expect, type Page, test } from './fixtures'
import { getCompareButton, waitForCompareButtonReady } from './helpers'

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

  test('tray appears after selecting preschools and shows correct count and live compare CTA link', async ({
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

    // Compare CTA must be a live link to the comparison route once it exists.
    // i18n key: compareTray.showComparison => "Visa jämförelse"
    const compareCTA = tray.getByRole('link', { name: 'Visa jämförelse' })
    await expect(compareCTA).toBeVisible()
    await expect(compareCTA).toHaveAttribute(
      'href',
      '/forskoleguiden/sv/jamfor/',
    )
    await expect(
      tray.getByRole('button', { name: 'Visa jämförelse' }),
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

    // Compare CTA in the tray must be a live link once the route exists,
    // keyboard-focusable and navigating to the comparison route on click.
    const compareCTA = tray.getByRole('link', { name: 'Visa jämförelse' })
    await expect(compareCTA).toBeVisible()
    await expect(compareCTA).toHaveAttribute(
      'href',
      '/forskoleguiden/sv/jamfor/',
    )
    await compareCTA.focus()
    await expect(compareCTA).toBeFocused()

    // Navigate using click (keyboard Enter on programmatically-focused links
    // is unreliable in Playwright; the important thing is the link exists,
    // is focusable, and has the correct href).
    await compareCTA.click()
    await expect(page).toHaveURL('/forskoleguiden/sv/jamfor/')

    // On the comparison page, the CTA link is hidden (isOnComparePage=true),
    // so only the clear button is available in the tray.
    const comparisonTray = page.getByTestId('compare-tray')
    await expect(comparisonTray).toBeVisible()
    await expect(
      comparisonTray.getByRole('link', { name: 'Visa jämförelse' }),
    ).not.toBeAttached()

    // Clear button in the tray must be focusable and operable via keyboard
    const clearButton = comparisonTray.getByRole('button', { name: 'Rensa' })
    await clearButton.focus()
    await expect(clearButton).toBeFocused()
    await page.keyboard.press('Enter')

    // Clearing on the comparison page navigates to the directory
    await expect(page).toHaveURL('/forskoleguiden/sv/')
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

    // Wait and ensure ResizeObserver has updated the CSS variable
    await page.waitForFunction(() => {
      const height =
        document.documentElement.style.getPropertyValue('--tray-height')
      return height && height !== '0px'
    })

    // Scroll to the very bottom of the page so the footer is in view
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
    )

    const footerLink = page.locator('footer').getByRole('link').first()

    // Poll until the footer link is fully above the fixed tray — avoids a
    // brittle waitForTimeout by retrying the geometric check until the
    // layout has settled after scrolling.
    await expect
      .poll(async () => {
        const trayBox = await tray.boundingBox()
        const footerLinkBox = await footerLink.boundingBox()
        if (!trayBox || !footerLinkBox) return false
        return footerLinkBox.y + footerLinkBox.height <= trayBox.y
      })
      .toBe(true)
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

  test('selecting a 6th preschool is silently refused when 5 are already selected', async ({
    page,
  }) => {
    await navigateToDirectory(page)

    const names = [
      'Bellevuegårdens montessoriförskola',
      'Bladins internationella förskola',
      'Almgårdens förskola',
      'Bulltofta förskola',
      'Almviksgårdens förskola',
    ]

    // Wait for all buttons to be ready
    for (const name of names) {
      await waitForCompareButtonReady(page, name)
    }
    await waitForCompareButtonReady(page, 'Almängens förskola')

    // Select 5 preschools (the maximum)
    for (const name of names) {
      await getCompareButton(page, name).click()
    }

    const tray = getCompareTray(page)
    await expect(tray).toBeVisible()
    await expect(tray).toContainText('5')

    // Verify all 5 are pressed
    for (const name of names) {
      await expect(getCompareButton(page, name)).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    }

    // Attempt to select a 6th — must be silently refused
    const sixthButton = getCompareButton(page, 'Almängens förskola')
    await sixthButton.click()

    await expect(sixthButton).toHaveAttribute('aria-pressed', 'false')
    await expect(tray).toContainText('5')
  })
})

// ---------------------------------------------------------------------------
// MPA persistence — navigating to comparisons page
// ---------------------------------------------------------------------------

test.describe('compare state MPA persistence across Astro page navigations', () => {
  const SECONDARY_PAGE = '/forskoleguiden/sv/jamfor/'

  test('selected preschools remain in the tray after navigating to a second page and back', async ({
    page,
  }) => {
    await navigateToDirectory(page)

    await waitForCompareButtonReady(page, 'Bellevuegårdens montessoriförskola')
    await waitForCompareButtonReady(page, 'Almgårdens förskola')

    await getCompareButton(page, 'Bellevuegårdens montessoriförskola').click()
    await getCompareButton(page, 'Almgårdens förskola').click()

    await expect(getCompareTray(page)).toBeVisible()
    await expect(getCompareTray(page)).toContainText('2')

    // MPA navigation: full page load to secondary Astro page
    const secondResponse = await page.goto(SECONDARY_PAGE)
    if (secondResponse === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/jamfor/")',
      )
    }
    expect(secondResponse.status(), 'Expected HTTP 200 from /sv/jamfor/').toBe(
      200,
    )

    // MPA navigation back: another full page load
    await navigateToDirectory(page)

    // Tray and count must be restored from sessionStorage on island hydration
    await expect(getCompareTray(page)).toBeVisible()
    await expect(getCompareTray(page)).toContainText('2')

    await expect(
      getCompareButton(page, 'Bellevuegårdens montessoriförskola'),
    ).toHaveAttribute('aria-pressed', 'true')
    await expect(getCompareButton(page, 'Almgårdens förskola')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('compare-button pressed state is restored after returning from a second Astro page', async ({
    page,
  }) => {
    await navigateToDirectory(page)

    await waitForCompareButtonReady(page, 'Bulltofta förskola')
    await getCompareButton(page, 'Bulltofta förskola').click()
    await expect(getCompareButton(page, 'Bulltofta förskola')).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    // Navigate away — MPA full page load to secondary page
    const secondResponse = await page.goto(SECONDARY_PAGE)
    if (secondResponse === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/jamfor/")',
      )
    }
    expect(secondResponse.status(), 'Expected HTTP 200 from /sv/jamfor/').toBe(
      200,
    )

    // Navigate back — another full page load
    await navigateToDirectory(page)

    // Pressed state must be restored on island re-hydration from sessionStorage
    await expect(getCompareButton(page, 'Bulltofta förskola')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('clearing compare via the tray on a second page removes tray on return to the directory', async ({
    page,
  }) => {
    await navigateToDirectory(page)

    await waitForCompareButtonReady(page, 'Bladins internationella förskola')
    await getCompareButton(page, 'Bladins internationella förskola').click()
    await expect(getCompareTray(page)).toBeVisible()

    // Navigate to secondary page — it must mount the compare tray via BaseLayout
    const secondResponse = await page.goto(SECONDARY_PAGE)
    if (secondResponse === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/jamfor/")',
      )
    }
    expect(secondResponse.status(), 'Expected HTTP 200 from /sv/jamfor/').toBe(
      200,
    )

    // Clear selections via the tray on the secondary page
    const secondPageTray = getCompareTray(page)
    await expect(secondPageTray).toBeVisible()
    const clearButton = secondPageTray.getByRole('button', { name: 'Rensa' })
    await clearButton.click()

    // Return to directory — tray must be absent and button must be unpressed
    await navigateToDirectory(page)

    const directoryTray = getCompareTray(page)
    const directoryTrayCount = await directoryTray.count()
    if (directoryTrayCount > 0) {
      await expect(directoryTray).not.toBeVisible()
    }
    await expect(
      getCompareButton(page, 'Bladins internationella förskola'),
    ).toHaveAttribute('aria-pressed', 'false')
  })
})
