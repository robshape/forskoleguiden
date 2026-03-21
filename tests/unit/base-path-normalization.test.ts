import { describe, expect, it } from 'vitest'

import { getBasePath } from '@/lib/base-path'

describe('base path normalization', () => {
  it('strips the trailing slash from the default Vite BASE_URL', () => {
    const basePath = getBasePath()

    // Vite defaults BASE_URL to '/' in test/dev; getBasePath strips the trailing slash
    expect(basePath).toBe('')
    expect(basePath.endsWith('/')).toBe(false)
  })

  it('never ends with a trailing slash regardless of BASE_URL value', () => {
    // Vite hard-codes BASE_URL at build time, so in the test/dev environment
    // it is always '/'. We cannot inject a non-root base here without
    // reimplementing the Vite transform. This test documents that constraint
    // and verifies the trailing-slash invariant for the default case.
    const basePath = getBasePath()

    expect(basePath.endsWith('/')).toBe(false)
  })
})
