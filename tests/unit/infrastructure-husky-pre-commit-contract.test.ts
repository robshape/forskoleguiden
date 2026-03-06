import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const ROOT = resolve(process.cwd())

/**
 * Extracts the YAML step block for the given step name from a workflow string.
 * Starts at `- name: <stepName>` and ends just before the next `- name:` entry
 * at any indentation level. Returns null when the step is not present.
 */
function extractStepBlock(yaml: string, stepName: string): string | null {
  const marker = `- name: ${stepName}`
  const start = yaml.indexOf(marker)
  if (start === -1) return null
  const afterMarker = start + marker.length
  const nextStepOffset = yaml.slice(afterMarker).search(/\n\s*- name:/)
  const end = nextStepOffset === -1 ? yaml.length : afterMarker + nextStepOffset
  return yaml.slice(start, end)
}

describe('Husky pre-commit hook infrastructure contract', () => {
  it('should have a pinned husky devDependency in package.json', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(ROOT, 'package.json'), 'utf8'),
    ) as {
      devDependencies?: Record<string, string>
    }
    const huskyVersion = pkg.devDependencies?.husky
    expect(
      huskyVersion,
      'husky must be present in devDependencies',
    ).toBeDefined()
    expect(
      huskyVersion,
      'husky version must be pinned (no ^ or ~ prefix)',
    ).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('should have a prepare script set to "husky" in package.json', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(ROOT, 'package.json'), 'utf8'),
    ) as {
      scripts?: Record<string, string>
    }
    expect(pkg.scripts?.prepare).toBe('husky')
  })

  it('should have a .husky/pre-commit hook that runs pnpm validate', () => {
    const hookPath = resolve(ROOT, '.husky', 'pre-commit')
    expect(existsSync(hookPath), '.husky/pre-commit file must exist').toBe(true)
    const content = readFileSync(hookPath, 'utf8')
    expect(content, '.husky/pre-commit must invoke pnpm validate').toContain(
      'pnpm validate',
    )
  })

  it('should disable Husky via HUSKY=0 env in the quality-gates.yml install step', () => {
    const workflow = readFileSync(
      resolve(ROOT, '.github', 'workflows', 'quality-gates.yml'),
      'utf8',
    )
    const installStep = extractStepBlock(workflow, 'Install dependencies')
    expect(
      installStep,
      'quality-gates.yml must have an "Install dependencies" step',
    ).not.toBeNull()
    expect(
      installStep,
      'quality-gates.yml Install dependencies step must declare an env: block',
    ).toContain('env:')
    expect(
      installStep,
      'quality-gates.yml Install dependencies step must set HUSKY: 0',
    ).toMatch(/HUSKY:\s*['"]?0['"]?/)
    expect(
      installStep,
      'quality-gates.yml Install dependencies step must run pnpm install --frozen-lockfile',
    ).toContain('pnpm install --frozen-lockfile')
  })

  it('should disable Husky via HUSKY=0 env in the deploy.yml install step', () => {
    const workflow = readFileSync(
      resolve(ROOT, '.github', 'workflows', 'deploy.yml'),
      'utf8',
    )
    const installStep = extractStepBlock(workflow, 'Install dependencies')
    expect(
      installStep,
      'deploy.yml must have an "Install dependencies" step',
    ).not.toBeNull()
    expect(
      installStep,
      'deploy.yml Install dependencies step must declare an env: block',
    ).toContain('env:')
    expect(
      installStep,
      'deploy.yml Install dependencies step must set HUSKY: 0',
    ).toMatch(/HUSKY:\s*['"]?0['"]?/)
    expect(
      installStep,
      'deploy.yml Install dependencies step must run pnpm install --frozen-lockfile',
    ).toContain('pnpm install --frozen-lockfile')
  })

  it('regression: HUSKY:0 in a different step should not satisfy the install-step assertion', () => {
    // The old broad-regex /HUSKY:\s*['"]?0['"]?/ would pass this fake workflow
    // because it matches anywhere in the file — even though HUSKY: 0 is attached
    // to a completely different step, not the install step.
    const fakeWorkflow = `
jobs:
  quality-gates:
    steps:
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Some other step
        env:
          HUSKY: 0
        run: echo hello
`
    // Old broad assertion would silently pass:
    expect(fakeWorkflow).toMatch(/HUSKY:\s*['"]?0['"]?/)

    // Step-scoped assertion correctly shows HUSKY: 0 is NOT in the install step:
    const installStep = extractStepBlock(fakeWorkflow, 'Install dependencies')
    expect(installStep).not.toBeNull()
    expect(installStep).not.toMatch(/HUSKY:\s*['"]?0['"]?/)
  })

  it('regression: extractStepBlock returns null when the named step is absent', () => {
    const fakeWorkflow = `
jobs:
  quality-gates:
    steps:
      - name: Some other step
        env:
          HUSKY: 0
        run: echo hello
`
    const block = extractStepBlock(fakeWorkflow, 'Install dependencies')
    expect(block).toBeNull()
  })
})
