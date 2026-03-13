import { expect, test } from './fixtures'

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

test('given /sv/ directory when rendered then each preschool card shows required fields and detail link', async ({
  page,
}) => {
  const response = await page.goto('/forskoleguiden/sv/')
  if (response === null) {
    throw new Error(
      'Expected non-null response from page.goto("/forskoleguiden/sv/")',
    )
  }

  expect(response.status()).toBe(200)

  const cards = page.getByTestId('preschool-card')
  const cardCount = await cards.count()

  expect(cardCount).toBeGreaterThanOrEqual(5)

  for (let cardIndex = 0; cardIndex < cardCount; cardIndex++) {
    const card = cards.nth(cardIndex)
    const detailLink = card.getByRole('link').first()
    const preschoolName = (await detailLink.textContent())?.trim()

    expect(preschoolName).toBeTruthy()
    await expect(detailLink).toHaveAttribute('href', /\/sv\/forskola\/[^/]+\//)
    await expect(card.locator('p').first()).not.toBeEmpty()
    await expect(card.getByText(/Kommunal|Fristående/)).toBeVisible()
    await expect(
      card.getByRole('button', {
        name: new RegExp(`:\\s*${escapeRegExp(preschoolName ?? '')}$`),
      }),
    ).toBeVisible()

    const hasPercentScore =
      (await card.getByText(/\d+(?:[.,]\d+)?\s*%/).count()) > 0
    const hasScoreFallback =
      (await card.getByTestId('score-fallback').count()) > 0

    if (hasPercentScore) {
      expect(hasScoreFallback).toBe(false)
      continue
    }

    expect(hasScoreFallback).toBe(true)
  }
})
