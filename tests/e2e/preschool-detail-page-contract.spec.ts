import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { expect, test, type Locator } from '@playwright/test'

type PreschoolIndexEntry = {
  id: string
  name: string
  address: string
  operatorType: 'municipal' | 'independent'
}
type PreschoolIndex = {
  city: string
  year: number
  preschools: PreschoolIndexEntry[]
}

// Load the Malmö index at spec-file scope so all tests share the same data.
const index = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/malmo/index.json'), 'utf-8'),
) as PreschoolIndex

// Canonical test subject: Almgårdens förskola (municipal)
const TEST_ID = 'almgardens-forskola'
const TEST_URL = `/forskoleguiden/sv/forskola/${TEST_ID}/`

type ExpectedResponseRow = {
  label: string
  value: string
}

async function expectQuestionResponseRows(
  questionCard: Locator,
  expectedRows: ExpectedResponseRow[],
) {
  const rows = questionCard.locator(':scope > ul > li')

  await expect(rows).toHaveCount(expectedRows.length)

  for (const [index, expectedRow] of expectedRows.entries()) {
    const row = rows.nth(index)
    await expect(row).toContainText(expectedRow.label)
    await expect(row).toContainText(expectedRow.value)
  }
}

test.describe('Swedish preschool detail pages contract', () => {
  test('directory card links navigate to the correct detail page', async ({
    page,
  }) => {
    const response = await page.goto('/forskoleguiden/sv/')

    if (response === null) {
      throw new Error(
        'Expected non-null response from page.goto("/forskoleguiden/sv/")',
      )
    }

    expect(response.status(), 'Expected HTTP 200 for /forskoleguiden/sv/').toBe(
      200,
    )

    await page
      .getByTestId('preschool-card')
      .filter({
        has: page.getByRole('link', { name: 'Almgårdens förskola' }),
      })
      .getByRole('link', { name: 'Almgårdens förskola' })
      .click()

    await expect(page).toHaveURL(TEST_URL)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Almgårdens förskola',
    )
  })

  test('all preschool detail pages are generated and reachable', async ({
    page,
  }) => {
    for (const preschool of index.preschools) {
      const url = `/forskoleguiden/sv/forskola/${preschool.id}/`
      const response = await page.goto(url)

      if (response === null) {
        throw new Error(`Expected non-null response from page.goto("${url}")`)
      }

      expect(response.status(), `Expected HTTP 200 for ${url}`).toBe(200)
    }
  })

  test('detail page renders preschool name as h1', async ({ page }) => {
    const response = await page.goto(TEST_URL)

    if (response === null) {
      throw new Error(
        `Expected non-null response from page.goto("${TEST_URL}")`,
      )
    }

    expect(response.status(), `Expected HTTP 200 for ${TEST_URL}`).toBe(200)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Almgårdens förskola',
    )

    await expect(
      page.getByRole('navigation', { name: 'Tillbaka till förskolor' }),
    ).toBeVisible()
  })

  test('detail page renders address and operator type metadata', async ({
    page,
  }) => {
    await page.goto(TEST_URL)

    await expect(page.getByText('Agnesfridsvägen 105, Malmö')).toBeVisible()

    // operatorType "municipal" → "Kommunal" via sv.json i18n key directory.operatorType.municipal
    await expect(page.getByText('Kommunal')).toBeVisible()
  })

  test('detail page renders the survey year', async ({ page }) => {
    await page.goto(TEST_URL)

    // The survey year 2025 must be explicitly visible on the page
    await expect(page.getByText(/2025/)).toBeVisible()
  })

  test('detail page renders Helhetsbedömning section heading and question texts', async ({
    page,
  }) => {
    await page.goto(TEST_URL)

    await expect(
      page.getByText('Helhetsbedömning', { exact: false }),
    ).toBeVisible()

    // Question texts from almgardens-forskola.json
    await expect(
      page.getByText(
        'Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola',
        { exact: false },
      ),
    ).toBeVisible()

    await expect(
      page.getByText(
        'Jag skulle rekommendera mitt barns förskola till en annan förälder',
        { exact: false },
      ),
    ).toBeVisible()
  })

  test('detail page renders all five canonical Helhetsbedömning response labels', async ({
    page,
  }) => {
    await page.goto(TEST_URL)

    // All five Swedish response labels must be visible — sourced from sv.json responses.*
    // Each label renders once per question so .first() avoids strict-mode violations.
    await expect(page.getByText('Instämmer helt').first()).toBeVisible()
    await expect(page.getByText('Instämmer delvis').first()).toBeVisible()
    await expect(page.getByText('Varken eller').first()).toBeVisible()
    await expect(page.getByText('Instämmer inte delvis').first()).toBeVisible()
    await expect(page.getByText('Instämmer inte alls').first()).toBeVisible()
  })

  test('detail page renders exact response percentages per Helhetsbedömning question including zero values', async ({
    page,
  }) => {
    await page.goto(TEST_URL)

    const questionCards = page.locator(
      'section[aria-labelledby="helhetsbedomning-heading"] > ul > li',
    )

    // Question 1: Utifrån helheten sett är jag nöjd med kvaliteten i mitt barns förskola
    // Source (almgardens-forskola.json): completelyAgree=67, partlyAgree=28, neither=0, partlyDisagree=2, completelyDisagree=2
    const q1 = questionCards.filter({
      hasText: 'Utifrån helheten sett är jag nöjd',
    })
    await expectQuestionResponseRows(q1, [
      { label: 'Instämmer helt', value: '67%' },
      { label: 'Instämmer delvis', value: '28%' },
      { label: 'Varken eller', value: '0%' },
      { label: 'Instämmer inte delvis', value: '2%' },
      { label: 'Instämmer inte alls', value: '2%' },
    ])

    // Question 2: Jag skulle rekommendera mitt barns förskola till en annan förälder
    // Source (almgardens-forskola.json): completelyAgree=70, partlyAgree=23, neither=1, partlyDisagree=0, completelyDisagree=6
    const q2 = questionCards.filter({
      hasText: 'Jag skulle rekommendera',
    })
    await expectQuestionResponseRows(q2, [
      { label: 'Instämmer helt', value: '70%' },
      { label: 'Instämmer delvis', value: '23%' },
      { label: 'Varken eller', value: '1%' },
      { label: 'Instämmer inte delvis', value: '0%' },
      { label: 'Instämmer inte alls', value: '6%' },
    ])
  })

  test('detail page renders an interactive CompareButton for the preschool', async ({
    page,
  }) => {
    await page.goto(TEST_URL)

    const compareButton = page.getByRole('button', {
      name: /Almgårdens förskola/,
    })

    await expect(compareButton).toBeVisible()

    await expect(async () => {
      // Reset any prior state so each probe starts from aria-pressed="false".
      if ((await compareButton.getAttribute('aria-pressed')) === 'true') {
        await compareButton.click()
        await expect(compareButton).toHaveAttribute('aria-pressed', 'false')
      }

      await compareButton.click()
      await expect(compareButton).toHaveAttribute('aria-pressed', 'true')

      await compareButton.click()
      await expect(compareButton).toHaveAttribute('aria-pressed', 'false')
    }).toPass()
  })
})
