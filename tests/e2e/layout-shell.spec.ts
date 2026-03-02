import { expect, test, type Locator } from '@playwright/test'
import { MALMO_SOURCE_URL } from '../../src/lib/constants'

const getFocusOutlineContract = async (selector: Locator) =>
  selector.evaluate((element: Element) => {
    const computedStyle = window.getComputedStyle(element)

    return {
      outlineWidth: computedStyle.outlineWidth,
      outlineStyle: computedStyle.outlineStyle,
      outlineOffset: computedStyle.outlineOffset,
      outlineColor: computedStyle.outlineColor,
    }
  })

test('layout and navigation shell render required semantics on /sv/', async ({
  page,
}) => {
  const response = await page.goto('/sv/')

  if (response === null) {
    throw new Error('Expected non-null response from page.goto("/sv/")')
  }

  expect(response.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv')
  await expect(page.locator('header')).toHaveCount(1)
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.locator('footer')).toHaveCount(1)

  const nav = page.getByRole('navigation', { name: 'Huvudnavigering' })
  await expect(nav).toBeVisible()
  await expect(
    nav.getByRole('link', { name: 'Förskoleguiden' }),
  ).toHaveAttribute('href', '/sv/')

  const cityList = nav.getByRole('list')
  await expect(cityList).toBeVisible()
  await expect(cityList.getByRole('listitem')).toHaveCount(3)

  await expect(nav.getByText('Malmö')).toBeVisible()
  await expect(
    cityList.getByRole('button', { name: 'Stockholm' }),
  ).toBeDisabled()
  await expect(
    cityList.getByRole('button', { name: 'Göteborg' }),
  ).toBeDisabled()
  await expect(nav.getByText('2025')).toBeVisible()
  await expect(
    nav.getByText('Språk: SV | EN | AR (kommer snart)'),
  ).toBeVisible()

  const footer = page.locator('footer')
  await expect(footer).toContainText('Enkätdata kommer från Malmö stad.')

  const sourceLink = footer.getByRole('link', {
    name: 'Källa hos Malmö stad',
  })
  await expect(sourceLink).toHaveAttribute('href', MALMO_SOURCE_URL)
  await expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(sourceLink).toHaveAttribute('referrerpolicy', 'no-referrer')
})

test('keyboard navigation shows focus-visible outline on key shell links', async ({
  page,
}) => {
  const response = await page.goto('/sv/')

  if (response === null) {
    throw new Error('Expected non-null response from page.goto("/sv/")')
  }

  expect(response.status()).toBe(200)

  const siteTitleLink = page
    .getByRole('navigation', { name: 'Huvudnavigering' })
    .getByRole('link', { name: 'Förskoleguiden' })
  const footerSourceLink = page
    .locator('footer')
    .getByRole('link', { name: 'Källa hos Malmö stad' })

  await page.keyboard.press('Tab')
  await expect(siteTitleLink).toBeFocused()

  const siteTitleLinkFocusOutline = await getFocusOutlineContract(siteTitleLink)

  expect(siteTitleLinkFocusOutline.outlineWidth).toBe('2px')
  expect(siteTitleLinkFocusOutline.outlineStyle).not.toBe('none')
  expect(siteTitleLinkFocusOutline.outlineOffset).toBe('2px')
  // rgb(37, 99, 235) corresponds to --color-primary-600: #2563eb
  expect(siteTitleLinkFocusOutline.outlineColor).toBe('rgb(37, 99, 235)')

  let footerLinkFocused = false

  for (let pressCount = 0; pressCount < 20; pressCount++) {
    await page.keyboard.press('Tab')

    footerLinkFocused = await footerSourceLink.evaluate(
      (element) => element === document.activeElement,
    )

    if (footerLinkFocused) {
      break
    }
  }

  expect(footerLinkFocused).toBe(true)
  await expect(footerSourceLink).toBeFocused()

  const footerSourceLinkFocusOutline =
    await getFocusOutlineContract(footerSourceLink)

  expect(footerSourceLinkFocusOutline.outlineWidth).toBe('2px')
  expect(footerSourceLinkFocusOutline.outlineStyle).not.toBe('none')
  expect(footerSourceLinkFocusOutline.outlineOffset).toBe('2px')
  expect(footerSourceLinkFocusOutline.outlineColor).toBe('rgb(37, 99, 235)')
})
