import { expect, test } from './fixtures'

const DIRECTORY_URL = '/forskoleguiden/sv/'
const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'

const SEEDED_IDS = [
  'almgardens-forskola',
  'augustenborgs-forskola',
  'bellevuegardens-montessoriforskola',
]

test.describe('responsive context adaptation', () => {
  test('directory uses deliberate spacing rhythm between groups and rows', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    const response = await page.goto(DIRECTORY_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    const spacingContract = await page.evaluate(() => {
      const citySection = document.querySelector(
        'section[aria-label="Stad"]',
      ) as HTMLElement | null
      const directorySection = document.querySelector(
        'section[aria-label="Förskolelista"]',
      ) as HTMLElement | null
      const toolbar = directorySection?.querySelector(
        ':scope > div',
      ) as HTMLElement | null
      const list = document.querySelector(
        '#sv-preschool-directory-list',
      ) as HTMLUListElement | null
      const rows = list ? Array.from(list.querySelectorAll(':scope > li')) : []

      if (
        !citySection ||
        !directorySection ||
        !toolbar ||
        !list ||
        rows.length < 2
      ) {
        return null
      }

      const cityRect = citySection.getBoundingClientRect()
      const directoryRect = directorySection.getBoundingClientRect()
      const toolbarRect = toolbar.getBoundingClientRect()
      const listRect = list.getBoundingClientRect()
      const firstRowRect = rows[0].getBoundingClientRect()
      const secondRowRect = rows[1].getBoundingClientRect()

      return {
        majorSectionGap: directoryRect.top - cityRect.bottom,
        toolbarToListGap: listRect.top - toolbarRect.bottom,
        rowGap: secondRowRect.top - firstRowRect.bottom,
      }
    })

    expect(spacingContract).not.toBeNull()
    expect(spacingContract?.majorSectionGap ?? 0).toBeGreaterThanOrEqual(32)
    expect(spacingContract?.toolbarToListGap ?? 0).toBeGreaterThanOrEqual(20)
    expect(spacingContract?.rowGap ?? 0).toBeGreaterThanOrEqual(12)
  })

  test('directory heading and sort controls stack on narrow mobile and align in row on desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 812 })

    const response = await page.goto(DIRECTORY_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    const visibleDirectoryHeadingCount = await page.evaluate(() => {
      const headings = Array.from(
        document.querySelectorAll<HTMLHeadingElement>('h1, h2'),
      )

      return headings.filter((heading) => {
        if (!heading.textContent?.includes('Förskolor i Malmö')) return false

        const rect = heading.getBoundingClientRect()
        return rect.width > 40 && rect.height > 20
      }).length
    })

    expect(visibleDirectoryHeadingCount).toBe(1)

    const mobileDirection = await page.evaluate(() => {
      const row = document.querySelector(
        'section[aria-label="Förskolelista"] > div',
      ) as HTMLElement | null

      if (!row) return null
      return window.getComputedStyle(row).flexDirection
    })

    expect(mobileDirection).toBe('column')

    await page.setViewportSize({ width: 1280, height: 800 })
    await page.reload()

    const desktopDirection = await page.evaluate(() => {
      const row = document.querySelector(
        'section[aria-label="Förskolelista"] > div',
      ) as HTMLElement | null

      if (!row) return null
      return window.getComputedStyle(row).flexDirection
    })

    expect(desktopDirection).toBe('row')
  })

  test('comparison cards stay readable on very small phones while preserving horizontal scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 812 })

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
    await expect(page.getByTestId('comparison-scroll')).toBeVisible()

    const cardContract = await page.evaluate(() => {
      const scroll = document.querySelector(
        '[data-testid="comparison-scroll"]',
      ) as HTMLElement | null
      const firstColumn = scroll?.querySelector(
        '.snap-start',
      ) as HTMLElement | null

      if (!scroll || !firstColumn) {
        return null
      }

      return {
        firstCardWidth: firstColumn.getBoundingClientRect().width,
        hasHorizontalOverflow: scroll.scrollWidth > scroll.clientWidth,
      }
    })

    expect(cardContract).not.toBeNull()
    expect(cardContract?.firstCardWidth ?? 0).toBeGreaterThanOrEqual(240)
    expect(cardContract?.hasHorizontalOverflow).toBe(true)
  })

  test('compare tray action controls stack on very narrow mobile without horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 812 })

    const response = await page.goto(DIRECTORY_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    const firstCardCompareButton = page
      .getByTestId('preschool-card')
      .first()
      .getByRole('button', { name: /Jämför|Tillagd/ })

    await expect(firstCardCompareButton).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    await firstCardCompareButton.click()

    const tray = page.getByTestId('compare-tray')
    await expect(tray).toBeVisible()

    const layoutContract = await page.evaluate(() => {
      const tray = document.querySelector(
        '[data-testid="compare-tray"]',
      ) as HTMLElement | null
      const inner = tray?.querySelector(':scope > div') as HTMLElement | null
      const actions = inner?.children.item(1) as HTMLElement | null

      if (!tray || !inner || !actions) {
        return null
      }

      return {
        actionsDirection: window.getComputedStyle(actions).flexDirection,
        trayHasHorizontalOverflow: inner.scrollWidth > inner.clientWidth,
      }
    })

    expect(layoutContract).not.toBeNull()
    expect(layoutContract?.actionsDirection).toBe('column')
    expect(layoutContract?.trayHasHorizontalOverflow).toBe(false)

    await page.setViewportSize({ width: 500, height: 812 })

    const midWidthLayoutContract = await page.evaluate(() => {
      const tray = document.querySelector(
        '[data-testid="compare-tray"]',
      ) as HTMLElement | null
      const inner = tray?.querySelector(':scope > div') as HTMLElement | null
      const actions = inner?.children.item(1) as HTMLElement | null

      if (!tray || !inner || !actions) {
        return null
      }

      return {
        actionsDirection: window.getComputedStyle(actions).flexDirection,
      }
    })

    expect(midWidthLayoutContract).not.toBeNull()
    expect(midWidthLayoutContract?.actionsDirection).toBe('column')
  })
})
