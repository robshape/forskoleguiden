import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { PreschoolIndex, PreschoolSurvey } from '@/lib/types'

// Assumes process.cwd() is the project root — valid for Astro build and Vitest.
const MALMO_DATA_DIR = resolve(process.cwd(), 'data/malmo')
const MALMO_INDEX_PATH = resolve(MALMO_DATA_DIR, 'index.json')

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

const readJsonFile = <T>(filePath: string, context: string): T => {
  let raw: string

  try {
    raw = readFileSync(filePath, 'utf-8')
  } catch (error) {
    throw new Error(
      `${context}. Could not read file at ${filePath}. ${getErrorMessage(error)}`,
    )
  }

  try {
    // Data files are trusted static repository inputs; runtime schema validation is intentionally deferred per docs/tech-stack.md.
    return JSON.parse(raw) as T
  } catch (error) {
    throw new Error(
      `${context}. Invalid JSON in file at ${filePath}. ${getErrorMessage(error)}`,
    )
  }
}

const getSurveyPath = (id: string, year: number): string =>
  resolve(MALMO_DATA_DIR, String(year), `${id}.json`)

export const getPreschoolIndex = (): PreschoolIndex =>
  readJsonFile<PreschoolIndex>(
    MALMO_INDEX_PATH,
    'Failed to load Malmö preschool index',
  )

export const getPreschoolSurvey = (id: string): PreschoolSurvey => {
  const index = getPreschoolIndex()
  const surveyPath = getSurveyPath(id, index.year)

  return readJsonFile<PreschoolSurvey>(
    surveyPath,
    `Failed to load Malmö preschool survey for id "${id}"`,
  )
}

export const getAllPreschoolSurveys = (): PreschoolSurvey[] => {
  const index = getPreschoolIndex()
  const surveyYear = index.year

  return index.preschools.map((preschool) => {
    const surveyPath = getSurveyPath(preschool.id, surveyYear)

    return readJsonFile<PreschoolSurvey>(
      surveyPath,
      `Failed to load Malmö preschool survey for id "${preschool.id}"`,
    )
  })
}
