import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

const REQUIRED_PATHS = [
  'node_modules/',
  'dist/',
  '.astro/',
  '.DS_Store',
] as const

describe('.gitignore regression guard', () => {
  it('keeps required paths ignored', () => {
    const output = execFileSync(
      'git',
      ['check-ignore', '-v', ...REQUIRED_PATHS],
      {
        encoding: 'utf8',
      },
    ).trim()

    const lines = output.split('\n').filter(Boolean)
    const matchedPaths = lines
      .map((line) => line.trim().split(/\s+/).at(-1))
      .filter((path): path is string => Boolean(path))

    expect(lines).toHaveLength(REQUIRED_PATHS.length)
    expect(new Set(matchedPaths)).toEqual(new Set(REQUIRED_PATHS))

    for (const path of REQUIRED_PATHS) {
      expect(matchedPaths).toContain(path)
    }
  })
})
