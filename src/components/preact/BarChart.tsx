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
// Each type encodes a unique SVG structure so categories remain distinguishable
// without color alone: solid, diagonal stripe, dots, horizontal lines, crosshatch.
type PatternDef =
  | { type: 'solid'; bg: string }
  | { type: 'diagonal'; bg: string; stripe: string }
  | { type: 'dots'; bg: string; dotColor: string }
  | { type: 'horizontal'; bg: string; lineColor: string }
  | { type: 'crosshatch'; bg: string; lineColor: string }

// Single source of truth: each entry binds a response field to its visual encoding.
// Positional alignment between field and pattern is enforced by this structure.
const RESPONSE_SERIES: { field: keyof SurveyResponse; pattern: PatternDef }[] =
  [
    {
      field: 'completelyAgreePercent',
      pattern: { type: 'solid', bg: '#1d4ed8' },
    },
    {
      field: 'partlyAgreePercent',
      pattern: { type: 'diagonal', bg: '#93c5fd', stripe: '#1d4ed8' },
    },
    {
      field: 'neitherAgreeNorDisagreePercent',
      pattern: { type: 'dots', bg: '#e5e7eb', dotColor: '#374151' },
    },
    {
      field: 'partlyDisagreePercent',
      pattern: { type: 'horizontal', bg: '#fed7aa', lineColor: '#c2410c' },
    },
    {
      field: 'completelyDisagreePercent',
      pattern: { type: 'crosshatch', bg: '#fca5a5', lineColor: '#991b1b' },
    },
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
          {RESPONSE_SERIES.map(({ pattern: pDef }, catIdx) => {
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
                {pDef.type === 'diagonal' && (
                  <path
                    d={`M 0 ${tileSize} L ${tileSize} 0`}
                    stroke={pDef.stripe}
                    strokeWidth={1.5}
                    fill="none"
                  />
                )}
                {pDef.type === 'dots' && (
                  <circle
                    cx={tileSize / 2}
                    cy={tileSize / 2}
                    r={1.5}
                    fill={pDef.dotColor}
                  />
                )}
                {pDef.type === 'horizontal' && (
                  <line
                    x1={0}
                    y1={tileSize / 2}
                    x2={tileSize}
                    y2={tileSize / 2}
                    stroke={pDef.lineColor}
                    strokeWidth={1.5}
                  />
                )}
                {pDef.type === 'crosshatch' && (
                  <>
                    <path
                      d={`M 0 ${tileSize} L ${tileSize} 0`}
                      stroke={pDef.lineColor}
                      strokeWidth={1.5}
                      fill="none"
                    />
                    <path
                      d={`M 0 0 L ${tileSize} ${tileSize}`}
                      stroke={pDef.lineColor}
                      strokeWidth={1.5}
                      fill="none"
                    />
                  </>
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
          const segments = RESPONSE_SERIES.map(({ field }, catIdx) => {
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
                  {Math.round(
                    response[RESPONSE_SERIES[catIdx].field] as number,
                  )}
                  %
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
