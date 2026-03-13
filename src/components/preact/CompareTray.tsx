import { useEffect, useRef } from 'preact/hooks'
import { useStore } from '@nanostores/preact'

import { clearCompare, compareIds } from '@/lib/state'

interface Props {
  selectedCountTemplate: string
  showComparisonLabel: string
  clearLabel: string
  compareHref: string
  compareRouteAvailable: boolean
}

export default function CompareTray({
  selectedCountTemplate,
  showComparisonLabel,
  clearLabel,
  compareHref,
  compareRouteAvailable,
}: Props) {
  const ids = useStore(compareIds)
  const trayRef = useRef<HTMLElement>(null)

  // Write tray height to a CSS variable so the body can reserve space below the
  // fold and prevent the fixed tray from obscuring bottom-page content.
  useEffect(() => {
    const el = trayRef.current
    if (!el) {
      document.documentElement.style.setProperty('--tray-height', '0px')
      return
    }
    const update = () =>
      document.documentElement.style.setProperty(
        '--tray-height',
        `${el.offsetHeight}px`,
      )
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ids.length])

  if (ids.length === 0) {
    return null
  }

  const selectedCountText = selectedCountTemplate.replace(
    '{count}',
    String(ids.length),
  )

  return (
    <nav
      ref={trayRef}
      data-testid="compare-tray"
      aria-label={showComparisonLabel}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      class="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white shadow-lg"
    >
      <div class="mx-auto flex max-w-content items-center justify-between gap-4 px-5 py-3">
        <span class="text-sm font-medium text-gray-700">
          {selectedCountText}
        </span>
        <div class="flex items-center gap-3">
          {compareRouteAvailable ? (
            <a
              href={compareHref}
              class="inline-flex items-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none"
            >
              {showComparisonLabel}
            </a>
          ) : (
            <button
              type="button"
              aria-disabled="true"
              class="inline-flex cursor-not-allowed items-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white opacity-50"
            >
              {showComparisonLabel}
            </button>
          )}
          <button
            type="button"
            onClick={clearCompare}
            class="inline-flex items-center rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 focus-visible:outline-none"
          >
            {clearLabel}
          </button>
        </div>
      </div>
    </nav>
  )
}
