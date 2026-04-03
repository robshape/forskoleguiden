import { expect, test } from './fixtures'
import {
  COMPARISON_URL,
  DIRECTORY_URL,
  getCompareButton,
  waitForCompareButtonReady,
  waitForCompareButtonSelected,
} from './helpers'

const PRESCHOOL_A = 'Almgårdens förskola'
const PRESCHOOL_B = 'Bellevuegårdens montessoriförskola'

test.describe('comparison page breakdown bar chart', () => {
  test('displays accessible bar charts with pattern fills, legends, and sr-only data tables', async ({
    page,
  }) => {
    // Select two preschools from the directory
    await page.goto(DIRECTORY_URL)
    await waitForCompareButtonReady(page, PRESCHOOL_A)
    await waitForCompareButtonReady(page, PRESCHOOL_B)

    await getCompareButton(page, PRESCHOOL_A).click()
    await waitForCompareButtonSelected(page, PRESCHOOL_A)
    await getCompareButton(page, PRESCHOOL_B).click()
    await waitForCompareButtonSelected(page, PRESCHOOL_B)

    // Navigate to comparison page
    await page.goto(COMPARISON_URL)

    // Wait for ComparisonView to hydrate
    const comparisonScroll = page.getByTestId('comparison-scroll')
    await expect(comparisonScroll).toBeVisible()

    // --- Bar chart SVGs ---
    // Target only bar chart SVGs (viewBox="0 0 100 20"), not legend swatches (12×12)
    const barChartSvgs = comparisonScroll.locator(
      '[aria-hidden="true"] svg[viewBox="0 0 100 20"]',
    )
    // 2 preschools × 2 questions = 4 bar chart SVGs
    await expect(barChartSvgs).toHaveCount(4)

    // Each bar chart SVG should contain at least one <pattern> and one <rect>
    const firstSvg = barChartSvgs.first()
    await expect(firstSvg.locator('pattern').first()).toBeAttached()
    await expect(firstSvg.locator('rect').first()).toBeAttached()

    // --- Aria-hidden ---
    // All bar chart SVGs should have aria-hidden="true"
    const count = await barChartSvgs.count()
    for (let i = 0; i < count; i++) {
      await expect(barChartSvgs.nth(i)).toHaveAttribute('aria-hidden', 'true')
    }

    // --- Legends ---
    const legendContainers = comparisonScroll.locator(
      '[aria-hidden="true"] .flex.flex-wrap',
    )
    await expect(legendContainers).toHaveCount(4)

    // The first legend should contain percentage text
    const firstLegend = legendContainers.first()
    await expect(firstLegend).toContainText('%')

    // --- Sr-only data tables ---
    const srOnlyTables = comparisonScroll.locator('.sr-only table')
    const tableCount = await srOnlyTables.count()
    expect(tableCount).toBeGreaterThanOrEqual(2)

    // Each table should have exactly 5 data rows (one per response category)
    const firstTable = srOnlyTables.first()
    const rows = firstTable.locator('tbody tr')
    await expect(rows).toHaveCount(5)
  })
})
