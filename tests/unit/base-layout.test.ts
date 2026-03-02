import { describe, expect, it } from 'vitest'

import { getClassTokens, readProjectFile } from './helpers/astro-source'

const svIndexSource = readProjectFile('src/pages/sv/index.astro')
const baseLayoutSource = readProjectFile('src/layouts/BaseLayout.astro')

describe('/sv/ page layout composition', () => {
  it('imports BaseLayout using the project alias path', () => {
    expect(svIndexSource).toMatch(
      /import\s+BaseLayout\s+from\s+['"]@\/layouts\/BaseLayout\.astro['"]/,
    )
  })

  it('passes required locale and title props to BaseLayout', () => {
    expect(svIndexSource).toContain('<BaseLayout')
    expect(svIndexSource).toContain('locale="sv"')
    expect(svIndexSource).toContain('title="Förskoleguiden"')
  })

  it('uses shared stylesheet alias and includes favicon link in BaseLayout', () => {
    expect(baseLayoutSource).toContain("import '@/styles/global.css'")
    expect(baseLayoutSource).toContain(
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    )
  })

  it('applies Phase A body class contract', () => {
    const classTokens = getClassTokens(baseLayoutSource, 'body')

    for (const token of [
      'bg-page',
      'font-sans',
      'text-gray-900',
      'min-h-screen',
      'flex',
      'flex-col',
      'antialiased',
    ]) {
      expect(classTokens.has(token)).toBe(true)
    }
  })

  it('applies main flex and centered max-w-content container contract', () => {
    const mainClassTokens = getClassTokens(baseLayoutSource, 'main')

    expect(mainClassTokens.has('flex-1')).toBe(true)

    const mainMatch = baseLayoutSource.match(/<main[^>]*>([\s\S]*?)<\/main>/)

    expect(mainMatch).not.toBeNull()
    expect(mainMatch?.[1]).toMatch(
      /<[^>]+class="[^"]*\bmax-w-content\b[^"]*\bmx-auto\b[^"]*\bpx-\d+\b[^"]*">[\s\S]*?<slot\s*\/>[\s\S]*?<\//,
    )
  })

  it('imports Nav and composes it with locale prop in BaseLayout header', () => {
    expect(baseLayoutSource).toMatch(
      /import\s+Nav\s+from\s+['"]@\/components\/astro\/Nav\.astro['"]/,
    )

    const headerMatch = baseLayoutSource.match(/<header>([\s\S]*?)<\/header>/)

    expect(headerMatch).not.toBeNull()
    expect(headerMatch?.[1]).toMatch(/<Nav\s+locale=\{locale\}\s*\/?>/)
  })

  it('imports Footer and composes it with locale prop in BaseLayout footer', () => {
    expect(baseLayoutSource).toMatch(
      /import\s+Footer\s+from\s+['"]@\/components\/astro\/Footer\.astro['"]/,
    )

    const mainCloseIndex = baseLayoutSource.indexOf('</main>')

    expect(mainCloseIndex).toBeGreaterThanOrEqual(0)

    const footerOpenIndex = baseLayoutSource.indexOf('<footer>', mainCloseIndex)
    const footerCloseIndex = baseLayoutSource.indexOf(
      '</footer>',
      footerOpenIndex,
    )

    expect(footerOpenIndex).toBeGreaterThanOrEqual(0)
    expect(footerCloseIndex).toBeGreaterThan(footerOpenIndex)

    const footerSource = baseLayoutSource.slice(
      footerOpenIndex,
      footerCloseIndex + '</footer>'.length,
    )

    expect(footerSource).toContain('<Footer locale={locale} />')
  })
})
