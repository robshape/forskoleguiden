import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Page } from '@playwright/test'

import { expect } from './fixtures'

// ---------------------------------------------------------------------------
// Theme constants — derived from global.css @theme tokens.
// ---------------------------------------------------------------------------

export const FOCUS_RING_COLOR = 'rgb(37, 99, 235)'

// ---------------------------------------------------------------------------
// URL constants — base path matches the Astro "base" config for GitHub Pages.
// ---------------------------------------------------------------------------

export const DIRECTORY_URL = '/forskoleguiden/sv/'
export const COMPARISON_URL = '/forskoleguiden/sv/jamfor/'
export const DETAIL_URL = '/forskoleguiden/sv/forskola/almgardens-forskola/'
export const ABOUT_URL = '/forskoleguiden/sv/om/'

// ---------------------------------------------------------------------------
// Placeholder survey detection — mirrors isPlaceholderSurvey() from
// src/lib/data.ts without importing through vitest aliases.
// ---------------------------------------------------------------------------

const PLACEHOLDER_RESPONDENTS = -1

/** Returns true when a survey JSON file uses -1 as totalRespondentsPercent. */
export const isPlaceholderSurveyFile = (
  preschoolId: string,
  year: number,
): boolean => {
  const surveyPath = resolve(
    process.cwd(),
    'data/malmo',
    String(year),
    `${preschoolId}.json`,
  )
  const survey = JSON.parse(readFileSync(surveyPath, 'utf-8')) as {
    totalRespondentsPercent: number
  }
  return survey.totalRespondentsPercent === PLACEHOLDER_RESPONDENTS
}

// ---------------------------------------------------------------------------
// Preschool card locators
// ---------------------------------------------------------------------------

export const getDirectoryCard = (page: Page, name: string) =>
  page
    .getByTestId('preschool-card')
    .filter({ has: page.getByRole('link', { name }) })

export const getCompareButton = (page: Page, name: string) =>
  getDirectoryCard(page, name).getByRole('button')

// ---------------------------------------------------------------------------
// Compare button hydration guards
// ---------------------------------------------------------------------------

export const waitForCompareButtonReady = async (page: Page, name: string) => {
  const button = getCompareButton(page, name)
  await expect(button).toHaveAttribute('aria-pressed', 'false')
}

export const waitForCompareButtonSelected = async (
  page: Page,
  name: string,
) => {
  await expect(getCompareButton(page, name)).toHaveAttribute(
    'aria-pressed',
    'true',
  )
}
