interface Props {
  directoryHref: string
  backToDirectoryLabel: string
}

export default function ComparisonBreadcrumb({
  directoryHref,
  backToDirectoryLabel,
}: Props) {
  return (
    <nav aria-label={backToDirectoryLabel} class="mt-2 mb-6">
      <a
        class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        href={directoryHref}
      >
        <svg
          aria-hidden="true"
          class="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        {backToDirectoryLabel}
      </a>
    </nav>
  )
}
