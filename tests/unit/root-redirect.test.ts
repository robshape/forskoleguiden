import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

describe('root redirect configuration', () => {
  it('defines Astro native redirect from / to /sv/', async () => {
    const configPath = resolve(process.cwd(), 'astro.config.ts')
    const configModule = await import(pathToFileURL(configPath).href)
    const config = configModule.default

    expect(config).toEqual(
      expect.objectContaining({
        redirects: expect.objectContaining({
          '/': '/sv/',
        }),
      }),
    )
  })
})
