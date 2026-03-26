import { expect, test } from './fixtures'
import {
  COMPARISON_URL_AR,
  COMPARISON_URL_EN,
  DIRECTORY_URL,
  DIRECTORY_URL_AR,
  DIRECTORY_URL_EN,
  encodeSharePayload,
  getCompareButton,
  getDirectoryCard,
  QUEUE_DETAIL_URL,
  waitForCompareButtonReady,
  waitForCompareButtonSelected,
} from './helpers'

// Three canonical preschools stable across all test runs.
// Almgårdens is municipal; Bellevuegårdens and Bladins are independent with queueUrls.
const PRESCHOOL_1 = 'Almgårdens förskola'
const PRESCHOOL_2 = 'Bellevuegårdens montessoriförskola'
const PRESCHOOL_3 = 'Bladins internationella förskola'

// Derive English detail path from the canonical Swedish QUEUE_DETAIL_URL.
const PRESCHOOL_2_EN_DETAIL = QUEUE_DETAIL_URL.replace('/sv/', '/en/')

// Slug IDs for share URL encoding
const SHARE_IDS = [
  'almgardens-forskola',
  'bellevuegardens-montessoriforskola',
  'bladins-internationella-forskola',
]

// ---------------------------------------------------------------------------
// Full Phase 2 user journey — 12 steps from specs/010-final-verification
// ---------------------------------------------------------------------------

test('full Phase 2 user journey: language switching, selection, queue link, comparison, share, restore, RTL', async ({
  page,
  browser,
}) => {
  // ── Step 1: Language switcher visible on Swedish directory ───────────────
  await page.goto(DIRECTORY_URL)

  const switcher = page.getByRole('navigation', { name: /spr|lang/i })
  await expect(switcher).toBeVisible()

  // Open the language dropdown
  await switcher.locator('[data-testid="header-language-toggle"]').click()
  const options = switcher.locator('[data-testid="header-language-options"]')

  // "Svenska" is the active language (aria-current="page", not a link)
  const activeLang = options.locator('[aria-current="page"]')
  await expect(activeLang).toBeVisible()
  await expect(activeLang).toContainText('Svenska')

  // Links to English and Arabic exist
  await expect(options.getByRole('link', { name: /English/i })).toBeVisible()
  await expect(options.getByRole('link', { name: 'العربية' })).toBeVisible()

  // ── Step 2: Switch to English ───────────────────────────────────────────
  await options.getByRole('link', { name: /English/i }).click()
  await expect(page).toHaveURL(DIRECTORY_URL_EN)

  // Page heading uses English text
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Preschools in Malmö',
  )

  // ── Step 3: Add 3 preschools to compare on English directory ────────────
  await waitForCompareButtonReady(page, PRESCHOOL_1)
  await waitForCompareButtonReady(page, PRESCHOOL_2)
  await waitForCompareButtonReady(page, PRESCHOOL_3)

  await getCompareButton(page, PRESCHOOL_1).click()
  await waitForCompareButtonSelected(page, PRESCHOOL_1)

  await getCompareButton(page, PRESCHOOL_2).click()
  await waitForCompareButtonSelected(page, PRESCHOOL_2)

  await getCompareButton(page, PRESCHOOL_3).click()
  await waitForCompareButtonSelected(page, PRESCHOOL_3)

  // Compare tray shows 3 selected with English text
  const tray = page.getByTestId('compare-tray')
  await expect(tray).toBeVisible()
  await expect(tray).toContainText('Selected preschools')
  await expect(tray).toContainText('3')

  // ── Step 4: View preschool detail page in English ───────────────────────
  const detailLink = getDirectoryCard(page, PRESCHOOL_1).getByRole('link', {
    name: PRESCHOOL_1,
  })
  await detailLink.click()

  await expect(page).toHaveURL(/\/en\/forskola\//)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(PRESCHOOL_1)

  // ── Step 5: Queue link on independent preschool detail page ─────────────
  await page.goto(PRESCHOOL_2_EN_DETAIL)

  const queueLink = page.getByRole('link', { name: /Register for queue/i })
  await expect(queueLink).toBeVisible()
  await expect(queueLink).toHaveAttribute('target', '_blank')
  await expect(queueLink).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(queueLink).toHaveAttribute('href', /^https:\/\//)

  // ── Step 6: Compare state persists after returning to directory ──────────
  await page.goto(DIRECTORY_URL_EN)

  const directoryTray = page.getByTestId('compare-tray')
  await expect(directoryTray).toBeVisible()
  await expect(directoryTray).toContainText('3')

  await waitForCompareButtonSelected(page, PRESCHOOL_1)
  await waitForCompareButtonSelected(page, PRESCHOOL_2)
  await waitForCompareButtonSelected(page, PRESCHOOL_3)

  // ── Step 7: Comparison view shows 3 preschools in English ───────────────
  await page.goto(COMPARISON_URL_EN)

  const compScroll = page.getByTestId('comparison-scroll')
  await expect(compScroll).toBeVisible()

  // All 3 preschool names must be visible as links
  await expect(
    compScroll.getByRole('link', { name: PRESCHOOL_1 }).first(),
  ).toBeVisible()
  await expect(
    compScroll.getByRole('link', { name: PRESCHOOL_2 }).first(),
  ).toBeVisible()
  await expect(
    compScroll.getByRole('link', { name: PRESCHOOL_3 }).first(),
  ).toBeVisible()

  // ── Step 8: Share button shows confirmation ─────────────────────────────
  const shareButton = page.getByTestId('share-comparison-button')
  await expect(shareButton).toBeVisible()
  await shareButton.click()

  // Expect either the "copied" confirmation or the fallback input
  const copiedFeedback = page.getByTestId('share-feedback-copied')
  const fallbackFeedback = page.getByTestId('share-feedback-fallback')

  await expect(copiedFeedback.or(fallbackFeedback)).toBeVisible()

  // ── Step 9: Share URL restoration in new context ────────────────────────
  const encoded = encodeSharePayload(SHARE_IDS)
  const shareUrl = `${COMPARISON_URL_EN}?s=${encoded}`

  const newContext = await browser.newContext()
  const newPage = await newContext.newPage()

  // Mirror _autoPageErrors: capture errors on the new page so they are not
  // silently swallowed (the auto-fixture only covers the default `page`).
  const newPageErrors: string[] = []
  newPage.on('pageerror', (error) => {
    newPageErrors.push(`[pageerror] ${error.message}`)
  })
  newPage.on('console', (msg) => {
    if (msg.type() === 'error') {
      newPageErrors.push(`[console.error] ${msg.text()}`)
    }
  })

  await newPage.goto(shareUrl)

  const newCompScroll = newPage.getByTestId('comparison-scroll')
  await expect(newCompScroll).toBeVisible()

  // All 3 preschool names must be restored
  await expect(
    newCompScroll.getByRole('link', { name: PRESCHOOL_1 }).first(),
  ).toBeVisible()
  await expect(
    newCompScroll.getByRole('link', { name: PRESCHOOL_2 }).first(),
  ).toBeVisible()
  await expect(
    newCompScroll.getByRole('link', { name: PRESCHOOL_3 }).first(),
  ).toBeVisible()

  await newContext.close()

  // Fail if the share-restored page produced any JS errors.
  if (newPageErrors.length > 0) {
    throw new Error(
      `Unexpected browser errors during share URL restoration:\n${newPageErrors.join('\n')}`,
    )
  }

  // ── Step 10: Switch to Arabic on comparison page ────────────────────────
  // Re-open the language switcher on the comparison page (original context)
  const compSwitcher = page.getByRole('navigation', { name: /spr|lang/i })
  await compSwitcher.locator('[data-testid="header-language-toggle"]').click()
  const compOptions = compSwitcher.locator(
    '[data-testid="header-language-options"]',
  )
  await compOptions.getByRole('link', { name: 'العربية' }).click()

  await expect(page).toHaveURL(COMPARISON_URL_AR)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')

  // ── Step 11: Arabic text and RTL layout verification ────────────────────
  const arCompScroll = page.getByTestId('comparison-scroll')
  await expect(arCompScroll).toBeVisible()

  // The page should contain Arabic Unicode characters (U+0600–U+06FF range)
  const pageText = await page.locator('body').innerText()
  expect(pageText).toMatch(/[\u0600-\u06FF]/)

  // ── Step 12: Arabic directory with persisted state ──────────────────────
  await page.goto(DIRECTORY_URL_AR)

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

  const arTray = page.getByTestId('compare-tray')
  await expect(arTray).toBeVisible()
  await expect(arTray).toContainText('3')

  // Verify individual compare button states on the Arabic directory
  await waitForCompareButtonSelected(page, PRESCHOOL_1)
  await waitForCompareButtonSelected(page, PRESCHOOL_2)
  await waitForCompareButtonSelected(page, PRESCHOOL_3)
})
