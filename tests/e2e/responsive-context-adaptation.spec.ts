import { expect, test } from './fixtures'
import {
  COMPARISON_URL,
  COMPARISON_URL_AR,
  DIRECTORY_URL,
  DIRECTORY_URL_AR,
} from './helpers'

const SEEDED_IDS = [
  'almgardens-forskola',
  'augustenborgs-forskola',
  'bellevuegardens-montessoriforskola',
]

// Geometry checks use bounding-box comparisons. Sub-pixel rendering on HiDPI
// or fractional-scaling displays can shift edges by a fraction of a CSS pixel.
const SUBPIXEL_TOLERANCE = 2

test.describe('responsive context adaptation', () => {
  test('directory uses deliberate spacing rhythm between groups and rows', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 393, height: 852 })

    const response = await page.goto(DIRECTORY_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    const spacingContract = await page.evaluate(() => {
      const contentContainer = document.querySelector(
        '[data-testid="content-container"]',
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
        !contentContainer ||
        !directorySection ||
        !toolbar ||
        !list ||
        rows.length < 2
      ) {
        return null
      }

      const contentRect = contentContainer.getBoundingClientRect()
      const directoryRect = directorySection.getBoundingClientRect()
      const toolbarRect = toolbar.getBoundingClientRect()
      const listRect = list.getBoundingClientRect()
      const firstRowRect = rows[0].getBoundingClientRect()
      const secondRowRect = rows[1].getBoundingClientRect()

      return {
        contentToDirectoryGap: directoryRect.top - contentRect.top,
        toolbarToListGap: listRect.top - toolbarRect.bottom,
        rowGap: secondRowRect.top - firstRowRect.bottom,
      }
    })

    expect(spacingContract).not.toBeNull()
    expect(spacingContract?.contentToDirectoryGap ?? 0).toBeGreaterThanOrEqual(
      24,
    )
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

    const mobileLayout = await page.evaluate(() => {
      const row = document.querySelector(
        'section[aria-label="Förskolelista"] > div',
      ) as HTMLElement | null
      if (!row) return null
      const heading = row.querySelector('h1')
      const sortGroup = row.querySelector('[role="group"]')
      if (!heading || !sortGroup) return null
      const headingRect = heading.getBoundingClientRect()
      const sortRect = sortGroup.getBoundingClientRect()
      return {
        headingBottom: headingRect.bottom,
        sortTop: sortRect.top,
      }
    })

    expect(mobileLayout).not.toBeNull()
    // On narrow mobile, heading must be above sort controls (stacked vertically)
    expect(mobileLayout!.headingBottom).toBeLessThanOrEqual(
      mobileLayout!.sortTop,
    )

    await page.setViewportSize({ width: 1280, height: 800 })
    await page.reload()

    const desktopLayout = await page.evaluate(() => {
      const row = document.querySelector(
        'section[aria-label="Förskolelista"] > div',
      ) as HTMLElement | null
      if (!row) return null
      const heading = row.querySelector('h1')
      const sortGroup = row.querySelector('[role="group"]')
      if (!heading || !sortGroup) return null
      const headingRect = heading.getBoundingClientRect()
      const sortRect = sortGroup.getBoundingClientRect()
      return {
        headingTop: headingRect.top,
        headingBottom: headingRect.bottom,
        sortTop: sortRect.top,
        sortBottom: sortRect.bottom,
      }
    })

    expect(desktopLayout).not.toBeNull()
    // On desktop, heading and sort controls share the same horizontal band (row layout)
    expect(desktopLayout!.sortTop).toBeLessThan(desktopLayout!.headingBottom)
    expect(desktopLayout!.headingTop).toBeLessThan(desktopLayout!.sortBottom)
  })

  test('comparison stack stays readable on very small phones without horizontal overflow', async ({
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
    const scroll = page.getByTestId('comparison-scroll')
    await expect(scroll).toBeVisible()

    const stackContract = await page.evaluate(() => {
      const container = document.querySelector(
        '[data-testid="comparison-scroll"]',
      ) as HTMLElement | null

      if (!container) {
        return null
      }

      return {
        // Since we explicitly removed horizontal scroll layout, verify
        // the main container bounds fit the screen tightly and do not overflow
        hasHorizontalOverflow:
          container.getBoundingClientRect().width > window.innerWidth,
      }
    })

    expect(stackContract).not.toBeNull()
    expect(stackContract?.hasHorizontalOverflow).toBe(false)
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

    const layoutContract = await page.evaluate((tolerance) => {
      const tray = document.querySelector(
        '[data-testid="compare-tray"]',
      ) as HTMLElement | null
      const inner = tray?.querySelector(':scope > div') as HTMLElement | null
      // Actions container is the second child of the inner wrapper
      const actions = inner?.children.item(1) as HTMLElement | null
      if (!tray || !inner || !actions) return null

      const actionButtons = Array.from(
        actions.querySelectorAll(':scope > a, :scope > button'),
      )
      return {
        trayHasHorizontalOverflow: inner.scrollWidth > inner.clientWidth,
        // When stacked: each button occupies a separate row
        buttonsStacked:
          actionButtons.length >= 2
            ? actionButtons[0].getBoundingClientRect().bottom <=
              actionButtons[1].getBoundingClientRect().top + tolerance
            : true,
      }
    }, SUBPIXEL_TOLERANCE)

    expect(layoutContract).not.toBeNull()
    expect(layoutContract!.buttonsStacked).toBe(true)
    expect(layoutContract!.trayHasHorizontalOverflow).toBe(false)

    await page.setViewportSize({ width: 500, height: 812 })

    const midWidthLayoutContract = await page.evaluate((tolerance) => {
      const tray = document.querySelector(
        '[data-testid="compare-tray"]',
      ) as HTMLElement | null
      const inner = tray?.querySelector(':scope > div') as HTMLElement | null
      const actions = inner?.children.item(1) as HTMLElement | null
      if (!tray || !inner || !actions) return null

      const actionButtons = Array.from(
        actions.querySelectorAll(':scope > a, :scope > button'),
      )
      return {
        buttonsStacked:
          actionButtons.length >= 2
            ? actionButtons[0].getBoundingClientRect().bottom <=
              actionButtons[1].getBoundingClientRect().top + tolerance
            : true,
      }
    }, SUBPIXEL_TOLERANCE)

    expect(midWidthLayoutContract).not.toBeNull()
    expect(midWidthLayoutContract!.buttonsStacked).toBe(true)
  })

  test('arabic single-selection comparison callout mirrors to the right edge on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 812 })

    await page.goto(DIRECTORY_URL_AR)
    await page.evaluate(
      (ids) => {
        sessionStorage.setItem('compareIds', JSON.stringify(ids))
      },
      ['almgardens-forskola'],
    )

    const response = await page.goto(COMPARISON_URL_AR)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL_AR}")`,
      )
    }

    expect(response.status()).toBe(200)
    await expect(page.getByTestId('single-selection-prompt')).toBeVisible()

    const calloutContract = await page.evaluate(() => {
      const header = document.querySelector(
        '[data-testid="single-selection-prompt"]',
      )?.parentElement as HTMLElement | null

      if (!header) {
        return null
      }

      const style = window.getComputedStyle(header)
      return {
        borderRightWidth: style.borderRightWidth,
        borderLeftWidth: style.borderLeftWidth,
        hasHorizontalOverflow:
          header.getBoundingClientRect().width > window.innerWidth,
      }
    })

    expect(calloutContract).not.toBeNull()
    expect(calloutContract?.borderRightWidth).not.toBe('0px')
    expect(calloutContract?.borderLeftWidth).toBe('0px')
    expect(calloutContract?.hasHorizontalOverflow).toBe(false)
  })

  test('arabic compare tray keeps the primary action stacked above clear on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 812 })

    const response = await page.goto(DIRECTORY_URL_AR)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL_AR}")`,
      )
    }

    expect(response.status()).toBe(200)
    await page.evaluate((ids) => {
      sessionStorage.clear()
      sessionStorage.setItem('compareIds', JSON.stringify(ids))
    }, SEEDED_IDS)
    await page.reload()

    const tray = page.getByTestId('compare-tray')
    await expect(tray).toBeVisible()

    const trayContract = await page.evaluate((tolerance) => {
      const actions = document.querySelector(
        '[data-testid="compare-tray"] > div > div:last-child',
      ) as HTMLElement | null

      if (!actions || actions.children.length < 2) {
        return null
      }

      const firstAction = actions.children.item(0) as HTMLElement
      const secondAction = actions.children.item(1) as HTMLElement
      const firstRect = firstAction.getBoundingClientRect()
      const secondRect = secondAction.getBoundingClientRect()

      return {
        firstActionIsAboveSecondAction:
          firstRect.bottom <= secondRect.top + tolerance,
        hasHorizontalOverflow: actions.scrollWidth > actions.clientWidth,
      }
    }, SUBPIXEL_TOLERANCE)

    expect(trayContract).not.toBeNull()
    expect(trayContract?.firstActionIsAboveSecondAction).toBe(true)
    expect(trayContract?.hasHorizontalOverflow).toBe(false)
  })

  test('arabic compare tray keeps the primary action to the left of clear on wider screens', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 812 })

    const response = await page.goto(DIRECTORY_URL_AR)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL_AR}")`,
      )
    }

    expect(response.status()).toBe(200)
    await page.evaluate((ids) => {
      sessionStorage.setItem('compareIds', JSON.stringify(ids))
    }, SEEDED_IDS)
    await page.reload()

    const tray = page.getByTestId('compare-tray')
    await expect(tray).toBeVisible()

    const trayContract = await page.evaluate(() => {
      const actions = document.querySelector(
        '[data-testid="compare-tray"] > div > div:last-child',
      ) as HTMLElement | null

      if (!actions || actions.children.length < 2) {
        return null
      }

      const firstAction = actions.children.item(0) as HTMLElement
      const secondAction = actions.children.item(1) as HTMLElement
      const firstRect = firstAction.getBoundingClientRect()
      const secondRect = secondAction.getBoundingClientRect()

      return {
        firstActionIsLeftOfSecondAction: firstRect.left < secondRect.left,
        hasHorizontalOverflow: actions.scrollWidth > actions.clientWidth,
      }
    })

    expect(trayContract).not.toBeNull()
    expect(trayContract?.firstActionIsLeftOfSecondAction).toBe(true)
    expect(trayContract?.hasHorizontalOverflow).toBe(false)
  })
})
