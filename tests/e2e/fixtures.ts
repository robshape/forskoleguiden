import { type Locator, type Page, test as base } from '@playwright/test'

// Collect uncaught page errors and console.error messages during each test.
// If any are captured, the test fails automatically after the test body.
const collectPageErrors = (page: Page) => {
  const errors: string[] = []

  page.on('pageerror', (error) => {
    errors.push(`[pageerror] ${error.message}`)
  })

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[console.error] ${msg.text()}`)
    }
  })

  return errors
}

export const test = base.extend<{ _autoPageErrors: void }>({
  // Auto-fixture: attaches listeners before the test and asserts after.
  // The underscore prefix signals it is not meant for direct use.
  _autoPageErrors: [
    async ({ page }, use) => {
      const errors = collectPageErrors(page)
      await use()
      if (errors.length > 0) {
        throw new Error(
          `Unexpected browser errors during test:\n${errors.join('\n')}`,
        )
      }
    },
    { auto: true },
  ],
})

// Re-export expect so spec files only need one import source.
export { expect } from '@playwright/test'

// Re-export common types for convenience.
export type { Locator, Page } from '@playwright/test'

// ---------------------------------------------------------------------------
// Focus-ring inspection helper
//
// Extracts the computed box-shadow and outline properties from a focused
// element. Ring-based controls (sort toggle, compare buttons, tray controls)
// use Tailwind's ring utilities (box-shadow) for their focus indicator and
// explicitly suppress the browser outline with focus-visible:outline-none.
// Use this helper when asserting focus styles on those controls; use an inline
// outline check (as in layout-shell-accessibility.spec.ts) for shell links that
// use the global base-layer outline rule instead.
// ---------------------------------------------------------------------------
export const getFocusRingContract = async (locator: Locator) =>
  locator.evaluate((element: Element) => {
    const computedStyle = window.getComputedStyle(element)

    return {
      boxShadow: computedStyle.boxShadow,
      outlineStyle: computedStyle.outlineStyle,
      outlineWidth: computedStyle.outlineWidth,
    }
  })

// ---------------------------------------------------------------------------
// Focus-outline inspection helper
//
// Extracts the computed outline properties from a focused element that uses
// the global base-layer outline rule (plain <a> and <button> elements without
// ring-override classes). Use this for non-ring-based interactive elements such
// as the comparison-page back link.
// ---------------------------------------------------------------------------
export const getFocusOutlineContract = async (locator: Locator) =>
  locator.evaluate((element: Element) => {
    const computedStyle = window.getComputedStyle(element)

    return {
      outlineWidth: computedStyle.outlineWidth,
      outlineStyle: computedStyle.outlineStyle,
      outlineOffset: computedStyle.outlineOffset,
      outlineColor: computedStyle.outlineColor,
    }
  })
