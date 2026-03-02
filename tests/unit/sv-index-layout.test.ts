import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('/sv/ page layout composition', () => {
  it('imports BaseLayout using the project alias path', () => {
    const pagePath = resolve(process.cwd(), 'src/pages/sv/index.astro')
    const source = readFileSync(pagePath, 'utf8')

    expect(source).toMatch(
      /import\s+BaseLayout\s+from\s+['"]@\/layouts\/BaseLayout\.astro['"]/,
    )
  })

  it('passes required locale and title props to BaseLayout', () => {
    const pagePath = resolve(process.cwd(), 'src/pages/sv/index.astro')
    const source = readFileSync(pagePath, 'utf8')

    expect(source).toContain('<BaseLayout')
    expect(source).toContain('locale="sv"')
    expect(source).toContain('title="Förskoleguiden"')
  })

  it('uses shared stylesheet alias and includes favicon link in BaseLayout', () => {
    const layoutPath = resolve(process.cwd(), 'src/layouts/BaseLayout.astro')
    const source = readFileSync(layoutPath, 'utf8')

    expect(source).toContain("import '@/styles/global.css'")
    expect(source).toContain(
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    )
  })
})
