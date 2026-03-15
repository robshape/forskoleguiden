import { AxeBuilder } from '@axe-core/playwright'

import { expect, test } from './fixtures'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIRECTORY_URL = '/forskoleguiden/sv/'
const DETAIL_URL = '/forskoleguiden/sv/forskola/almgardens-forskola/'
const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'

// IDs used to seed the comparison page with a two-school selection
const COMPARISON_SEED_IDS = ['almgardens-forskola', 'augustenborgs-forskola']

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('accessibility: axe-core wcag2a + wcag2aa audits', () => {
  test('Swedish directory page has zero axe-core violations at wcag2a and wcag2aa', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)

    // Hydration guard: wait for a card-level CompareButton client:only island
    // to be present before running axe so the page's primary interactive
    // controls are included in the audit. The empty compare tray stays hidden
    // by design when no schools are selected, so there is no tray control to
    // wait for on the default directory state.
    await expect(
      page
        .getByTestId('preschool-card')
        .first()
        .getByRole('button', { name: /Jämför/ }),
    ).toHaveAttribute('aria-pressed', 'false')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('Swedish preschool detail page has zero axe-core violations at wcag2a and wcag2aa', async ({
    page,
  }) => {
    await page.goto(DETAIL_URL)

    // Hydration guard: wait for the CompareButton client:only island to be ready.
    // The button renders aria-pressed="false" (not selected) only after Preact
    // has hydrated — before hydration the element is absent from the DOM.
    await expect(page.getByRole('button', { name: /Jämför/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('Swedish comparison page with 2 seeded preschools has zero axe-core violations at wcag2a and wcag2aa', async ({
    page,
  }) => {
    // Seed sessionStorage with a 2-school selection before navigating so that
    // ComparisonView (client:only="preact") mounts with data rather than showing
    // the empty state.  We must visit a same-origin page first to set storage.
    await page.goto(DIRECTORY_URL)
    await page.evaluate((ids) => {
      sessionStorage.setItem('compareIds', JSON.stringify(ids))
    }, COMPARISON_SEED_IDS)

    await page.goto(COMPARISON_URL)

    // Hydration guard 1: the comparison summary table must be visible before the
    // charts can be audited — this signals ComparisonView has fully mounted.
    await expect(page.getByTestId('comparison-table')).toBeVisible()

    // Render confirmation: verify both Helhetsbedomning chart SVGs are present
    // before running axe so the comparison visuals are included in the scan.
    const q1Chart = page.getByRole('img', {
      name: 'Stapeldiagram för: Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola',
    })
    const q2Chart = page.getByRole('img', {
      name: 'Stapeldiagram för: Jag skulle rekommendera mitt barns förskola till en annan förälder',
    })
    await expect(q1Chart).toBeVisible()
    await expect(q2Chart).toBeVisible()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
})
