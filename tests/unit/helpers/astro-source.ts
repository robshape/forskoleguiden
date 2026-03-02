import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { expect } from 'vitest'

export const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8')

export const getClassTokens = (source: string, tagName: string) => {
  const tagMatch = source.match(new RegExp(`<${tagName}[^>]*class="([^"]+)"`))

  expect(tagMatch).not.toBeNull()

  return new Set(
    (tagMatch?.[1] ?? '')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean),
  )
}

export const getClassTokensFromMatch = (
  source: string,
  matcher: RegExp,
  context: string,
) => {
  const match = source.match(matcher)

  expect(match, context).not.toBeNull()

  return new Set(
    (match?.[1] ?? '')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean),
  )
}
