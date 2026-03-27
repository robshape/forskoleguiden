# Quickstart: Language Switcher

**Branch**: `002-language-switcher` | **Date**: 2026-03-23

## Prerequisites

- Node.js ≥ 20.x, pnpm ≥ 9.x
- Workspace already set up (run `pnpm install` from repo root if not done)
- Multi-locale page routes (Step 0 from Phase 2) must be built: `/en/` and `/ar/` pages must exist in `src/pages/`

## Development Workflow

```sh
# Start dev server
pnpm dev
# → http://localhost:4321/forskoleguiden/sv/
# → http://localhost:4321/forskoleguiden/en/
# → http://localhost:4321/forskoleguiden/ar/

# Type-check all Astro + TS files
pnpm check

# Run unit tests (includes i18n parity + URL computation)
pnpm test

# Run e2e tests (includes language switcher navigation flow)
pnpm test:e2e

# Full quality gate (lint + format + check + test + build + e2e + Lighthouse)
pnpm validate
```

## Key Files

| File                                                   | Action     | Purpose                                                 |
| ------------------------------------------------------ | ---------- | ------------------------------------------------------- |
| `src/lib/locale-switch.ts`                             | **CREATE** | Pure `buildLocaleSwitchUrl()` utility                   |
| `src/components/astro/LanguageSwitcher.astro`          | **CREATE** | Switcher component                                      |
| `src/components/astro/Nav.astro`                       | **MODIFY** | Replace `<span>` placeholder with `<LanguageSwitcher>`  |
| `src/i18n/sv.json`                                     | **MODIFY** | Add `locale.*` and `nav.languageSwitcherAriaLabel` keys |
| `src/i18n/en.json`                                     | **MODIFY** | Same new keys                                           |
| `src/i18n/ar.json`                                     | **MODIFY** | Same new keys                                           |
| `tests/unit/language-switcher-url-computation.test.ts` | **CREATE** | Unit tests for `buildLocaleSwitchUrl`                   |
| `tests/e2e/language-switcher-navigation.spec.ts`       | **CREATE** | E2e navigation + accessibility tests                    |

## Step-to-Detail Traceability

Use this map while implementing so each step has a single source of truth for requirements and design decisions.

| Step                         | Primary outcome                                                     | Requirement source                                                                                          | Implementation detail source                                                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Add i18n keys             | Locale labels + translated switcher aria label in all locales       | [spec.md](spec.md#functional-requirements) (FR-005, FR-009, FR-010)                                         | [data-model.md](data-model.md#i18n-key-schema-additions)                                                                                                                                                                                                                                                                                     |
| 2. Build URL utility         | Pure locale-switch URL function with fallback behavior              | [spec.md](spec.md#functional-requirements) (FR-002, FR-012) + [spec.md](spec.md#edge-cases)                 | [research.md](research.md#decision-5-url-path-computation-for-locale-switching), [data-model.md](data-model.md#url-computation-model)                                                                                                                                                                                                        |
| 3. Add unit tests            | Lock URL utility behavior and edge-case coverage                    | [spec.md](spec.md#functional-requirements) (FR-002, FR-012)                                                 | [data-model.md](data-model.md#url-computation-model)                                                                                                                                                                                                                                                                                         |
| 4. Create switcher component | Render active/inactive locale UI, aria semantics, responsive labels | [spec.md](spec.md#functional-requirements) (FR-001, FR-003, FR-004, FR-005, FR-006, FR-007, FR-013, FR-014) | [research.md](research.md#decision-1-component-type--astro-vs-preact-island), [research.md](research.md#decision-2-reading-the-current-url-path), [research.md](research.md#decision-3-flag-icon-implementation), [research.md](research.md#decision-4-mobile-responsive-label-strategy), [data-model.md](data-model.md#component-interface) |
| 5. Integrate in Nav          | Remove placeholder, wire the new switcher into header shell         | [spec.md](spec.md#functional-requirements) (FR-008)                                                         | [plan.md](plan.md#source-code-repository-root)                                                                                                                                                                                                                                                                                               |
| 6. Add e2e tests             | Validate real user journeys + a11y compliance                       | [spec.md](spec.md#user-scenarios--testing-mandatory), [spec.md](spec.md#success-criteria-mandatory)         | [quickstart.md](quickstart.md#verification-checklist)                                                                                                                                                                                                                                                                                        |
| 7. Refinement + validate     | RTL/mobile polish and full quality gate                             | [spec.md](spec.md#success-criteria-mandatory)                                                               | [quickstart.md](quickstart.md#verification-checklist)                                                                                                                                                                                                                                                                                        |

## Implementation Steps (ordered)

### 1. Add i18n keys

Add to all three locale files under the `nav` key and as a new top-level `locale` group:

```json
{
  "locale": {
    "sv": "Svenska",
    "en": "English",
    "ar": "العربية"
  },
  "nav": {
    "...existing keys...",
    "languageSwitcherAriaLabel": "Välj språk"
  }
}
```

Verify parity: `pnpm test -- --reporter=verbose` — the `i18n-locale-key-parity.test.ts` test must pass.

### 2. Create `src/lib/locale-switch.ts`

Pure function that takes `(pathname, targetLocale, basePath)` and returns the locale-switched path. No imports from Astro — callable in both Vitest and Astro build contexts.

```ts
import type { Locale } from '@/i18n/utils'

const LOCALES: Locale[] = ['sv', 'en', 'ar']

export const buildLocaleSwitchUrl = (
  pathname: string,
  targetLocale: Locale,
  basePath: string,
): string => {
  const relative = pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname
  const segments = relative.split('/')
  if (LOCALES.includes(segments[1] as Locale)) {
    segments[1] = targetLocale
    return basePath + segments.join('/')
  }
  return `${basePath}/${targetLocale}/`
}
```

### 3. Write unit tests for `buildLocaleSwitchUrl`

Create `tests/unit/language-switcher-url-computation.test.ts`. Cover:

- Directory page (`/sv/` → `/en/`)
- Detail page (locale segment replaced, path tail preserved)
- Comparison page
- About page
- No locale segment fallback (returns target locale root)
- All three target locales
- Base path with and without trailing slash edge cases

### 4. Create `src/components/astro/LanguageSwitcher.astro`

Key structural pattern:

```astro
---
import { type Locale, t } from '@/i18n/utils'
import { getBasePath } from '@/lib/base-path'
import { buildLocaleSwitchUrl } from '@/lib/locale-switch'

interface Props {
  locale: Locale
}
const { locale } = Astro.props
const basePath = getBasePath()
const pathname = Astro.url.pathname

const locales = [
  { code: 'sv' as Locale, isoCode: 'SV', flag: '🇸🇪', lang: 'sv' },
  { code: 'en' as Locale, isoCode: 'EN', flag: '🇬🇧', lang: 'en' },
  { code: 'ar' as Locale, isoCode: 'AR', flag: '🇸🇦', lang: 'ar' },
] as const
---

<nav aria-label={t('nav.languageSwitcherAriaLabel', locale)}>
  <!-- render each locale option:
       active → <span aria-current="page">
       inactive → <a href={...} lang={code}> -->
</nav>
```

- Active locale: `<span aria-current="page"><span aria-hidden="true">🇸🇪</span> <span class="min-[376px]:hidden">SV</span><span class="hidden min-[376px]:inline">Svenska</span></span>`
- Inactive locale: `<a href={buildLocaleSwitchUrl(pathname, code, basePath)} lang={code}>...same label pattern...</a>`
- Flag emoji: `<span aria-hidden="true">{flag}</span>`

### 5. Update `Nav.astro`

Replace the disabled `<span>` placeholder with:

```astro
<LanguageSwitcher locale={locale} />
```

Remove `nav.languagePlaceholder` and `nav.languageComingSoon` keys from i18n files once confirmed unused (optional clean-up at implementation time).

### 6. Write e2e tests

Create `tests/e2e/language-switcher-navigation.spec.ts`. Cover:

- Directory page: switcher is visible, three options present
- Click "English" from Swedish directory → URL changes to `/en/` equivalent
- Click English from Swedish detail page → lands on same preschool in English
- Active locale has `aria-current="page"`, inactive locales are links
- `aria-label` on the `<nav>` element exists
- axe-core scan on the Swedish, English, and Arabic directory pages reports zero violations
- Narrow viewport (375 px wide): ISO codes visible, full names hidden

## Verification Checklist

After implementation, verify each item before running `pnpm validate`:

- [ ] `pnpm test` passes — i18n parity + URL computation unit tests all green
- [ ] `pnpm check` passes — no TypeScript errors
- [ ] `pnpm build` succeeds — all three locales build with the switcher
- [ ] Inspect `dist/sv/index.html` — `<nav aria-label="Välj språk">` present, three locale options rendered
- [ ] Inspect `dist/en/index.html` — `<nav aria-label="Choose language">` present, "English" has `aria-current="page"`
- [ ] Inspect `dist/ar/index.html` — `<nav aria-label="اختر اللغة">` present, Arabic option has `aria-current="page"`
- [ ] `pnpm test:e2e` passes — navigation flow tests green
- [ ] No new axe-core violations on any page
- [ ] Mobile (375 px): ISO codes visible, full names hidden
- [ ] Wider than 375 px: Full native names visible

## Notes

- **No new JS islands created** — `LanguageSwitcher.astro` is a pure static component.
- **Compare set unaffected** — `sessionStorage` holds preschool IDs which are locale-agnostic. Switching locale does not clear the compare selection.
- **Arabic flag placeholder** — 🇸🇦 is used as a stand-in. May be swapped for 🌐 (globe) for a more neutral representation. No spec change required — this is a design-time decision.
- **Removed placeholder keys** — `nav.languagePlaceholder` and `nav.languageComingSoon` become unused after implementation. Remove them from all three locale files once `Nav.astro` no longer references them.
