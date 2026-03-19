interface Props {
  emptyStateTitle: string
  emptyStateBody: string
}

export default function ComparisonEmptyState({
  emptyStateTitle,
  emptyStateBody,
}: Props) {
  return (
    <div class="py-12 text-center">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {emptyStateTitle}
      </h2>
      <p
        class="mt-3 text-base text-gray-600"
        data-testid="comparison-empty-body"
      >
        {emptyStateBody}
      </p>
    </div>
  )
}
