import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { MALMO_DATA_DIR, PLACEHOLDER_RESPONDENTS } from '@/lib/constants'
import type { PreschoolIndex, PreschoolSurvey } from '@/lib/types'

/** Preschools with totalRespondentsPercent of -1 have no survey data yet. */
export const isPlaceholderSurvey = (survey: PreschoolSurvey) =>
  survey.totalRespondentsPercent === PLACEHOLDER_RESPONDENTS

const MALMO_DATA_DIR_RESOLVED = resolve(process.cwd(), MALMO_DATA_DIR)
const MALMO_INDEX_PATH = resolve(MALMO_DATA_DIR_RESOLVED, 'index.json')

const getErrorMessage = (error: unknown) => {
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

const getSurveyPath = (id: string, year: number) =>
  resolve(MALMO_DATA_DIR_RESOLVED, String(year), `${id}.json`)

export const getPreschoolIndex = () =>
  readJsonFile<PreschoolIndex>(
    MALMO_INDEX_PATH,
    'Failed to load Malmö preschool index',
  )

export const getPreschoolSurveyByYear = (id: string, year: number) => {
  const surveyPath = getSurveyPath(id, year)

  return readJsonFile<PreschoolSurvey>(
    surveyPath,
    `Failed to load Malmö preschool survey for id "${id}"`,
  )
}

export const getAllPreschoolSurveys = () => {
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
