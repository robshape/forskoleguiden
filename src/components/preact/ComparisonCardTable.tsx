import { RESPONSE_ROWS } from '@/lib/survey-responses'
import type { SurveyResponse } from '@/lib/types'

interface Props {
  questionText: string
  preschoolName: string
  response: SurveyResponse
  categoryLabels: string[]
}

export default function ComparisonCardTable({
  questionText,
  preschoolName,
  response,
  categoryLabels,
}: Props) {
  return (
    <div class="sr-only">
      <table>
        <caption>
          {questionText} - {preschoolName}
        </caption>
        <thead>
          <tr>
            <th class="sr-only" scope="col">
              {questionText}
            </th>
            <th class="sr-only" scope="col">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {RESPONSE_ROWS.map((row, rowIdx) => (
            <tr key={row.field}>
              <th scope="row">{categoryLabels[rowIdx]}</th>
              <td>{response[row.field]}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
