import {
  renderPatternContent,
  RESPONSE_SERIES,
  TILE_SIZE,
} from '@/lib/chart-patterns'
import type { SurveyResponse } from '@/lib/types'

interface Props {
  response: SurveyResponse
  chartIndex: number
  categoryLabels: string[]
}

export default function ComparisonBreakdownBar({
  response,
  chartIndex,
  categoryLabels,
}: Props) {
  return (
    <div aria-hidden="true">
      <div class="mt-3">
        <svg
          aria-hidden="true"
          class="h-4 w-full overflow-hidden rounded-sm"
          preserveAspectRatio="none"
          viewBox="0 0 100 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {RESPONSE_SERIES.slice(0, 2).map(({ pattern: pDef }, catIdx) => {
              const patternId = `agree-chart-${chartIndex}-cat-${catIdx}`
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
          <rect fill="#e5e7eb" height={20} width={100} x={0} y={0} />
          {response.completelyAgreePercent > 0 && (
            <rect
              fill={`url(#agree-chart-${chartIndex}-cat-0)`}
              height={20}
              width={response.completelyAgreePercent}
              x={0}
              y={0}
            />
          )}
          {response.partlyAgreePercent > 0 && (
            <rect
              fill={`url(#agree-chart-${chartIndex}-cat-1)`}
              height={20}
              width={response.partlyAgreePercent}
              x={response.completelyAgreePercent}
              y={0}
            />
          )}
        </svg>
        <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {RESPONSE_SERIES.slice(0, 2).map(
            ({ field, pattern: pDef }, catIdx) => {
              const swatchId = `agree-swatch-${chartIndex}-cat-${catIdx}`
              const percent = response[field]
              return (
                <div
                  class="flex items-center gap-1.5 text-xs text-zinc-500"
                  key={catIdx}
                >
                  <svg
                    aria-hidden="true"
                    class="size-3 rounded-sm"
                    viewBox="0 0 12 12"
                  >
                    <defs>
                      <pattern
                        height={TILE_SIZE}
                        id={swatchId}
                        patternUnits="userSpaceOnUse"
                        width={TILE_SIZE}
                      >
                        {renderPatternContent(pDef)}
                      </pattern>
                    </defs>
                    <rect fill={`url(#${swatchId})`} height="12" width="12" />
                  </svg>
                  <span>
                    {categoryLabels[catIdx]} ({percent}%)
                  </span>
                </div>
              )
            },
          )}
        </div>
      </div>
    </div>
  )
}
