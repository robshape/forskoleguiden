export type SurveyResponse = {
  completelyAgreePercent: number
  partlyAgreePercent: number
  neitherAgreeNorDisagreePercent: number
  partlyDisagreePercent: number
  completelyDisagreePercent: number
}

export type SurveyQuestion = {
  text: string
  response: SurveyResponse
}

export type QuestionGroup = {
  name: string
  questions: SurveyQuestion[]
}

export type PreschoolSurvey = {
  id: string
  preschoolName: string
  address: string
  surveyYear: number
  totalRespondentsPercent: number
  surveyPdfUrl?: string
  questionGroups: QuestionGroup[]
}

export type OperatorType = 'municipal' | 'independent'

export type PreschoolIndexEntry = {
  id: string
  name: string
  address: string
  operatorType: OperatorType
  queueUrl?: string
}

export type PreschoolIndex = {
  city: string
  year: number
  preschools: PreschoolIndexEntry[]
}

export type SearchablePreschool = {
  id: string
  name: string
  address: string
  operatorType: OperatorType
}
