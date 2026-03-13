import { test as base, type Page } from '@playwright/test'

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
