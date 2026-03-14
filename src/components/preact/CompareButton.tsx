import { useStore } from '@nanostores/preact'

import { compareIds, toggleCompare } from '@/lib/state'

interface Props {
  id: string
  name: string
  addLabel: string
  addedLabel: string
  ariaLabelTemplate: string
}

const interpolateAriaLabel = (
  template: string,
  action: string,
  name: string,
) => {
  return template.replace(/\{action\}/g, action).replace(/\{name\}/g, name)
}

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
    ? 'bg-primary-600 text-white hover:bg-primary-700'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  const ariaLabel = interpolateAriaLabel(ariaLabelTemplate, label, name)

  return (
    <button
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      class={`inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none ${buttonClass}`}
      onClick={() => {
        toggleCompare(id)
      }}
      type="button"
    >
      <svg
        aria-hidden="true"
        class="size-3 shrink-0"
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
