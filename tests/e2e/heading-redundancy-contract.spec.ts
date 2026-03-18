import { expect, test } from './fixtures'

const DIRECTORY_URL = '/forskoleguiden/sv/'
const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'

test.describe('heading redundancy contracts', () => {
  test('directory exposes one accessible primary heading for the Malmö list', async ({
    page,
  }) => {
    const response = await page.goto(DIRECTORY_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${DIRECTORY_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    await expect(
      page.getByRole('heading', { name: /Förskolor i Malmö/ }),
    ).toHaveCount(1)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /Förskolor i Malmö \(\d+\)/,
    )
  })

  test('comparison route shows one accessible page title heading in selected-state flow', async ({
    page,
  }) => {
    await page.goto(DIRECTORY_URL)
    await page.evaluate(() => {
      sessionStorage.setItem(
        'compareIds',
        JSON.stringify(['almgardens-forskola']),
      )
    })

    const response = await page.goto(COMPARISON_URL)
    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${COMPARISON_URL}")`,
      )
    }

    expect(response.status()).toBe(200)

    await expect(
      page.getByRole('heading', { name: /Jämför förskolor/ }),
    ).toHaveCount(1)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Jämför förskolor',
    )
  })
})
