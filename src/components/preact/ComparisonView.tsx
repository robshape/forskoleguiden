import { useStore } from '@nanostores/preact'

import { compareIds } from '@/lib/state'

interface Props {
  heading: string
  directoryHref: string
  emptyStateTitle: string
  emptyStateBody: string
  backToDirectoryLabel: string
}

export default function ComparisonView({
  heading,
  directoryHref,
  emptyStateTitle,
  emptyStateBody,
  backToDirectoryLabel,
}: Props) {
  const ids = useStore(compareIds)

  if (ids.length === 0) {
    return (
      <div class="py-12 text-center">
        <h1 class="text-2xl font-bold text-gray-900">{emptyStateTitle}</h1>
        <p class="mt-3 text-gray-600">{emptyStateBody}</p>
        <a
          href={directoryHref}
          class="mt-6 inline-flex items-center text-sm text-primary-700 hover:underline"
        >
          ← {backToDirectoryLabel}
        </a>
      </div>
    )
  }

  // Step 7.2 will render the full comparison table
  return (
    <div class="py-8">
      <h1 class="text-2xl font-bold text-gray-900">{heading}</h1>
      <a
        href={directoryHref}
        class="mt-4 inline-flex items-center text-sm text-primary-700 hover:underline"
      >
        ← {backToDirectoryLabel}
      </a>
    </div>
  )
}
