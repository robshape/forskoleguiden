import { MALMO_SOURCE_URL } from '../../src/lib/constants'
import { expect, getFocusOutlineContract, test } from './fixtures'

test('layout and navigation shell render required semantics on /sv/', async ({
  page,
}) => {
  const response = await page.goto('/forskoleguiden/sv/')

  if (response === null) {
    throw new Error(
      'Expected non-null response from page.goto("/forskoleguiden/sv/")',
    )
  }

  expect(response.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sv')
  await expect(page.locator('header')).toHaveCount(1)
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.locator('footer')).toHaveCount(1)

  // Head meta: viewport with viewport-fit=cover and favicon
  const viewportMeta = page.locator('meta[name="viewport"]')
  await expect(viewportMeta).toHaveAttribute('content', /viewport-fit=cover/)
  await expect(
    page.locator('link[rel="icon"][href="/forskoleguiden/favicon.svg"]'),
  ).toHaveCount(1)

  // Nav: brand link + compact language pill
  const nav = page.getByRole('navigation', { name: 'Huvudnavigering' })
  await expect(nav).toBeVisible()
  await expect(
    nav.getByRole('link', { name: 'Förskoleguiden' }),
  ).toHaveAttribute('href', '/forskoleguiden/sv/')
  await expect(nav.getByText('SV | EN')).toBeVisible()

  // Nav must not contain city picker or survey year (those belong in main)
  await expect(nav).not.toContainText('Malmö')
  await expect(nav).not.toContainText('2025')

  // City selector lives in main content, not in nav
  const main = page.locator('main')
  const citySection = main.getByRole('region', {
    name: 'Stad',
  })
  await expect(citySection).toBeVisible()
  await expect(citySection.getByText('Stad')).toBeVisible()

  const cityList = citySection.getByRole('list')
  await expect(cityList).toBeVisible()
  await expect(cityList.getByRole('listitem')).toHaveCount(3)

  await expect(citySection.getByText('Malmö')).toBeVisible()
  await expect(
    cityList.getByRole('button', { name: 'Stockholm' }),
  ).toBeDisabled()
  await expect(
    cityList.getByRole('button', { name: 'Göteborg' }),
  ).toBeDisabled()

  // Survey year removed from here in recent feature
  // Attribution lives in <footer> landmark, outside <main>
  const footer = page.locator('footer')
  const sourceLink = footer.getByRole('link', {
    name: 'Enkätdata (2025) kommer från Malmö stad.',
  })
  await expect(sourceLink).toHaveAttribute('href', MALMO_SOURCE_URL)
  await expect(sourceLink).toHaveAttribute('target', '_blank')
  await expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(sourceLink).toHaveAttribute('referrerpolicy', 'no-referrer')
})

test('keyboard navigation shows focus-visible outline on key shell links', async ({
  page,
}) => {
  const response = await page.goto('/forskoleguiden/sv/')

  if (response === null) {
    throw new Error(
      'Expected non-null response from page.goto("/forskoleguiden/sv/")',
    )
  }

  expect(response.status()).toBe(200)

  const siteTitleLink = page
    .getByRole('navigation', { name: 'Huvudnavigering' })
    .getByRole('link', { name: 'Förskoleguiden' })
  const attributionSourceLink = page
    .locator('footer')
    .getByRole('link', { name: 'Enkätdata (2025) kommer från Malmö stad.' })

  await page.keyboard.press('Tab')
  await expect(siteTitleLink).toBeFocused()

  const siteTitleLinkFocusOutline = await getFocusOutlineContract(siteTitleLink)

  expect(siteTitleLinkFocusOutline.outlineWidth).toBe('2px')
  expect(siteTitleLinkFocusOutline.outlineStyle).not.toBe('none')
  expect(siteTitleLinkFocusOutline.outlineOffset).toBe('2px')
  // rgb(37, 99, 235) corresponds to --color-primary-600: #2563eb
  expect(siteTitleLinkFocusOutline.outlineColor).toBe('rgb(37, 99, 235)')

  let attributionLinkFocused = false

  for (let pressCount = 0; pressCount < 20; pressCount++) {
    await page.keyboard.press('Tab')

    attributionLinkFocused = await attributionSourceLink.evaluate(
      (element) => element === document.activeElement,
    )

    if (attributionLinkFocused) {
      break
    }
  }

  expect(attributionLinkFocused).toBe(true)
  await expect(attributionSourceLink).toBeFocused()

  const attributionSourceLinkFocusOutline = await getFocusOutlineContract(
    attributionSourceLink,
  )

  expect(attributionSourceLinkFocusOutline.outlineWidth).toBe('2px')
  expect(attributionSourceLinkFocusOutline.outlineStyle).not.toBe('none')
  expect(attributionSourceLinkFocusOutline.outlineOffset).toBe('2px')
  expect(attributionSourceLinkFocusOutline.outlineColor).toBe(
    'rgb(37, 99, 235)',
  )
})
