import {
  renderPatternContent,
  RESPONSE_SERIES,
  TILE_SIZE,
} from '@/lib/chart-patterns'
import type { SurveyResponse } from '@/lib/types'

interface DetailsBarChartProps {
  response: SurveyResponse
  categoryLabels: string[]
  chartIndex: number
  hideLegend?: boolean
}

const BAR_HEIGHT = 28

export default function DetailsBarChart({
  response,
  categoryLabels,
  chartIndex,
  hideLegend,
}: DetailsBarChartProps) {
  let xOffset = 0
  const segments = RESPONSE_SERIES.map(({ field }, catIdx) => {
    const percent = response[field] as number
    const segWidth = percent
    const segX = xOffset
    xOffset += segWidth
    return { catIdx, percent, segWidth, segX }
  })

  return (
    <div class="mt-4">
      {/*
        This scalable vector graphic uses percentage widths (viewBox 0 0 100 X)
        so it perfectly fills its container at any screen size.
      */}
      <svg
        aria-hidden="true"
        class="h-7 w-full overflow-hidden rounded-md drop-shadow-sm"
        preserveAspectRatio="none"
        viewBox={`0 0 100 ${BAR_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {RESPONSE_SERIES.map(({ pattern: pDef }, catIdx) => {
            const patternId = `detail-chart-${chartIndex}-cat-${catIdx}`
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
        {segments.map(({ catIdx, segWidth, segX }) =>
          segWidth > 0 ? (
            <rect
              fill={`url(#detail-chart-${chartIndex}-cat-${catIdx})`}
              height={BAR_HEIGHT}
              key={catIdx}
              width={segWidth}
              x={segX}
              y={0}
            />
          ) : null,
        )}
      </svg>

      {/* Legend Map */}
      {!hideLegend && (
        <div class="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {segments.map(({ catIdx, percent }) => {
            if (percent === 0) return null
            const patternId = `detail-chart-${chartIndex}-cat-${catIdx}`
            return (
              <div
                class="flex items-center gap-2 text-xs font-medium text-gray-600"
                key={catIdx}
              >
                <svg
                  aria-hidden="true"
                  class="size-3.5 rounded-sm drop-shadow-sm"
                  viewBox="0 0 14 14"
                >
                  <rect fill={`url(#${patternId})`} height="14" width="14" />
                </svg>
                <span>
                  {categoryLabels[catIdx]} ({percent}%)
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
