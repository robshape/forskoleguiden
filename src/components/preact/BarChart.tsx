import type { SurveyResponse } from '@/lib/types'

interface BarChartProps {
  responses: SurveyResponse[]
  preschoolNames: string[]
  questionText: string
  /** 5 localized labels in RESPONSE_ROWS order (completelyAgree … completelyDisagree) */
  categoryLabels: string[]
  /** Template string: "{question}" is replaced with questionText */
  ariaLabelTemplate: string
  /** Deterministic index for unique SVG pattern IDs across multiple charts on the page */
  chartIndex: number
}

const BAR_TOTAL_WIDTH = 300
const BAR_HEIGHT = 24
const LABEL_ROW_HEIGHT = 14
const ROW_HEIGHT = LABEL_ROW_HEIGHT + BAR_HEIGHT + 10

// 5 visually-distinct, color-blind-accessible pattern definitions.
// Each pattern pairs a background fill with an optional diagonal stripe.
type PatternDef = { bg: string; stripe: string | null }
const PATTERN_DEFS: PatternDef[] = [
  { bg: '#1d4ed8', stripe: null }, // completely agree: solid dark blue
  { bg: '#93c5fd', stripe: '#1d4ed8' }, // partly agree: light blue + diagonal
  { bg: '#d1d5db', stripe: null }, // neither: solid gray
  { bg: '#fca5a5', stripe: '#c2410c' }, // partly disagree: light red + diagonal
  { bg: '#dc2626', stripe: null }, // completely disagree: solid dark red
]

const RESPONSE_FIELDS: (keyof SurveyResponse)[] = [
  'completelyAgreePercent',
  'partlyAgreePercent',
  'neitherAgreeNorDisagreePercent',
  'partlyDisagreePercent',
  'completelyDisagreePercent',
]

export default function BarChart({
  responses,
  preschoolNames,
  questionText,
  categoryLabels,
  ariaLabelTemplate,
  chartIndex,
}: BarChartProps) {
  const ariaLabel = ariaLabelTemplate.replace('{question}', questionText)
  const svgHeight = responses.length * ROW_HEIGHT

  return (
    <div>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${BAR_TOTAL_WIDTH} ${svgHeight}`}
        width={BAR_TOTAL_WIDTH}
        height={svgHeight}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{ariaLabel}</title>
        <defs>
          {PATTERN_DEFS.map((pDef, catIdx) => {
            const patternId = `chart-${chartIndex}-cat-${catIdx}`
            const tileSize = 8
            return (
              <pattern
                key={patternId}
                id={patternId}
                x={0}
                y={0}
                width={tileSize}
                height={tileSize}
                patternUnits="userSpaceOnUse"
              >
                <rect width={tileSize} height={tileSize} fill={pDef.bg} />
                {pDef.stripe !== null && (
                  <path
                    d={`M 0 ${tileSize} L ${tileSize} 0`}
                    stroke={pDef.stripe}
                    strokeWidth={1.5}
                    fill="none"
                  />
                )}
              </pattern>
            )
          })}
        </defs>

        {responses.map((response, rowIdx) => {
          const preschoolName = preschoolNames[rowIdx] ?? ''
          const agreeShare = Math.round(
            response.completelyAgreePercent + response.partlyAgreePercent,
          )
          const y = rowIdx * ROW_HEIGHT
          const barY = y + LABEL_ROW_HEIGHT

          let xOffset = 0
          const segments = RESPONSE_FIELDS.map((field, catIdx) => {
            const percent = response[field] as number
            const segWidth = (percent / 100) * BAR_TOTAL_WIDTH
            const segX = xOffset
            xOffset += segWidth
            return { catIdx, percent, segWidth, segX }
          })

          return (
            <g key={preschoolName}>
              <title>
                {preschoolName} – {agreeShare}%
              </title>
              <text x={0} y={y + 11} fontSize={11} fill="#374151">
                {preschoolName}
              </text>
              {segments.map(({ catIdx, percent, segWidth, segX }) => (
                <g key={catIdx}>
                  <title>
                    {categoryLabels[catIdx] ?? ''}: {preschoolName} – {percent}%
                  </title>
                  <rect
                    x={segX}
                    y={barY}
                    width={segWidth}
                    height={BAR_HEIGHT}
                    fill={`url(#chart-${chartIndex}-cat-${catIdx})`}
                  />
                </g>
              ))}
            </g>
          )
        })}
      </svg>

      <table
        data-testid="chart-data-table"
        aria-label={questionText}
        class="mt-2 w-full border-collapse text-xs text-gray-700"
      >
        <caption class="sr-only">{questionText}</caption>
        <thead>
          <tr>
            <td class="py-1 pr-3" />
            {preschoolNames.map((name) => (
              <th
                key={name}
                scope="col"
                class="py-1 px-2 text-left font-semibold text-gray-800"
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categoryLabels.map((label, catIdx) => (
            <tr
              key={catIdx}
              class={catIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <th
                scope="row"
                class="py-1 pr-3 text-left font-normal text-gray-600 w-36"
              >
                {label}
              </th>
              {responses.map((response, rowIdx) => (
                <td key={rowIdx} class="py-1 px-2 text-gray-900">
                  {Math.round(response[RESPONSE_FIELDS[catIdx]] as number)}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
