import AxeBuilder from '@axe-core/playwright'

import { expect, test } from './fixtures'
import {
  COMPARISON_URL,
  DETAIL_URL,
  DIRECTORY_URL,
  DIRECTORY_URL_AR,
  DIRECTORY_URL_EN,
} from './helpers'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait for the search trigger button to be visible and ready. */
const getSearchTrigger = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: /sök|search|بحث/i })

/** Open search and wait for input to be focused. */
const openSearch = async (page: import('@playwright/test').Page) => {
  const trigger = getSearchTrigger(page)
  await trigger.click()
  const input = page.getByRole('combobox')
  await expect(input).toBeFocused()
  return input
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Search panel', () => {
  test('trigger is visible on directory, detail, and comparison pages', async ({
    page,
  }) => {
    for (const url of [DIRECTORY_URL, DETAIL_URL, COMPARISON_URL]) {
      await page.goto(url)
      await expect(getSearchTrigger(page)).toBeVisible()
    }
  })

  test('activate search expands panel with focused input', async ({ page }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)
    await expect(input).toBeVisible()
  })

  test('typing a query shows matching results with name and address', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)

    await input.fill('Almgården')
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()

    const options = listbox.getByRole('option')
    await expect(options.first()).toBeVisible()

    // First result should contain the name
    await expect(options.first()).toContainText('Almgårdens förskola')
  })

  test('clicking a result navigates to the detail page', async ({ page }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)

    await input.fill('Almgården')
    const firstOption = page.getByRole('listbox').getByRole('option').first()
    await firstOption.click()

    await expect(page).toHaveURL(/\/forskola\/almgardens-forskola\//)
  })

  test('compare toggle updates state and search stays open', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)

    await input.fill('Almgården')
    const option = page.getByRole('listbox').getByRole('option').first()
    await expect(option).toBeVisible()

    // Click the visual compare toggle within the option
    const toggleSpan = option.getByTestId('search-compare-toggle')
    await toggleSpan.click()

    // The sr-only accessible button should now be pressed
    const compareBtn = page.getByRole('button', {
      name: /Almgårdens förskola/i,
    })
    await expect(compareBtn).toHaveAttribute('aria-pressed', 'true')

    // Search input should still be visible (panel stays open)
    await expect(input).toBeVisible()
  })

  test('Escape closes search and restores focus to trigger', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    const trigger = getSearchTrigger(page)
    await trigger.click()

    const input = page.getByRole('combobox')
    await expect(input).toBeFocused()

    await page.keyboard.press('Escape')

    // Input should no longer be visible
    await expect(input).not.toBeVisible()

    // Focus should return to trigger
    await expect(trigger).toBeFocused()
  })

  test('arrow key navigation through results and Enter to select', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)

    await input.fill('förskola')
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()

    // Arrow down to first result
    await page.keyboard.press('ArrowDown')
    const firstOption = listbox.getByRole('option').first()
    await expect(firstOption).toHaveAttribute('aria-selected', 'true')

    // Arrow down to second result
    await page.keyboard.press('ArrowDown')
    const secondOption = listbox.getByRole('option').nth(1)
    await expect(secondOption).toHaveAttribute('aria-selected', 'true')
    await expect(firstOption).toHaveAttribute('aria-selected', 'false')

    // Enter navigates to the detail page
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/forskola\//)
  })

  test('no-results message for non-matching query', async ({ page }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)

    await input.fill('xyznonexistent123')
    await expect(page.getByText('Inga träffar')).toBeVisible()
  })

  test('RTL layout for Arabic locale', async ({ page }) => {
    await page.goto(DIRECTORY_URL_AR)
    const trigger = getSearchTrigger(page)
    await trigger.click()

    const input = page.getByRole('combobox')
    await expect(input).toBeVisible()

    // The HTML element should have dir="rtl"
    const dir = await page.locator('html').getAttribute('dir')
    expect(dir).toBe('rtl')

    // The search panel header should use RTL flex direction
    const header = page.getByTestId('search-panel-header')
    await expect(header).toHaveCSS('flex-direction', 'row-reverse')
  })

  test('result count indicator shows correct numbers', async ({ page }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)

    // Use a broad query that matches many preschools
    await input.fill('förskola')
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()

    // Should show count indicator (Visar X av Y)
    await expect(page.getByText(/Visar \d+ av \d+/)).toBeVisible()

    // Should show max 10 results
    const options = listbox.getByRole('option')
    const count = await options.count()
    expect(count).toBeLessThanOrEqual(10)
  })

  test('English locale shows English labels', async ({ page }) => {
    await page.goto(DIRECTORY_URL_EN)
    const trigger = page.getByRole('button', { name: 'Search' })
    await trigger.click()

    const input = page.getByRole('combobox')
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('placeholder', 'Search preschool…')
  })

  test('ArrowUp from first result wraps to last result', async ({ page }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)

    await input.fill('Almgården')
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()

    const options = listbox.getByRole('option')
    const optionCount = await options.count()

    // ArrowDown to first result
    await page.keyboard.press('ArrowDown')
    await expect(options.first()).toHaveAttribute('aria-selected', 'true')

    // ArrowUp should wrap to last result
    await page.keyboard.press('ArrowUp')
    await expect(options.nth(optionCount - 1)).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  test('close button dismisses search panel', async ({ page }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)
    await expect(input).toBeVisible()

    // Click the close button
    const closeBtn = page.getByRole('button', { name: /stäng sökning/i })
    await closeBtn.click()

    // Search panel should be dismissed
    await expect(input).not.toBeVisible()
  })

  test('clicking backdrop dismisses search panel', async ({ page }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)
    await expect(input).toBeVisible()

    // Click the backdrop (outside the panel card) to dismiss
    await page
      .getByTestId('search-backdrop')
      .click({ position: { x: 5, y: 5 } })

    await expect(input).not.toBeVisible()
    await expect(getSearchTrigger(page)).toBeVisible()
  })

  test('popup renders with rounded corners and shadow', async ({ page }) => {
    // Default Playwright viewport is 1280×720 — above sm breakpoint
    await page.goto(DIRECTORY_URL)
    await openSearch(page)

    const card = page
      .locator('[data-testid="search-panel-header"]')
      .locator('..')
    await expect(card).toHaveCSS('border-radius', '12px')
    await expect(card).not.toHaveCSS('box-shadow', 'none')
  })

  test('accessibility: no WCAG violations with search open', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    const input = await openSearch(page)
    await input.fill('Almgården')

    // Wait for results
    await expect(page.getByRole('listbox')).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})
