import { expect, test } from './fixtures'
import {
  COMPARISON_URL,
  DIRECTORY_URL,
  DIRECTORY_URL_AR,
  DIRECTORY_URL_EN,
  encodeSharePayload,
  QUEUE_DETAIL_URL,
} from './helpers'

const PRESCHOOL_A = 'almgardens-forskola'
const PRESCHOOL_B = 'bellevuegardens-montessoriforskola'
const COMPARISON_SEED_IDS = [PRESCHOOL_A, PRESCHOOL_B]

// ---------------------------------------------------------------------------
// US3: Language switcher labeling — FR-005, FR-006, FR-007
// ---------------------------------------------------------------------------

test.describe('screen reader — language switcher labeling', () => {
  const localePages = [
    { locale: 'sv', url: DIRECTORY_URL },
    { locale: 'en', url: DIRECTORY_URL_EN },
    { locale: 'ar', url: DIRECTORY_URL_AR },
  ] as const

  for (const { locale, url } of localePages) {
    test(`${locale} page — nav landmark has descriptive aria-label, active locale marked with aria-current="page", and lang attributes`, async ({
      page,
    }) => {
      await page.goto(url)

      // FR-005: language switcher inside <nav> with non-empty aria-label
      const nav = page.locator(
        'nav:has(> [data-testid="header-language-dropdown"])',
      )
      const ariaLabel = await nav.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      expect((ariaLabel ?? '').trim().length).toBeGreaterThan(0)

      // Open the dropdown to access options
      const toggle = page.getByTestId('header-language-toggle')
      await toggle.click()

      // FR-006: active locale has aria-current="page"
      const options = page.getByTestId('header-language-options')
      const activeButton = options.locator('button[aria-current="page"]')
      await expect(activeButton).toBeVisible()
      await expect(activeButton).toHaveAttribute('lang', locale)

      // FR-007: each locale option has a lang attribute matching its target
      const localeItems = options.locator('li')
      const count = await localeItems.count()
      expect(count).toBe(3)

      for (let i = 0; i < count; i++) {
        const item = localeItems.nth(i)
        // Each option is either a button (active) or an anchor (inactive)
        const actionElement = item.locator('button, a')
        const lang = await actionElement.getAttribute('lang')
        expect(lang).toMatch(/^(sv|en|ar)$/)
      }
    })
  }
})

// ---------------------------------------------------------------------------
// US3: Share feedback live regions — FR-008, FR-009, FR-010, FR-011, FR-013
// ---------------------------------------------------------------------------

test.describe('screen reader — share feedback live regions', () => {
  const seedComparison = async (page: import('@playwright/test').Page) => {
    await page.goto(DIRECTORY_URL)
    await page.evaluate(
      (ids) => sessionStorage.setItem('compareIds', JSON.stringify(ids)),
      COMPARISON_SEED_IDS,
    )
  }

  test('share button has accessible label describing its action (FR-008)', async ({
    page,
  }) => {
    await seedComparison(page)
    await page.goto(COMPARISON_URL)

    const shareButton = page.getByTestId('share-comparison-button')
    await expect(shareButton).toBeVisible()

    // The button must have an accessible name — either visible text or aria-label
    const accessibleName = await shareButton.evaluate((el) => {
      const text = el.textContent?.trim() ?? ''
      const ariaLabel = el.getAttribute('aria-label') ?? ''
      return text || ariaLabel
    })
    expect(accessibleName.length).toBeGreaterThan(0)
    // Must not be generic text
    expect(accessibleName.toLowerCase()).not.toBe('button')
    expect(accessibleName.toLowerCase()).not.toBe('click here')
  })

  test('copied confirmation uses role="status" live region and remains visible ≥ 2s (FR-009, FR-013)', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await seedComparison(page)
    await page.goto(COMPARISON_URL)

    const shareButton = page.getByTestId('share-comparison-button')
    await expect(shareButton).toBeVisible()
    await shareButton.click()

    // FR-009: confirmation has role="status" for polite live region
    const copied = page.getByTestId('share-feedback-copied')
    await expect(copied).toBeVisible()
    await expect(copied).toHaveAttribute('role', 'status')

    // FR-013: must remain visible for at least 2 seconds
    // Wait 2 seconds and confirm still visible
    await page.waitForTimeout(2000)
    await expect(copied).toBeVisible()
  })

  test('warning message for stale IDs uses role="status" live region (FR-010)', async ({
    page,
  }) => {
    const encoded = encodeSharePayload([
      PRESCHOOL_A,
      'non-existent-preschool-xyz',
    ])
    await page.goto(`${COMPARISON_URL}?s=${encoded}`)

    const warning = page.getByTestId('share-feedback-warning')
    await expect(warning).toBeVisible()
    await expect(warning).toHaveAttribute('role', 'status')
  })

  test('error message for corrupted share URL uses role="alert" assertive live region (FR-011)', async ({
    page,
  }) => {
    await page.goto(`${COMPARISON_URL}?s=corrupted-garbage-data`)

    const error = page.getByTestId('share-feedback-error')
    await expect(error).toBeVisible()
    await expect(error).toHaveAttribute('role', 'alert')
  })
})

// ---------------------------------------------------------------------------
// US3: Queue link labeling — FR-012
// ---------------------------------------------------------------------------

test.describe('screen reader — queue link labeling', () => {
  test('queue link has descriptive text and target="_blank" (FR-012)', async ({
    page,
  }) => {
    await page.goto(QUEUE_DETAIL_URL)

    const queueLink = page.getByRole('link', { name: /Anmäl dig till kö/ })
    await expect(queueLink).toBeVisible()

    // FR-012: descriptive link text (not generic)
    const linkText = await queueLink.textContent()
    expect((linkText ?? '').trim().length).toBeGreaterThan(0)
    expect(linkText?.toLowerCase()).not.toContain('click here')
    expect(linkText?.toLowerCase()).not.toMatch(/\bhere\b/)

    // target="_blank" present
    await expect(queueLink).toHaveAttribute('target', '_blank')

    // rel="noopener noreferrer" for security
    await expect(queueLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
