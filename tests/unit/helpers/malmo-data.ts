import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { PreschoolIndex } from '@/lib/types'

export const getMalmoIndex = () => {
  const indexFilePath = resolve(process.cwd(), 'data/malmo/index.json')
  const raw = readFileSync(indexFilePath, 'utf-8')

  return JSON.parse(raw) as PreschoolIndex
}

export const getMalmoSurveyFilePath = (id: string, year: number) =>
  resolve(process.cwd(), `data/malmo/${year}/${id}.json`)
