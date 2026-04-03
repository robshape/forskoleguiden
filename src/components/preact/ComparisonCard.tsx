import {
  renderPatternContent,
  RESPONSE_SERIES,
  TILE_SIZE,
} from '@/lib/chart-patterns'
import { interpolate } from '@/lib/interpolate'
import { SCORE_TIER_TEXT_CLASS } from '@/lib/score-tier-classes'
import {
  computeAgreeShare,
  getScoreTier,
  OVERALL_ASSESSMENT_GROUP,
} from '@/lib/scoring'
import { toggleCompare } from '@/lib/state'
import { RESPONSE_ROWS } from '@/lib/survey-responses'
import type { PreschoolSurvey, SurveyQuestion } from '@/lib/types'

interface Props {
  survey: PreschoolSurvey
  question: SurveyQuestion
  directoryHref: string
  isHighlighted: boolean
  isDimmed: boolean
  onToggleHighlight: () => void
  categoryLabels: string[]
  chartIndex: number
  noDataLabel: string
  removeFromCompareLabel: string
  agreeShareLabel: string
  responseRateLabel: string
}

export default function ComparisonCard({
  survey,
  question,
  directoryHref,
  isHighlighted,
  isDimmed,
  onToggleHighlight,
  categoryLabels,
  chartIndex,
  noDataLabel,
  removeFromCompareLabel,
  agreeShareLabel,
  responseRateLabel,
}: Props) {
  const group = survey.questionGroups.find(
    (g) => g.name === OVERALL_ASSESSMENT_GROUP,
  )
  const cell = group?.questions.find(
    (candidate) => candidate.text === question.text,
  )

  const opacityClass = isDimmed ? 'opacity-50 grayscale' : 'opacity-100'
  const highlightBgClass = isHighlighted
    ? 'bg-zinc-50 shadow-sm ring-1 ring-zinc-900/5 transition-colors duration-200'
    : 'hover:bg-zinc-50/50 transition-colors duration-200'

  const removeAriaLabel = interpolate(removeFromCompareLabel, {
    name: survey.preschoolName,
  })

  const preschoolInfo = (
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <button
        aria-label={removeAriaLabel}
        class="flex size-11 shrink-0 items-center justify-center rounded-full text-zinc-300 ring-offset-surface transition-all duration-200 hover:scale-110 hover:rotate-90 hover:bg-red-50 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
        onClick={(e) => {
          e.stopPropagation()
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
          }
          toggleCompare(survey.id)
        }}
        type="button"
      >
        <svg
          aria-hidden="true"
          class="size-5 transition-transform"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <div class="flex min-w-0 flex-col">
        <a
          class={`min-w-0 text-start text-base/snug wrap-break-word transition-colors duration-200 hover:underline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none ${isHighlighted ? 'font-semibold text-primary-900' : 'font-normal text-zinc-800 hover:text-primary-700'}`}
          href={`${directoryHref}forskola/${survey.id}/?from=compare`}
          onClick={(e) => e.stopPropagation()}
        >
          {survey.preschoolName}
        </a>
        <div class="mt-1 flex items-center">
          <div class="text-xs text-zinc-500">
            {responseRateLabel}:{' '}
            <span class="font-medium text-zinc-700">
              {survey.totalRespondentsPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )

  if (!cell) {
    return (
      <li
        class={`transition-opacity duration-300 ${opacityClass}`}
        key={survey.id}
      >
        <div
          class={`group -mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-4 transition-colors duration-200 sm:-mx-5 sm:w-[calc(100%+2.5rem)] sm:gap-6 sm:p-5 ${highlightBgClass}`}
          onClick={onToggleHighlight}
        >
          {preschoolInfo}
          <span
            aria-label={noDataLabel}
            class="shrink-0 text-base font-medium text-zinc-300"
          >
            —
          </span>
        </div>
      </li>
    )
  }

  const agreeShare = Math.round(computeAgreeShare(cell.response))
  const scoreColor = SCORE_TIER_TEXT_CLASS[getScoreTier(agreeShare)]

  return (
    <li
      class={`transition-opacity duration-300 ${opacityClass}`}
      key={survey.id}
    >
      <div
        class={`group relative -mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer flex-col rounded-xl px-3 py-4 transition-colors duration-200 sm:-mx-5 sm:w-[calc(100%+2.5rem)] sm:px-5 sm:py-4 ${highlightBgClass}`}
        onClick={onToggleHighlight}
      >
        <div class="flex items-center justify-between gap-4 sm:gap-6">
          {preschoolInfo}

          <div class="flex min-w-16 shrink-0 flex-col items-end justify-center text-end sm:min-w-18 rtl:items-start rtl:text-start">
            <div
              class={`text-xl leading-none font-semibold tracking-tight transition-colors duration-200 sm:text-2xl ${scoreColor}`}
            >
              {agreeShare}%
            </div>
            <div
              class={`mt-1 text-xs transition-colors duration-200 ${isHighlighted ? 'font-medium text-zinc-600' : 'font-normal text-zinc-500'}`}
            >
              {agreeShareLabel}
            </div>
          </div>
        </div>

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
                {RESPONSE_SERIES.slice(0, 2).map(
                  ({ pattern: pDef }, catIdx) => {
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
                  },
                )}
              </defs>
              <rect fill="#e5e7eb" height={20} width={100} x={0} y={0} />
              {cell.response.completelyAgreePercent > 0 && (
                <rect
                  fill={`url(#agree-chart-${chartIndex}-cat-0)`}
                  height={20}
                  width={cell.response.completelyAgreePercent}
                  x={0}
                  y={0}
                />
              )}
              {cell.response.partlyAgreePercent > 0 && (
                <rect
                  fill={`url(#agree-chart-${chartIndex}-cat-1)`}
                  height={20}
                  width={cell.response.partlyAgreePercent}
                  x={cell.response.completelyAgreePercent}
                  y={0}
                />
              )}
            </svg>
            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {RESPONSE_SERIES.slice(0, 2).map(
                ({ field, pattern: pDef }, catIdx) => {
                  const swatchId = `agree-swatch-${chartIndex}-cat-${catIdx}`
                  const percent = cell.response[field]
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
                        <rect
                          fill={`url(#${swatchId})`}
                          height="12"
                          width="12"
                        />
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
      </div>

      {/* Screen-reader fallback data */}
      <div class="sr-only">
        <table>
          <caption>
            {question.text} - {survey.preschoolName}
          </caption>
          <tbody>
            {RESPONSE_ROWS.map((row, rowIdx) => (
              <tr key={row.field}>
                <th scope="row">{categoryLabels[rowIdx]}</th>
                <td>{cell.response[row.field]}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </li>
  )
}
