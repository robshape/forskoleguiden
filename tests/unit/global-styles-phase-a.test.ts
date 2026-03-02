import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const stylesPath = resolve(process.cwd(), 'src/styles/global.css')
const source = readFileSync(stylesPath, 'utf8')

describe('Phase A global styles', () => {
  it('defines required theme tokens for colors, layout width, and tray shadow', () => {
    expect(source).toContain('@theme')
    expect(source).toContain('--color-primary-50: #eff6ff;')
    expect(source).toContain('--color-primary-600: #2563eb;')
    expect(source).toContain('--color-primary-700: #1d4ed8;')
    expect(source).toContain('--color-score-high-bg: #dcfce7;')
    expect(source).toContain('--color-score-high-text: #166534;')
    expect(source).toContain('--color-score-medium-bg: #fef08a;')
    expect(source).toContain('--color-score-medium-text: #854d0e;')
    expect(source).toContain('--color-surface: #ffffff;')
    expect(source).toContain('--color-page: #f9fafb;')
    expect(source).toContain('--color-border: #e5e7eb;')
    expect(source).toContain('--max-width-content: 40rem;')
    expect(source).toMatch(
      /--shadow-tray:\s*0 -4px 6px rgba\(0,\s*0,\s*0,\s*0\.05\);/,
    )
  })

  it('defines global focus-visible, button, and link interaction defaults', () => {
    expect(source).toMatch(
      /:focus-visible\s*\{[^}]*outline-2[^}]*outline-offset-2[^}]*outline-primary-600[^}]*\}/,
    )
    expect(source).toMatch(
      /\[role='button'\]\s*\{[^}]*cursor-pointer[^}]*transition-colors[^}]*\}/,
    )
    expect(source).toMatch(
      /(^|\n)\s*a\s*\{[^}]*transition-property:\s*color,\s*background-color[^}]*transition-duration:\s*150ms[^}]*\}/,
    )
    expect(source).toMatch(
      /(^|\n)\s*a:not\(\[class\]\):hover\s*\{[^}]*text-primary-700[^}]*\}/,
    )
  })
})
