import { AxeBuilder } from '@axe-core/playwright'

import { expect, test } from './fixtures'

const BASE = '/forskoleguiden'

const DIRECTORY_SV = `${BASE}/sv/`
const DIRECTORY_EN = `${BASE}/en/`
const DIRECTORY_AR = `${BASE}/ar/`

const STABLE_ID = 'almgardens-forskola'
const DETAIL_SV = `${BASE}/sv/forskola/${STABLE_ID}/`
const DETAIL_EN = `${BASE}/en/forskola/${STABLE_ID}/`
const DETAIL_AR = `${BASE}/ar/forskola/${STABLE_ID}/`

const COMPARISON_SV = `${BASE}/sv/jamfor/`
const COMPARISON_AR = `${BASE}/ar/jamfor/`

// ---------------------------------------------------------------------------
// Phase 3 / User Story 1 — Directory language switching
// ---------------------------------------------------------------------------

test.describe('language-switcher: directory page switching (US1)', () => {
  test('renders three locale options on the Swedish directory page', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_SV)

    const switcher = page.getByRole('navigation', { name: /spr|lang/i })
    await switcher.locator('[data-testid="header-language-toggle"]').click()
    await expect(switcher).toBeVisible()

    // All three locale labels are present in the options
    const options = switcher.locator('[data-testid="header-language-options"]')
    await expect(options.getByText('Svenska')).toBeVisible()
    await expect(options.getByText('English')).toBeVisible()
    await expect(options.getByText('العربية')).toBeVisible()
  })

  test('Swedish is active (non-link) on the Swedish directory page', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_SV)

    const switcher = page.getByRole('navigation', { name: /spr|lang/i })
    await switcher.locator('[data-testid="header-language-toggle"]').click()

    // Active locale is marked aria-current="page" and not a link
    const activeEl = switcher.locator('[aria-current="page"]')
    await expect(activeEl).toBeVisible()
    await expect(activeEl).toContainText('Svenska')
    // It should NOT be an <a> element (non-navigable)
    await expect(activeEl).not.toHaveRole('link')
  })

  test('clicking English navigates to the English directory', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_SV)

    const switcher = page.getByRole('navigation', { name: /spr|lang/i })
    await switcher.locator('[data-testid="header-language-toggle"]').click()
    const englishLink = switcher.getByRole('link', { name: /English/i })
    await expect(englishLink).toBeVisible()

    await englishLink.click()
    await expect(page).toHaveURL(new RegExp('/en/'))
  })

  test('clicking العربية navigates to the Arabic directory', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_SV)

    const switcher = page.getByRole('navigation', { name: /spr|lang/i })
    await switcher.locator('[data-testid="header-language-toggle"]').click()
    const arabicLink = switcher.getByRole('link', { name: 'العربية' })
    await expect(arabicLink).toBeVisible()

    await arabicLink.click()
    await expect(page).toHaveURL(new RegExp('/ar/'))
  })

  test('English is active on the English directory page', async ({ page }) => {
    await page.goto(DIRECTORY_EN)

    const switcher = page.getByRole('navigation', { name: /lang|choose/i })
    const activeEl = switcher.locator('[aria-current="page"]')
    await expect(activeEl).toContainText('English')
    await expect(activeEl).not.toHaveRole('link')
  })

  test('Arabic is active on the Arabic directory page', async ({ page }) => {
    await page.goto(DIRECTORY_AR)

    const switcher = page.getByRole('navigation', { name: /lang|اختر/i })
    const activeEl = switcher.locator('[aria-current="page"]')
    await expect(activeEl).toContainText('العربية')
    await expect(activeEl).not.toHaveRole('link')
  })
})

// ---------------------------------------------------------------------------
// Phase 3 / User Story 1 — Responsive labels
// ---------------------------------------------------------------------------

test.describe('language-switcher: responsive label rendering (US1)', () => {
  test('shows full locale names on a viewport wider than 375px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 600, height: 800 })
    await page.goto(DIRECTORY_SV)

    const switcher = page.getByRole('navigation', { name: /spr|lang/i })
    await switcher.locator('[data-testid="header-language-toggle"]').click()

    // Full name spans must be visible
    await expect(
      switcher.locator('[data-lang-label="full"]').first(),
    ).toBeVisible()
  })

  test('shows ISO codes on a 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(DIRECTORY_SV)

    const switcher = page.getByRole('navigation', { name: /spr|lang/i })
    await switcher.locator('[data-testid="header-language-toggle"]').click()

    // ISO spans must be visible; full spans hidden
    await expect(
      switcher.locator('[data-lang-label="iso"]').first(),
    ).toBeVisible()
    await expect(
      switcher.locator('[data-lang-label="full"]').first(),
    ).not.toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Phase 4 / User Story 2 — Dynamic route switching preserves path
// ---------------------------------------------------------------------------

test.describe('language-switcher: dynamic route preservation (US2)', () => {
  test('switching language on a detail page preserves the preschool slug', async ({
    page,
  }) => {
    await page.goto(DETAIL_SV)

    const switcher = page.getByRole('navigation', { name: /spr|lang/i })
    await switcher.locator('[data-testid="header-language-toggle"]').click()
    const englishHref = await switcher
      .getByRole('link', { name: /English/i })
      .getAttribute('href')

    expect(englishHref).toBe(DETAIL_EN)
  })

  test('switching to Arabic on a detail page preserves the slug', async ({
    page,
  }) => {
    await page.goto(DETAIL_SV)

    const switcher = page.getByRole('navigation', { name: /spr|lang/i })
    await switcher.locator('[data-testid="header-language-toggle"]').click()
    const arabicHref = await switcher
      .getByRole('link', { name: 'العربية' })
      .getAttribute('href')

    expect(arabicHref).toBe(DETAIL_AR)
  })

  test('switching from Arabic comparison page to Swedish lands on /sv/jamfor/', async ({
    page,
  }) => {
    await page.goto(COMPARISON_AR)

    const switcher = page.getByRole('navigation', { name: /lang|اختر/i })
    await switcher.locator('[data-testid="header-language-toggle"]').click()
    const svHref = await switcher
      .getByRole('link', { name: 'Svenska' })
      .getAttribute('href')

    expect(svHref).toBe(COMPARISON_SV)
  })
})

// ---------------------------------------------------------------------------
// Phase 5 / User Story 3 — Accessibility attributes
// ---------------------------------------------------------------------------

test.describe('language-switcher: accessibility attributes (US3)', () => {
  test('switcher has a translated navigation landmark label on Swedish page', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_SV)

    // Swedish: "Välj språk"
    const switcher = page.getByRole('navigation', { name: 'Välj språk' })
    await expect(switcher).toBeVisible()
  })

  test('switcher has translated landmark label on English page', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_EN)

    const switcher = page.getByRole('navigation', { name: 'Choose language' })
    await expect(switcher).toBeVisible()
  })

  test('switcher has translated landmark label on Arabic page', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_AR)

    const switcher = page.getByRole('navigation', { name: 'اختر اللغة' })
    await expect(switcher).toBeVisible()
  })

  test('inactive locale links carry correct lang attributes', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_SV)

    const switcher = page.getByRole('navigation', { name: 'Välj språk' })
    await switcher.locator('[data-testid="header-language-toggle"]').click()

    await expect(
      switcher.getByRole('link', { name: /English/i }),
    ).toHaveAttribute('lang', 'en')
    await expect(
      switcher.getByRole('link', { name: 'العربية' }),
    ).toHaveAttribute('lang', 'ar')
  })

  test('active locale element carries a lang attribute', async ({ page }) => {
    await page.goto(DIRECTORY_SV)

    const active = page
      .getByRole('navigation', { name: 'Välj språk' })
      .locator('[aria-current="page"]')

    await expect(active).toHaveAttribute('lang', 'sv')
  })

  test('Swedish directory page has zero axe violations with switcher present', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_SV)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('English directory page has zero axe violations with switcher present', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_EN)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('Arabic directory page has zero axe violations with switcher present', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_AR)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Phase 7 / Regression — locale-prefixed href outputs
// ---------------------------------------------------------------------------

test.describe('language-switcher: locale-prefixed link outputs (regression)', () => {
  test('all locale links on Swedish directory page start with the base path', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_SV)

    const switcher = page.getByRole('navigation', { name: 'Välj språk' })
    const links = switcher.getByRole('link')
    const count = await links.count()

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href')
      expect(href).toMatch(/^\/forskoleguiden\//)
    }
  })

  test('switcher does not carry compare-tray sessionStorage state side effects', async ({
    page,
  }) => {
    // Seed a compare selection
    await page.goto(DIRECTORY_SV)
    await page.evaluate(() => {
      sessionStorage.setItem(
        'compareIds',
        JSON.stringify(['almgardens-forskola']),
      )
    })

    // Navigate to English via switcher — compare set must survive unchanged
    const switcher = page.getByRole('navigation', { name: 'Välj språk' })
    await switcher.locator('[data-testid="header-language-toggle"]').click()
    await switcher.getByRole('link', { name: /English/i }).click()

    const stored = await page.evaluate(() =>
      sessionStorage.getItem('compareIds'),
    )
    expect(JSON.parse(stored ?? '[]')).toContain('almgardens-forskola')
  })
})
