import ComparisonBreadcrumb from './ComparisonBreadcrumb'

interface Props {
  directoryHref: string
  backToDirectoryLabel: string
  emptyStateTitle: string
  emptyStateBody: string
}

export default function ComparisonEmptyState({
  directoryHref,
  backToDirectoryLabel,
  emptyStateTitle,
  emptyStateBody,
}: Props) {
  return (
    <div>
      <ComparisonBreadcrumb
        backToDirectoryLabel={backToDirectoryLabel}
        directoryHref={directoryHref}
      />
      <div class="py-12 text-center">
        <h1 class="text-2xl font-bold text-gray-900">{emptyStateTitle}</h1>
        <p
          class="mt-3 text-base text-gray-600"
          data-testid="comparison-empty-body"
        >
          {emptyStateBody}
        </p>
      </div>
    </div>
  )
}
