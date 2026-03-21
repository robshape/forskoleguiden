import { MALMO_SOURCE_URL } from '../../src/lib/constants'
import { expect, test } from './fixtures'
import {
  COMPARISON_URL,
  DETAIL_URL,
  DIRECTORY_URL,
  getCompareButton,
  getDirectoryCard,
  waitForCompareButtonReady,
  waitForCompareButtonSelected,
} from './helpers'

// Three canonical preschools stable across all test runs
const PRESCHOOL_1 = 'Almgårdens förskola'
const PRESCHOOL_2 = 'Bellevuegårdens montessoriförskola'
const PRESCHOOL_3 = 'Bladins internationella förskola'

// ---------------------------------------------------------------------------
// Full Phase 1 user journey — 14 steps from docs/implementation-plan-phase-1.md §13.2
// ---------------------------------------------------------------------------

test('full Phase 1 user journey: directory → sort → select 3 → compare page → back → detail → state persistence', async ({
  page,
}) => {
  // ── Step 1: Load /sv/ ───────────────────────────────────────────────────
  const response = await page.goto(DIRECTORY_URL)
  if (response === null) {
    throw new Error(
      'Expected non-null response from page.goto("/forskoleguiden/sv/")',
    )
  }
  expect(response.status(), 'Expected HTTP 200 from /sv/').toBe(200)

  // ── Step 2: Verify the directory is present ──────────────────────────────
  // Scope to the directory section so the locator stays resilient if more
  // h2 elements are added elsewhere on the page in the future.
  const directorySection = page.locator('section[aria-label="Förskolelista"]')
  const listRows = page.locator('section[aria-label="Förskolelista"] > ul > li')
  const firstPreschoolLink = listRows.first().getByRole('link').first()

  await expect(directorySection.getByRole('heading', { level: 1 })).toHaveText(
    /Förskolor i Malmö \(\d+\)/,
  )
  await expect(page.getByTestId('preschool-card').first()).toBeVisible()

  // Capture the first preschool name dynamically — no hardcoded names
  const alphabeticalFirstName = (await firstPreschoolLink.textContent())?.trim()
  expect(alphabeticalFirstName).toBeTruthy()

  // ── Step 3: Toggle sort away from default (A–Ö) to Resultat, then back ─────
  const betygButton = page.getByRole('button', { name: 'Resultat' })
  const azButton = page.getByRole('button', { name: 'A–Ö' })

  // Hydration guard: SortToggle uses client:load, so interactions must wait
  // until the island has mounted on the client.
  await expect(page.getByTestId('sort-toggle')).toHaveAttribute(
    'data-hydrated',
    'true',
  )

  // Verify initial pressed states
  await expect(azButton).toHaveAttribute('aria-pressed', 'true')
  await expect(betygButton).toHaveAttribute('aria-pressed', 'false')

  // Switch to Resultat
  await betygButton.click()
  await expect(betygButton).toHaveAttribute('aria-pressed', 'true')
  await expect(azButton).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByTestId('sort-live-region')).toContainText('Resultat')
  // Verify the sort actually reordered — first card should differ from alphabetical first
  await expect(firstPreschoolLink).not.toHaveText(alphabeticalFirstName!)

  // Switch back to alphabetical
  await azButton.click()
  await expect(azButton).toHaveAttribute('aria-pressed', 'true')
  await expect(betygButton).toHaveAttribute('aria-pressed', 'false')
  await expect(page.getByTestId('sort-live-region')).toContainText('A–Ö')

  // Alphabetical order restored — original first name should be back.
  // toHaveText polls until the sort useEffect has reordered the DOM.
  await expect(firstPreschoolLink).toHaveText(alphabeticalFirstName!)

  // ── Step 4: Add 3 preschools using real compare-button clicks ────────────
  // Wait for Preact hydration on all three buttons before clicking
  await waitForCompareButtonReady(page, PRESCHOOL_1)
  await waitForCompareButtonReady(page, PRESCHOOL_2)
  await waitForCompareButtonReady(page, PRESCHOOL_3)

  await getCompareButton(page, PRESCHOOL_1).click()
  await expect(getCompareButton(page, PRESCHOOL_1)).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await getCompareButton(page, PRESCHOOL_2).click()
  await expect(getCompareButton(page, PRESCHOOL_2)).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await getCompareButton(page, PRESCHOOL_3).click()
  await expect(getCompareButton(page, PRESCHOOL_3)).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  // ── Step 5: Verify tray shows 3 selected and click "Visa jämförelse" ─────
  const tray = page.getByTestId('compare-tray')
  await expect(tray).toBeVisible()
  // i18n key: compareTray.selectedCount => "{count} förskolor valda"
  await expect(tray).toContainText('3')

  const compareCTA = tray.getByRole('link', { name: 'Visa jämförelse' })
  await expect(compareCTA).toBeVisible()
  await compareCTA.click()

  // ── Step 6: On /sv/jamfor/, verify 3 preschool columns with correct names ─
  await expect(page).toHaveURL(COMPARISON_URL)

  // ComparisonView is client:only="preact" — wait for hydration
  const compScroll = page.getByTestId('comparison-scroll')
  await expect(compScroll).toBeVisible()

  // All 3 preschool name headings (h2) must be visible
  await expect(
    page.getByRole('heading', { level: 2, name: PRESCHOOL_1 }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: PRESCHOOL_2 }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: PRESCHOOL_3 }),
  ).toBeVisible()

  // ── Step 7: Verify summary text is present and mentions all 3 names ──────
  // Summary requires ≥2 preschools; with 3 selected the best-per-question
  // format mentions relevant names for each question.
  const summary = page.getByTestId('comparison-summary')
  await expect(summary).toBeVisible()
  await expect(summary).toContainText(PRESCHOOL_1)
  await expect(summary).toContainText(PRESCHOOL_2)
  await expect(summary).toContainText(PRESCHOOL_3)

  // ── Step 9: Verify attribution link is present on the comparison page ────
  // Attribution lives in the <footer> (BaseLayout renders Footer on every page)
  const footer = page.locator('footer')
  const attributionLink = footer.getByRole('link', {
    name: 'Enkätdata (2025) kommer från Malmö stad.',
  })
  await expect(attributionLink).toBeVisible()
  await expect(attributionLink).toHaveAttribute('href', MALMO_SOURCE_URL)

  // ── Step 10: Navigate back to /sv/ using real MPA navigation ─────────────
  // "Tillbaka till förskolor" is a real <a> link inside ComparisonView
  const backToDirectoryLink = page.getByRole('link', {
    name: 'Tillbaka till förskolor',
  })
  await expect(backToDirectoryLink).toBeVisible()
  await backToDirectoryLink.click()

  await expect(page).toHaveURL(DIRECTORY_URL)

  // ── Step 11: Verify compare state persists on directory page ─────────────
  // CompareTray is client:only="preact"; wait for it to load from sessionStorage
  const directoryTray = page.getByTestId('compare-tray')
  await expect(directoryTray).toBeVisible()
  await expect(directoryTray).toContainText('3')

  // CompareButton islands re-hydrate from store on this page load
  await waitForCompareButtonSelected(page, PRESCHOOL_1)
  await waitForCompareButtonSelected(page, PRESCHOOL_2)
  await waitForCompareButtonSelected(page, PRESCHOOL_3)

  // ── Step 12: Open a preschool detail page from the directory ─────────────
  const detailLink = getDirectoryCard(page, PRESCHOOL_1).getByRole('link', {
    name: PRESCHOOL_1,
  })
  await detailLink.click()

  await expect(page).toHaveURL(DETAIL_URL)

  // ── Step 13: Verify detail page shows preschool data ─────────────────────
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(PRESCHOOL_1)

  // Operator type indicator
  await expect(
    page.locator('div', { hasText: 'Kommunal' }).first(),
  ).toBeVisible()

  // Overall assessment (Helhetsbedömning) section heading
  await expect(page.getByText('Helhetsbedömning')).toBeVisible()

  // Survey year is shown
  await expect(page.locator('div', { hasText: '2025' }).first()).toBeVisible()

  // ── Step 14: Navigate back to directory, verify compare state persists ────
  const detailBackLink = page.getByRole('link', {
    name: 'Tillbaka till förskolor',
  })
  await expect(detailBackLink).toBeVisible()
  await detailBackLink.click()

  await expect(page).toHaveURL(DIRECTORY_URL)

  // State must still be intact after returning from the detail page
  const finalTray = page.getByTestId('compare-tray')
  await expect(finalTray).toBeVisible()
  await expect(finalTray).toContainText('3')

  await waitForCompareButtonSelected(page, PRESCHOOL_1)
  await waitForCompareButtonSelected(page, PRESCHOOL_2)
  await waitForCompareButtonSelected(page, PRESCHOOL_3)
})
