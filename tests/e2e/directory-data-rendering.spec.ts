import { expect, test } from '@playwright/test'

test('renders known preschool name Almgårdens förskola on /sv/', async ({
  page,
}) => {
  const response = await page.goto('/forskoleguiden/sv/')
  if (response === null) {
    throw new Error(
      'Expected non-null response from page.goto("/forskoleguiden/sv/")',
    )
  }

  expect(response.status(), 'Expected HTTP 200 from /sv/').toBe(200)
  await expect(page.getByText('Almgårdens förskola')).toBeVisible()
})
