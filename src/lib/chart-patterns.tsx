import { RESPONSE_ROWS } from '@/lib/survey-responses'
import type { SurveyResponse } from '@/lib/types'

export const TILE_SIZE = 8

// 5 visually-distinct, color-blind-accessible pattern definitions.
// Each type encodes a unique SVG structure so categories remain distinguishable
// without color alone: solid, diagonal stripe, dots, horizontal lines, crosshatch.
export type PatternDef =
  | { type: 'solid'; bg: string }
  | { type: 'diagonal'; bg: string; stripe: string }
  | { type: 'dots'; bg: string; dotColor: string }
  | { type: 'horizontal'; bg: string; lineColor: string }
  | { type: 'crosshatch'; bg: string; lineColor: string }

// Pattern definitions in RESPONSE_ROWS order (completelyAgree … completelyDisagree).
const PATTERN_DEFS: PatternDef[] = [
  { type: 'solid', bg: '#1d4ed8' },
  { type: 'diagonal', bg: '#93c5fd', stripe: '#1d4ed8' },
  { type: 'dots', bg: '#e5e7eb', dotColor: '#374151' },
  { type: 'horizontal', bg: '#fed7aa', lineColor: '#c2410c' },
  { type: 'crosshatch', bg: '#fca5a5', lineColor: '#991b1b' },
]

// Single source of truth: derives field ordering from RESPONSE_ROWS and attaches
// visual pattern metadata. This eliminates the parallel-array coupling between
// RESPONSE_ROWS (field + i18n) and chart pattern definitions.
export const RESPONSE_SERIES: {
  field: keyof SurveyResponse
  pattern: PatternDef
}[] = RESPONSE_ROWS.map((row, i) => ({
  field: row.field,
  pattern: PATTERN_DEFS[i],
}))

// Shared helper: renders the interior of one SVG <pattern> tile.
// Used by both the main chart <defs> and the legend swatch <defs> so the two
// can never drift out of structural sync.
export const renderPatternContent = (pDef: PatternDef) => {
  return (
    <>
      <rect fill={pDef.bg} height={TILE_SIZE} width={TILE_SIZE} />
      {pDef.type === 'diagonal' && (
        <path
          d={`M 0 ${TILE_SIZE} L ${TILE_SIZE} 0`}
          fill="none"
          stroke={pDef.stripe}
          strokeWidth={1.5}
        />
      )}
      {pDef.type === 'dots' && (
        <circle
          cx={TILE_SIZE / 2}
          cy={TILE_SIZE / 2}
          fill={pDef.dotColor}
          r={1.5}
        />
      )}
      {pDef.type === 'horizontal' && (
        <line
          stroke={pDef.lineColor}
          strokeWidth={1.5}
          x1={0}
          x2={TILE_SIZE}
          y1={TILE_SIZE / 2}
          y2={TILE_SIZE / 2}
        />
      )}
      {pDef.type === 'crosshatch' && (
        <>
          <path
            d={`M 0 ${TILE_SIZE} L ${TILE_SIZE} 0`}
            fill="none"
            stroke={pDef.lineColor}
            strokeWidth={1.5}
          />
          <path
            d={`M 0 0 L ${TILE_SIZE} ${TILE_SIZE}`}
            fill="none"
            stroke={pDef.lineColor}
            strokeWidth={1.5}
          />
        </>
      )}
    </>
  )
}
