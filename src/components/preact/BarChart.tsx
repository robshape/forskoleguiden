import {
  renderPatternContent,
  RESPONSE_SERIES,
  TILE_SIZE,
} from '@/lib/chart-patterns'
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
        aria-describedby={`chart-${chartIndex}-table`}
        aria-label={ariaLabel}
        height={svgHeight}
        role="img"
        viewBox={`0 0 ${BAR_TOTAL_WIDTH} ${svgHeight}`}
        width={BAR_TOTAL_WIDTH}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{ariaLabel}</title>
        <defs>
          {RESPONSE_SERIES.map(({ pattern: pDef }, catIdx) => {
            const patternId = `chart-${chartIndex}-cat-${catIdx}`
            return (
              <pattern
                height={TILE_SIZE}
                id={patternId}
                key={patternId}
                patternUnits="userSpaceOnUse"
                width={TILE_SIZE}
                x={0}
                y={0}
              >
                {renderPatternContent(pDef)}
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
              <text fill="#374151" fontSize={11} x={0} y={y + 11}>
                {preschoolName}
              </text>
              {segments.map(({ catIdx, percent, segWidth, segX }) => (
                <g key={catIdx}>
                  <title>
                    {categoryLabels[catIdx] ?? ''}: {preschoolName} – {percent}%
                  </title>
                  <rect
                    fill={`url(#chart-${chartIndex}-cat-${catIdx})`}
                    height={BAR_HEIGHT}
                    width={segWidth}
                    x={segX}
                    y={barY}
                  />
                </g>
              ))}
            </g>
          )
        })}
      </svg>

      {/* Legend: one swatch + label per response category */}
      <div
        class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700"
        data-testid="chart-legend"
      >
        {RESPONSE_SERIES.map(({ pattern: pDef }, catIdx) => {
          const legendPatternId = `legend-${chartIndex}-cat-${catIdx}`
          const swatchSize = 14
          return (
            <div class="flex items-center gap-1" key={catIdx}>
              <svg
                aria-hidden="true"
                data-testid="chart-legend-swatch"
                height={swatchSize}
                width={swatchSize}
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    height={TILE_SIZE}
                    id={legendPatternId}
                    patternUnits="userSpaceOnUse"
                    width={TILE_SIZE}
                    x={0}
                    y={0}
                  >
                    {renderPatternContent(pDef)}
                  </pattern>
                </defs>
                <rect
                  fill={`url(#${legendPatternId})`}
                  height={swatchSize}
                  width={swatchSize}
                />
              </svg>
              <span>{categoryLabels[catIdx] ?? ''}</span>
            </div>
          )
        })}
      </div>

      <table
        aria-label={questionText}
        class="mt-2 w-full border-collapse text-xs text-gray-700"
        data-testid="chart-data-table"
        id={`chart-${chartIndex}-table`}
      >
        <caption class="sr-only">{questionText}</caption>
        <thead>
          <tr>
            <td class="py-1 pr-3" />
            {preschoolNames.map((name) => (
              <th
                class="px-2 py-1 text-left font-semibold text-gray-800"
                key={name}
                scope="col"
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categoryLabels.map((label, catIdx) => (
            <tr
              class={catIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              key={catIdx}
            >
              <th
                class="w-36 py-1 pr-3 text-left font-normal text-gray-600"
                scope="row"
              >
                {label}
              </th>
              {responses.map((response, rowIdx) => (
                <td class="px-2 py-1 text-gray-900" key={rowIdx}>
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
