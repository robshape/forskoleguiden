import {
  expect,
  getFocusOutlineContract,
  getFocusRingContract,
  test,
} from './fixtures'

// Verify that ring-based interactive controls expose a visible focus indicator
// when reached by keyboard navigation. Ring-based controls suppress the global
// outline (focus-visible:outline-none) and use box-shadow rings instead
// (focus-visible:ring-2 focus-visible:ring-primary-600).

test.describe('keyboard navigation focus ring visibility', () => {
  test('sort toggle buttons show focus-visible ring when navigated by keyboard', async ({
    page,
  }) => {
    const response = await page.goto('/forskoleguiden/sv/')

    if (response === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/")',
      )
    }

    expect(response.status()).toBe(200)

    // Wait for the SortToggle Preact island to hydrate.
    // Default sort mode is alphabetical, so aria-pressed="true" on the A–Ö button.
    const alphabeticalBtn = page.getByRole('button', { name: 'A–Ö' })
    await expect(alphabeticalBtn).toHaveAttribute('aria-pressed', 'true')

    // Tab through interactive elements until the sort button receives keyboard focus.
    let sortButtonFocused = false
    for (let pressCount = 0; pressCount < 10; pressCount++) {
      await page.keyboard.press('Tab')
      sortButtonFocused = await alphabeticalBtn.evaluate(
        (el) => el === document.activeElement,
      )
      if (sortButtonFocused) break
    }

    expect(sortButtonFocused).toBe(true)
    await expect(alphabeticalBtn).toBeFocused()

    // Ring-based controls set focus-visible:ring-2 focus-visible:ring-primary-600
    // and explicitly suppress the outline with focus-visible:outline-none.
    // The ring colour (primary-600 = #2563eb = rgb(37, 99, 235)) must appear in
    // the computed box-shadow when the element is focused via keyboard.
    const focusRing = await getFocusRingContract(alphabeticalBtn)
    expect(focusRing.boxShadow).toContain('rgb(37, 99, 235)')
    expect(focusRing.outlineStyle).toBe('none')
  })
})

// ---------------------------------------------------------------------------
// Phase 2: Sort activation, card keyboard reachability, compare button focus
// ring, and compare tray Tab-reachability and keyboard operability.
// ---------------------------------------------------------------------------

test.describe('keyboard navigation — directory controls and compare tray', () => {
  test('ranking sort button activates the sort mode when pressed via Space key', async ({
    page,
  }) => {
    const response = await page.goto('/forskoleguiden/sv/')
    if (response === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/")',
      )
    }
    expect(response.status()).toBe(200)

    const alphabeticalBtn = page.getByRole('button', { name: 'A–Ö' })
    const rankingBtn = page.getByRole('button', { name: 'Betyg' })

    // Wait for the SortToggle island to hydrate — default mode is alphabetical.
    await expect(alphabeticalBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(rankingBtn).toHaveAttribute('aria-pressed', 'false')

    // Tab through the page until the A–Ö button receives focus.
    let alphabeticalFocused = false
    for (let pressCount = 0; pressCount < 10; pressCount++) {
      await page.keyboard.press('Tab')
      alphabeticalFocused = await alphabeticalBtn.evaluate(
        (el) => el === document.activeElement,
      )
      if (alphabeticalFocused) break
    }
    expect(alphabeticalFocused).toBe(true)

    // Tab once more to reach the ranking (Betyg) sort button.
    await page.keyboard.press('Tab')
    await expect(rankingBtn).toBeFocused()

    // Ring-based focus: primary-600 ring colour in box-shadow, outline suppressed.
    const betygFocusRing = await getFocusRingContract(rankingBtn)
    expect(betygFocusRing.boxShadow).toContain('rgb(37, 99, 235)')
    expect(betygFocusRing.outlineStyle).toBe('none')

    // Activate the ranking sort via Space key and verify the pressed state flips.
    await page.keyboard.press('Space')
    await expect(rankingBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(alphabeticalBtn).toHaveAttribute('aria-pressed', 'false')
  })

  test('first preschool card detail link and compare button are Tab-reachable from the sort toggle, and compare button exposes a visible focus ring', async ({
    page,
  }) => {
    const response = await page.goto('/forskoleguiden/sv/')
    if (response === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/")',
      )
    }
    expect(response.status()).toBe(200)

    const rankingBtn = page.getByRole('button', { name: 'Betyg' })

    // Wait for the SortToggle island to hydrate before testing Tab order.
    await expect(page.getByRole('button', { name: 'A–Ö' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    // Wait for the compare button in the first card to hydrate so the Tab order
    // is stable (CompareButton is a client:only island — aria-pressed signals it).
    const firstCardCompareBtn = page
      .getByTestId('preschool-card')
      .first()
      .getByRole('button')
    await expect(firstCardCompareBtn).toHaveAttribute('aria-pressed', 'false')

    // Focus the last sort button then Tab once — the first card detail link should
    // be the next focusable element in document order.
    await rankingBtn.focus()
    await page.keyboard.press('Tab')

    const firstCardLink = page
      .getByTestId('preschool-card')
      .first()
      .getByRole('link')
    await expect(firstCardLink).toBeFocused()

    // Tab once more to land on the compare button inside the same card.
    await page.keyboard.press('Tab')
    await expect(firstCardCompareBtn).toBeFocused()

    // Ring-based focus: primary-600 ring colour in box-shadow, outline suppressed.
    const focusRing = await getFocusRingContract(firstCardCompareBtn)
    expect(focusRing.boxShadow).toContain('rgb(37, 99, 235)')
    expect(focusRing.outlineStyle).toBe('none')
  })

  test('compare button toggles aria-pressed when activated via keyboard', async ({
    page,
  }) => {
    const response = await page.goto('/forskoleguiden/sv/')
    if (response === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/")',
      )
    }
    expect(response.status()).toBe(200)

    // Wait for at least the first compare button to hydrate.
    const firstCardCompareBtn = page
      .getByTestId('preschool-card')
      .first()
      .getByRole('button')
    await expect(firstCardCompareBtn).toHaveAttribute('aria-pressed', 'false')

    // Programmatically focus the compare button to place keyboard focus on the
    // control before sending Space. This verifies keyboard operability rather
    // than focus-visible styling, which is asserted in separate Tab-based tests.
    await firstCardCompareBtn.focus()
    await page.keyboard.press('Space')
    await expect(firstCardCompareBtn).toHaveAttribute('aria-pressed', 'true')

    // Press Space again to deselect.
    await page.keyboard.press('Space')
    await expect(firstCardCompareBtn).toHaveAttribute('aria-pressed', 'false')
  })

  test('compare tray CTA and clear button are Tab-reachable from the footer and keyboard-operable', async ({
    page,
  }) => {
    const response = await page.goto('/forskoleguiden/sv/')
    if (response === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/")',
      )
    }
    expect(response.status()).toBe(200)

    // Select a preschool via click to trigger the tray.
    const firstCardCompareBtn = page
      .getByTestId('preschool-card')
      .first()
      .getByRole('button')
    await expect(firstCardCompareBtn).toHaveAttribute('aria-pressed', 'false')
    await firstCardCompareBtn.click()

    const tray = page.getByTestId('compare-tray')
    await expect(tray).toBeVisible()

    // The CompareTray island is appended after the footer in the DOM, so
    // Tab from the footer attribution link should reach the tray CTA first.
    const footerLink = page.locator('footer a').first()
    await footerLink.focus()

    await page.keyboard.press('Tab')
    const compareCTA = tray.getByRole('link', { name: 'Visa jämförelse' })
    await expect(compareCTA).toBeFocused()
    await expect(compareCTA).toHaveAttribute(
      'href',
      '/forskoleguiden/sv/jamfor/',
    )

    // Activate the tray CTA via Enter and verify it navigates to comparison.
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/forskoleguiden/sv/jamfor/')

    const comparisonTray = page.getByTestId('compare-tray')
    await expect(comparisonTray).toBeVisible()

    // Re-anchor keyboard navigation from the comparison-page footer, then Tab
    // through the tray to verify the clear action remains keyboard-operable.
    const comparisonFooterLink = page.locator('footer a').first()
    await comparisonFooterLink.focus()

    await page.keyboard.press('Tab')
    await expect(
      comparisonTray.getByRole('link', { name: 'Visa jämförelse' }),
    ).toBeFocused()

    // One more Tab to reach the clear button.
    await page.keyboard.press('Tab')
    const clearButton = comparisonTray.getByRole('button', { name: 'Rensa' })
    await expect(clearButton).toBeFocused()

    // Press Enter to clear the selection; the tray should disappear.
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/forskoleguiden/sv/jamfor/')
    await expect(comparisonTray).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Phase 3: Comparison page keyboard behavior
// ---------------------------------------------------------------------------

const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'
const DIRECTORY_URL = '/forskoleguiden/sv/'

// Two known preschool IDs drawn from the real data fixture used across the
// comparison-page tests.
const SEEDED_IDS = ['almgardens-forskola', 'bellevuegardens-montessoriforskola']

test.describe('keyboard navigation — comparison page interactive flows', () => {
  test('empty-state back link is Tab-reachable, shows visible focus outline, and navigates on Enter', async ({
    page,
  }) => {
    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }
    expect(response.status()).toBe(200)

    // Wait for ComparisonView (client:only island) to render the empty state.
    await expect(
      page.getByRole('heading', { name: 'Inga förskolor valda' }),
    ).toBeVisible()

    const backLink = page.getByRole('link', { name: 'Tillbaka till förskolor' })
    await expect(backLink).toBeVisible()

    // Tab through the page until the back link receives keyboard focus.
    // Expected order: Tab 1 = nav logo link, Tab 2 = back link (first
    // tabbable inside the ComparisonView empty state).
    let backLinkFocused = false
    for (let pressCount = 0; pressCount < 10; pressCount++) {
      await page.keyboard.press('Tab')
      backLinkFocused = await backLink.evaluate(
        (el) => el === document.activeElement,
      )
      if (backLinkFocused) break
    }

    expect(backLinkFocused).toBe(true)
    await expect(backLink).toBeFocused()

    // The back link uses the global base-layer outline rule (no ring override).
    // Primary-600 outline colour must match rgb(37, 99, 235) = #2563eb.
    const focusOutline = await getFocusOutlineContract(backLink)
    expect(focusOutline.outlineWidth).toBe('2px')
    expect(focusOutline.outlineStyle).not.toBe('none')
    expect(focusOutline.outlineColor).toBe('rgb(37, 99, 235)')

    // Activate via Enter — navigates to the preschool directory.
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(DIRECTORY_URL)
  })

  test('comparison page with seeded state: back link and tray controls remain keyboard-accessible', async ({
    page,
  }) => {
    // Seed sessionStorage from the directory page so ComparisonView mounts
    // with real selections, triggering both the comparison table and the tray.
    await page.goto(DIRECTORY_URL)
    await page.evaluate((ids) => {
      sessionStorage.setItem('compareIds', JSON.stringify(ids))
    }, SEEDED_IDS)

    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }
    expect(response.status()).toBe(200)

    // ComparisonView must render the comparison heading (not empty state).
    await expect(
      page.getByRole('heading', { name: 'Jämför förskolor' }),
    ).toBeVisible()

    // The back link is present in the seeded state too.
    const backLink = page.getByRole('link', { name: 'Tillbaka till förskolor' })
    await expect(backLink).toBeVisible()

    // Tab-reachability: the back link is the only tabbable element inside the
    // comparison view content (table and charts are non-tabbable read-only widgets).
    let backLinkFocused = false
    for (let pressCount = 0; pressCount < 10; pressCount++) {
      await page.keyboard.press('Tab')
      backLinkFocused = await backLink.evaluate(
        (el) => el === document.activeElement,
      )
      if (backLinkFocused) break
    }

    expect(backLinkFocused).toBe(true)
    await expect(backLink).toBeFocused()

    // Tray must be visible because selections were loaded from sessionStorage.
    const tray = page.getByTestId('compare-tray')
    await expect(tray).toBeVisible()

    // Tab from the footer attribution link to reach the tray controls.
    const footerLink = page.locator('footer a').first()
    await footerLink.focus()

    await page.keyboard.press('Tab')
    const compareCTA = tray.getByRole('link', { name: 'Visa jämförelse' })
    await expect(compareCTA).toBeFocused()

    await page.keyboard.press('Tab')
    const clearButton = tray.getByRole('button', { name: 'Rensa' })
    await expect(clearButton).toBeFocused()
  })

  test('comparison table and bar charts are non-tabbable on the comparison page', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    await page.evaluate((ids) => {
      sessionStorage.setItem('compareIds', JSON.stringify(ids))
    }, SEEDED_IDS)

    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }
    expect(response.status()).toBe(200)

    // Wait for the comparison table to be present in the DOM.
    const table = page.getByTestId('comparison-table')
    await expect(table).toBeVisible()

    // The table is a read-only widget and must not have a tabindex attribute
    // (it must not appear in the tab order).
    await expect(table).not.toHaveAttribute('tabindex')

    // Bar charts use role="img" on their SVG element — they are decorative
    // companions to the visible table and must not be tabbable.
    const charts = page.locator('svg[role="img"]')
    const chartCount = await charts.count()
    expect(chartCount).toBeGreaterThan(0)
    for (let i = 0; i < chartCount; i++) {
      await expect(charts.nth(i)).not.toHaveAttribute('tabindex')
    }
  })
})
