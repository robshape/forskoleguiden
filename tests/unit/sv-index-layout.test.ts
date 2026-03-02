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

  it('imports Nav and composes it with locale prop in BaseLayout header', () => {
    const layoutPath = resolve(process.cwd(), 'src/layouts/BaseLayout.astro')
    const source = readFileSync(layoutPath, 'utf8')

    expect(source).toMatch(
      /import\s+Nav\s+from\s+['"]@\/components\/astro\/Nav\.astro['"]/,
    )

    const headerMatch = source.match(/<header>([\s\S]*?)<\/header>/)

    expect(headerMatch).not.toBeNull()
    expect(headerMatch?.[1]).toMatch(/<Nav\s+locale=\{locale\}\s*\/?>/)
  })

  it('imports Footer and composes it with locale prop in BaseLayout footer', () => {
    const layoutPath = resolve(process.cwd(), 'src/layouts/BaseLayout.astro')
    const source = readFileSync(layoutPath, 'utf8')

    expect(source).toMatch(
      /import\s+Footer\s+from\s+['"]@\/components\/astro\/Footer\.astro['"]/,
    )

    const mainCloseIndex = source.indexOf('</main>')

    expect(mainCloseIndex).toBeGreaterThanOrEqual(0)

    const footerOpenIndex = source.indexOf('<footer>', mainCloseIndex)
    const footerCloseIndex = source.indexOf('</footer>', footerOpenIndex)

    expect(footerOpenIndex).toBeGreaterThanOrEqual(0)
    expect(footerCloseIndex).toBeGreaterThan(footerOpenIndex)

    const footerSource = source.slice(
      footerOpenIndex,
      footerCloseIndex + '</footer>'.length,
    )

    expect(footerSource).toContain('<Footer locale={locale} />')
  })

  it('uses locale-based translation key for language placeholder in Nav', () => {
    const navPath = resolve(process.cwd(), 'src/components/astro/Nav.astro')
    const source = readFileSync(navPath, 'utf8')

    expect(source).toMatch(
      /import\s+\{\s*t\s*,\s*type\s+Locale\s*\}\s+from\s+['"]@\/i18n\/utils['"]|import\s+\{\s*type\s+Locale\s*,\s*t\s*\}\s+from\s+['"]@\/i18n\/utils['"]/,
    )
    expect(source).toMatch(/t\('nav\.ariaLabel',\s*locale\)/)
    expect(source).toMatch(/t\('nav\.languagePlaceholder',\s*locale\)/)
  })
})
