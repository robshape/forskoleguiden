import type { SurveyResponse } from '@/lib/types'

export type ResponseRow = {
  field: keyof SurveyResponse
  i18nKey: string
}

export const RESPONSE_ROWS: ResponseRow[] = [
  { field: 'completelyAgreePercent', i18nKey: 'responses.completelyAgree' },
  { field: 'partlyAgreePercent', i18nKey: 'responses.partlyAgree' },
  {
    field: 'neitherAgreeNorDisagreePercent',
    i18nKey: 'responses.neitherAgreeNorDisagree',
  },
  { field: 'partlyDisagreePercent', i18nKey: 'responses.partlyDisagree' },
  {
    field: 'completelyDisagreePercent',
    i18nKey: 'responses.completelyDisagree',
  },
]
