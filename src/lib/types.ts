export type SurveyResponse = {
  completelyAgreePercentage: number
  partlyAgreePercentage: number
  neitherAgreeNorDisagreePercentage: number
  partlyDisagreePercentage: number
  completelyDisagreePercentage: number
}

export type SurveyQuestion = {
  text: string
  totalRespondents: number
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
  questionGroups: QuestionGroup[]
}

export type OperatorType = 'municipal' | 'independent'

export type PreschoolIndexEntry = {
  id: string
  name: string
  address: string
  operatorType: OperatorType
}

export type PreschoolIndex = {
  city: string
  year: number
  preschools: PreschoolIndexEntry[]
}
