# Implementation Plan: Language Switcher

**Branch**: `002-language-switcher` | **Date**: 2026-03-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-language-switcher/spec.md`

## Summary

Replace the disabled language switcher placeholder in `Nav.astro` with a new `LanguageSwitcher.astro` component. The component renders a `<nav>` landmark with three locale options (Swedish, English, Arabic), each showing a flag emoji and either an ISO code (mobile) or full native name (wider viewports). Active locale is marked with `aria-current="page"` and rendered as a non-link `<span>`; inactive locales are `<a>` elements with `lang` attributes. URL locale-switching uses `Astro.url.pathname` to replace the locale segment — query params are dropped. No new JS island needed; this is a pure Astro static component. New i18n keys (`locale.sv`, `locale.en`, `locale.ar`, `nav.languageSwitcherAriaLabel`) are added to all three locale files.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode via `astro/tsconfigs/strict`)
**Primary Dependencies**: Astro 6.0.4 (static output), Tailwind CSS 4.2.1 (via `@tailwindcss/vite`), `src/i18n/utils.ts` (`t()`, `Locale` type), `src/lib/base-path.ts` (`getBasePath()`)
**Storage**: N/A — no new data entities; `sessionStorage` compare set is unaffected by locale switch
**Testing**: Vitest 4.1.0 (unit), Playwright 1.58.2 (e2e), axe-core (a11y)
**Target Platform**: Static site on GitHub Pages; mobile-first (iPhone 13 mini 375 px)
**Project Type**: Static web application (Astro MPA with Preact islands)
**Performance Goals**: Lighthouse performance ≥ 0.90, page weight ≤ 100 KB uncompressed per page
**Constraints**: Zero new runtime JS (pure Astro component), no external CDN, emoji flags only (no icon library), total island JS budget unchanged
**Scale/Scope**: 4 route types × 3 locales × ~261 preschools = all existing pages gain a functional switcher

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                  | Status   | Evidence                                                                                                                                 |
| -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| I. Performance by Default  | **PASS** | No new JS. `LanguageSwitcher.astro` is a pure static component. Unicode emoji flags add ~12 bytes each. Page weight budget unaffected.   |
| II. Accessibility First    | **PASS** | `<nav aria-label>`, `aria-current="page"`, `lang` per locale link, `aria-hidden` on flag emoji. axe-core e2e test covers switcher.       |
| III. Data Integrity        | **PASS** | No data model changes. Preschool data and scoring logic unaffected.                                                                      |
| IV. Testing Standards      | **PASS** | Unit test for URL computation logic (pure function). E2e test for full navigation flow + accessibility. BDD naming.                      |
| V. Architecture Discipline | **PASS** | New Astro component (not an island — no client state needed). Organized in `src/components/astro/`. Reads `Astro.url.pathname` directly. |
| VI. Internationalization   | **PASS** | Directly fulfills Constitution VI. New i18n keys added to all three locale files. Parity test will enforce correctness.                  |
| VII. Privacy by Design     | **PASS** | No new runtime requests. No tracking. No cookies. Emoji flags are inline Unicode — no CDN.                                               |

**Gate result: ALL PASS** — no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/002-language-switcher/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── astro/
│       ├── Nav.astro                         # MODIFIED — replaces <span> placeholder with <LanguageSwitcher>
│       └── LanguageSwitcher.astro            # NEW — locale switcher component
├── i18n/
│   ├── sv.json                               # MODIFIED — add locale.{sv,en,ar} + nav.languageSwitcherAriaLabel
│   ├── en.json                               # MODIFIED — same new keys
│   └── ar.json                               # MODIFIED — same new keys

tests/
├── unit/
│   └── language-switcher-url-computation.test.ts  # NEW — pure URL path replacement logic
└── e2e/
    └── language-switcher-navigation.spec.ts        # NEW — full navigation flow + accessibility
```

**Structure Decision**: Single-project layout. The feature touches only `src/components/astro/`, `src/i18n/`, and test layers. No new directories needed. `LanguageSwitcher.astro` lives alongside `Nav.astro` in `src/components/astro/` as it is an Astro static component with no client interactivity.
