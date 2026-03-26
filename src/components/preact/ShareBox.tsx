interface Props {
  buttonLabel: string
  descriptionLabel: string
  disabled: boolean
  onShare: () => void
  titleLabel: string
}

export default function ShareBox({
  buttonLabel,
  descriptionLabel,
  disabled,
  onShare,
  titleLabel,
}: Props) {
  return (
    <div class="mb-10 flex flex-col gap-4 sm:gap-6">
      <div
        class="flex flex-col gap-4 rounded-xl bg-primary-50 p-5 ring-1 ring-primary-100 ring-inset sm:flex-row sm:items-center sm:justify-between"
        data-testid="share-box"
      >
        <div class="flex flex-col gap-1">
          <p class="text-base font-semibold text-primary-900">{titleLabel}</p>
          <p class="text-sm text-primary-700">{descriptionLabel}</p>
        </div>
        <button
          class="min-h-11 w-full shrink-0 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:opacity-50 sm:w-auto"
          data-testid="share-comparison-button"
          disabled={disabled}
          onClick={onShare}
          type="button"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
