import { useStore } from '@nanostores/preact'

import { interpolate } from '@/lib/interpolate'
import { compareIds, toggleCompare } from '@/lib/state'

interface Props {
  id: string
  name: string
  addLabel: string
  addedLabel: string
  ariaLabelTemplate: string
}

const buildAriaLabel = (template: string, action: string, name: string) =>
  interpolate(template, { action, name })

export default function CompareButton({
  id,
  name,
  addLabel,
  addedLabel,
  ariaLabelTemplate,
}: Props) {
  const ids = useStore(compareIds)
  const isSelected = ids.includes(id)
  const label = isSelected ? addedLabel : addLabel
  const buttonClass = isSelected
    ? 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-700/90'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
  const ariaLabel = buildAriaLabel(ariaLabelTemplate, label, name)

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      class={`inline-flex min-h-11 max-w-full shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-center text-caption/tight font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none ${buttonClass}`}
      onClick={() => {
        toggleCompare(id)
      }}
      type="button"
    >
      <svg
        aria-hidden="true"
        class="size-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.5"
        viewBox="0 0 16 16"
      >
        {isSelected ? (
          <path d="M3 8.5 6.5 12 13 5.5"></path>
        ) : (
          <path d="M8 3v10M3 8h10"></path>
        )}
      </svg>
      <span>{label}</span>
    </button>
  )
}
