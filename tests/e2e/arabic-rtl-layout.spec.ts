import { expect, test } from './fixtures'
import {
  ABOUT_URL_AR,
  COMPARISON_URL_AR,
  DETAIL_URL_AR,
  DIRECTORY_URL,
  DIRECTORY_URL_AR,
  DIRECTORY_URL_EN,
} from './helpers'

const SEEDED_IDS = ['almgardens-forskola', 'augustenborgs-forskola']

test.describe('arabic rtl layout', () => {
  test('arabic shell mirrors the header grouping and footer alignment', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL_AR)

    const navContract = await page.evaluate(() => {
      const title = document.querySelector(
        'nav a[href$="/ar/"]',
      ) as HTMLElement | null
      const controls = title?.parentElement
        ?.lastElementChild as HTMLElement | null
      const footerLink = document.querySelector(
        'footer a',
      ) as HTMLElement | null

      if (!title || !controls || !footerLink) {
        return null
      }

      const titleRect = title.getBoundingClientRect()
      const controlsRect = controls.getBoundingClientRect()
      const footerStyle = window.getComputedStyle(footerLink.parentElement!)

      return {
        titleIsFullyRightOfControls: titleRect.left > controlsRect.right,
        footerTextAlign: footerStyle.textAlign,
      }
    })

    expect(navContract).not.toBeNull()
    expect(navContract?.titleIsFullyRightOfControls).toBe(true)
    expect(navContract?.footerTextAlign).toBe('right')
  })

  test('arabic about page is reachable and renders the translated heading', async ({
    page,
  }) => {
    const aboutResponse = await page.goto(ABOUT_URL_AR)
    if (aboutResponse === null) {
      throw new Error(
        `Expected non-null response from page.goto("${ABOUT_URL_AR}")`,
      )
    }

    expect(aboutResponse.status()).toBe(200)
    await expect(
      page.getByRole('heading', { name: 'حول البيانات' }),
    ).toBeVisible()
  })

  test('arabic directory keeps compare controls operable and positions the action button left of the score block', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL_AR)

    const rankingButton = page.getByRole('button', { name: 'النتيجة' })
    await expect(rankingButton).toHaveAttribute('aria-pressed', 'false')
    await rankingButton.click()
    await expect(rankingButton).toHaveAttribute('aria-pressed', 'true')

    const firstCardCompareButton = page
      .getByTestId('preschool-card')
      .first()
      .getByRole('button', { name: /قارن|تمت الإضافة/ })
    await expect(firstCardCompareButton).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    const cardLayout = await page.evaluate(() => {
      const firstCard = document.querySelector(
        '[data-testid="preschool-card"]',
      ) as HTMLElement | null
      const actionRow = firstCard?.querySelector(
        ':scope > div:last-child',
      ) as HTMLElement | null

      if (!firstCard || !actionRow) {
        return null
      }

      const scoreInfo = actionRow.children.item(0) as HTMLElement | null
      const action = actionRow.children.item(1) as HTMLElement | null

      if (!scoreInfo || !action) {
        return null
      }

      const scoreRect = scoreInfo.getBoundingClientRect()
      const actionRect = action.getBoundingClientRect()

      return {
        compareActionIsLeftOfScoreInfo: actionRect.left < scoreRect.left,
      }
    })

    expect(cardLayout).not.toBeNull()
    expect(cardLayout?.compareActionIsLeftOfScoreInfo).toBe(true)

    await firstCardCompareButton.click()
    await expect(firstCardCompareButton).toHaveAttribute('aria-pressed', 'true')
  })

  test('arabic detail page mirrors the breadcrumb cue and keeps western numerals', async ({
    page,
  }) => {
    await page.goto(DETAIL_URL_AR)

    const breadcrumbContract = await page.evaluate(() => {
      const link = document.querySelector(
        '[data-breadcrumb] a',
      ) as HTMLElement | null
      const icon = link?.querySelector('svg') as SVGElement | null

      if (!link || !icon) {
        return null
      }

      const style = window.getComputedStyle(icon)

      return {
        rotate: style.rotate,
        transform: style.transform,
      }
    })

    expect(breadcrumbContract).not.toBeNull()
    expect(
      breadcrumbContract?.rotate === '180deg' ||
        breadcrumbContract?.transform !== 'none',
    ).toBe(true)

    const pageText = await page.locator('main').textContent()
    expect(pageText).toMatch(/[0-9]+%/)
    expect(pageText).not.toMatch(/[٠-٩]+%/)
  })

  test('arabic comparison keeps the single-selection callout mirrored and the tray action order reversed for rtl', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL_AR)
    await page.evaluate(
      (ids) => {
        sessionStorage.setItem('compareIds', JSON.stringify(ids))
      },
      ['almgardens-forskola'],
    )

    await page.goto(COMPARISON_URL_AR)
    await expect(page.getByTestId('single-selection-prompt')).toBeVisible()

    const singleSelectionContract = await page.evaluate(() => {
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
        paddingRight: style.paddingRight,
        paddingLeft: style.paddingLeft,
      }
    })

    expect(singleSelectionContract).not.toBeNull()
    expect(singleSelectionContract?.borderRightWidth).not.toBe('0px')
    expect(singleSelectionContract?.borderLeftWidth).toBe('0px')
    expect(singleSelectionContract?.paddingRight).not.toBe('0px')

    await page.goto(DIRECTORY_URL_AR)
    await page.evaluate((ids) => {
      sessionStorage.setItem('compareIds', JSON.stringify(ids))
    }, SEEDED_IDS)

    await page.goto(DIRECTORY_URL_AR)
    await expect(page.getByTestId('compare-tray')).toBeVisible()

    const trayOrder = await page.evaluate(() => {
      const tray = document.querySelector(
        '[data-testid="compare-tray"]',
      ) as HTMLElement | null
      const actions = tray?.querySelector(
        ':scope > div > div:last-child',
      ) as HTMLElement | null

      if (!tray || !actions || actions.children.length < 2) {
        return null
      }

      const firstAction = actions.children.item(0) as HTMLElement
      const secondAction = actions.children.item(1) as HTMLElement
      const firstRect = firstAction.getBoundingClientRect()
      const secondRect = secondAction.getBoundingClientRect()

      return {
        firstActionIsLeftOfSecondAction: firstRect.left < secondRect.left,
      }
    })

    expect(trayOrder).not.toBeNull()
    expect(trayOrder?.firstActionIsLeftOfSecondAction).toBe(true)
  })

  test('swedish and english route shells remain left-to-right after arabic rtl changes', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)

    const swedishDir = await page.locator('html').getAttribute('dir')
    expect(swedishDir).not.toBe('rtl')

    const svShell = await page.evaluate(() => {
      const title = document.querySelector(
        'nav a[href$="/sv/"]',
      ) as HTMLElement | null
      const controls = title?.parentElement
        ?.lastElementChild as HTMLElement | null

      if (!title || !controls) {
        return null
      }

      const titleRect = title.getBoundingClientRect()
      const controlsRect = controls.getBoundingClientRect()

      return {
        controlsAreFullyRightOfTitle: controlsRect.left > titleRect.right,
      }
    })

    expect(svShell).not.toBeNull()
    expect(svShell?.controlsAreFullyRightOfTitle).toBe(true)

    await page.goto(DIRECTORY_URL_EN)
    const englishDir = await page.locator('html').getAttribute('dir')
    expect(englishDir).not.toBe('rtl')
  })
})
