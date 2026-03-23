import { useEffect, useRef, useState } from 'preact/hooks'

interface Props {
  defaultHref: string
  defaultLabel: string
  comparisonHref?: string
  comparisonLabel?: string
}

export default function BreadcrumbLink({
  defaultHref,
  defaultLabel,
  comparisonHref,
  comparisonLabel,
}: Props) {
  const [href, setHref] = useState(defaultHref)
  const [label, setLabel] = useState(defaultLabel)
  const linkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!comparisonHref || !comparisonLabel) return

    const isFromCompare =
      new URLSearchParams(window.location.search).get('from') === 'compare'

    if (isFromCompare) {
      setHref(comparisonHref)
      setLabel(comparisonLabel)

      // Update the parent <nav> aria-label to match the new breadcrumb context
      const nav = linkRef.current?.closest('nav')
      if (nav) {
        nav.setAttribute('aria-label', comparisonLabel)
      }
    }
  }, [comparisonHref, comparisonLabel])

  return (
    <a
      class="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:outline-none"
      href={href}
      ref={linkRef}
    >
      <svg
        aria-hidden="true"
        class="size-4"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        viewBox="0 0 24 24"
      >
        <path
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span data-breadcrumb-label>{label}</span>
    </a>
  )
}
