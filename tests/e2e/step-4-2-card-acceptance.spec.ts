import { expect, test } from '@playwright/test'

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
    const hasNoScoreFallback =
      (await card.locator('.sr-only').filter({ hasText: /.+/ }).count()) > 0

    expect(hasPercentScore || hasNoScoreFallback).toBe(true)
  }
})
