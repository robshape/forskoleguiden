import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { PreschoolIndex, PreschoolSurvey } from '../../src/lib/types'
import { expect, test } from './fixtures'

const index = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data/malmo/index.json'), 'utf-8'),
) as PreschoolIndex

/** Load a survey file and return the parsed JSON. */
const loadSurvey = (id: string): PreschoolSurvey =>
  JSON.parse(
    readFileSync(
      resolve(process.cwd(), 'data/malmo', String(index.year), `${id}.json`),
      'utf-8',
    ),
  ) as PreschoolSurvey

/** Find the first non-placeholder preschool that has a surveyPdfUrl. */
const findWithPdf = () =>
  index.preschools.find((p) => {
    const s = loadSurvey(p.id)
    return s.totalRespondentsPercent !== -1 && !!s.surveyPdfUrl
  })

test.describe('Survey PDF link on preschool detail page', () => {
  test('renders PDF link with correct attributes when surveyPdfUrl is present', async ({
    page,
  }) => {
    const match = findWithPdf()
    test.skip(!match, 'No preschool with surveyPdfUrl — skipped')

    await page.goto(`/forskoleguiden/sv/forskola/${match!.id}/`)

    const pdfLink = page.getByRole('link', {
      name: 'Visa enkätresultat (PDF)',
    })
    await expect(pdfLink).toBeVisible()
    await expect(pdfLink).toHaveAttribute('target', '_blank')
    await expect(pdfLink).toHaveAttribute('rel', 'noopener noreferrer')

    const href = await pdfLink.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).toMatch(/^https:\/\/forskoleenkatresultat\.malmo\.se\//)
    expect(href).toMatch(/\.pdf$/)
  })

  test('renders correct label in English locale', async ({ page }) => {
    const match = findWithPdf()
    test.skip(!match, 'No preschool with surveyPdfUrl — skipped')

    await page.goto(`/forskoleguiden/en/forskola/${match!.id}/`)

    await expect(
      page.getByRole('link', { name: 'View survey results (PDF)' }),
    ).toBeVisible()
  })

  test('renders correct label in Arabic locale', async ({ page }) => {
    const match = findWithPdf()
    test.skip(!match, 'No preschool with surveyPdfUrl — skipped')

    await page.goto(`/forskoleguiden/ar/forskola/${match!.id}/`)

    await expect(
      page.getByRole('link', { name: 'عرض نتائج الاستبيان (PDF)' }),
    ).toBeVisible()
  })

  test('does not render PDF link when surveyPdfUrl is absent', async ({
    page,
  }) => {
    const withoutPdf = index.preschools.find((p) => {
      const survey = loadSurvey(p.id)
      return survey.totalRespondentsPercent !== -1 && !survey.surveyPdfUrl
    })

    test.skip(
      !withoutPdf,
      'All rendered preschools currently have surveyPdfUrl — absence test skipped',
    )

    const url = `/forskoleguiden/sv/forskola/${withoutPdf!.id}/`
    await page.goto(url)

    await expect(
      page.getByRole('link', { name: 'Visa enkätresultat (PDF)' }),
    ).not.toBeAttached()
  })
})
