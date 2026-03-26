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
  noDataLabel: string
  removeFromCompareLabel: string
  agreeShareLabel: string
}

export default function ComparisonCard({
  survey,
  question,
  directoryHref,
  isHighlighted,
  isDimmed,
  onToggleHighlight,
  categoryLabels,
  noDataLabel,
  removeFromCompareLabel,
  agreeShareLabel,
}: Props) {
  const group = survey.questionGroups.find(
    (g) => g.name === OVERALL_ASSESSMENT_GROUP,
  )
  const cell = group?.questions.find(
    (candidate) => candidate.text === question.text,
  )

  const opacityClass = isDimmed
    ? 'opacity-40 grayscale scale-[0.98]'
    : 'opacity-100 scale-100'
  const highlightBgClass = isHighlighted
    ? 'bg-zinc-50 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-zinc-900/5'
    : 'hover:bg-zinc-50/80 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:scale-[1.01] active:scale-[0.99]'

  const removeAriaLabel = interpolate(removeFromCompareLabel, {
    name: survey.preschoolName,
  })

  const preschoolInfo = (
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <button
        aria-label={removeAriaLabel}
        class="flex size-10 shrink-0 items-center justify-center rounded-full text-zinc-300 ring-offset-surface transition-all duration-200 hover:scale-110 hover:rotate-90 hover:bg-red-50 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95"
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
      <a
        class={`min-w-0 text-start text-[16px] leading-snug wrap-break-word transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:text-primary-700 hover:underline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none ${isHighlighted ? 'translate-x-1 font-semibold text-primary-900' : 'font-normal text-zinc-800'}`}
        href={`${directoryHref}forskola/${survey.id}/?from=compare`}
        onClick={(e) => e.stopPropagation()}
      >
        {survey.preschoolName}
      </a>
    </div>
  )

  if (!cell) {
    return (
      <li
        class={`border-t border-zinc-100/60 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] first:border-0 ${opacityClass}`}
        key={survey.id}
      >
        <div
          class={`group -mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer items-center justify-between gap-6 rounded-2xl px-3 py-4 transition-all duration-300 ease-out sm:-mx-5 sm:w-[calc(100%+2.5rem)] sm:p-5 ${highlightBgClass}`}
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
      class={`border-t border-zinc-100/60 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] first:border-0 ${opacityClass}`}
      key={survey.id}
    >
      <div
        class={`group relative -mx-3 flex w-[calc(100%+1.5rem)] cursor-pointer items-center justify-between gap-6 rounded-2xl px-3 py-4 transition-all duration-300 ease-out sm:-mx-5 sm:w-[calc(100%+2.5rem)] sm:px-5 sm:py-4 ${highlightBgClass}`}
        onClick={onToggleHighlight}
      >
        {preschoolInfo}

        <div class="flex min-w-16 shrink-0 flex-col items-end justify-center text-end transition-transform duration-300 ease-out group-hover:-translate-x-1 sm:min-w-18 rtl:items-start rtl:text-start">
          <div
            class={`text-2xl leading-none tracking-tight transition-all duration-300 ease-out sm:text-3xl ${scoreColor} ${isHighlighted ? 'scale-110 font-bold' : 'font-semibold group-hover:scale-105'}`}
          >
            {agreeShare}%
          </div>
          <div
            class={`mt-1 text-[11px] tracking-wide uppercase transition-colors duration-300 ${isHighlighted ? 'font-medium text-zinc-600' : 'font-normal text-zinc-500'}`}
          >
            {agreeShareLabel}
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
