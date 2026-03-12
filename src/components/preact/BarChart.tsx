import type { SurveyResponse } from '@/lib/types'
import {
  RESPONSE_SERIES,
  TILE_SIZE,
  renderPatternContent,
} from '@/lib/chart-patterns'

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
        role="img"
        aria-label={ariaLabel}
        aria-describedby={`chart-${chartIndex}-table`}
        viewBox={`0 0 ${BAR_TOTAL_WIDTH} ${svgHeight}`}
        width={BAR_TOTAL_WIDTH}
        height={svgHeight}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{ariaLabel}</title>
        <defs>
          {RESPONSE_SERIES.map(({ pattern: pDef }, catIdx) => {
            const patternId = `chart-${chartIndex}-cat-${catIdx}`
            return (
              <pattern
                key={patternId}
                id={patternId}
                x={0}
                y={0}
                width={TILE_SIZE}
                height={TILE_SIZE}
                patternUnits="userSpaceOnUse"
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

      {/* Legend: one swatch + label per response category */}
      <div
        data-testid="chart-legend"
        class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700"
      >
        {RESPONSE_SERIES.map(({ pattern: pDef }, catIdx) => {
          const legendPatternId = `legend-${chartIndex}-cat-${catIdx}`
          const swatchSize = 14
          return (
            <div key={catIdx} class="flex items-center gap-1">
              <svg
                data-testid="chart-legend-swatch"
                width={swatchSize}
                height={swatchSize}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id={legendPatternId}
                    x={0}
                    y={0}
                    width={TILE_SIZE}
                    height={TILE_SIZE}
                    patternUnits="userSpaceOnUse"
                  >
                    {renderPatternContent(pDef)}
                  </pattern>
                </defs>
                <rect
                  width={swatchSize}
                  height={swatchSize}
                  fill={`url(#${legendPatternId})`}
                />
              </svg>
              <span>{categoryLabels[catIdx] ?? ''}</span>
            </div>
          )
        })}
      </div>

      <table
        id={`chart-${chartIndex}-table`}
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
