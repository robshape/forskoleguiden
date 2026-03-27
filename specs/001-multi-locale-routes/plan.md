# Implementation Plan: Multi-Locale Page Routes

**Branch**: `001-multi-locale-routes` | **Date**: 2026-03-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-multi-locale-routes/spec.md`

## Summary

Generate English and Arabic page routes mirroring the existing Swedish pages so every route has a `/{locale}/` equivalent. The approach is explicit page files per locale — create `src/pages/en/` and `src/pages/ar/` directories that mirror `src/pages/sv/`, with each file only changing the `locale` constant. No component refactoring needed; all components already accept `locale` as a prop and route text through `t()`. Internal links already use dynamic `${base}/${locale}/` interpolation. Post-build tests are updated to verify three-locale parity.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode via `astro/tsconfigs/strict`)
**Primary Dependencies**: Astro 6.0.4 (static output), Preact 10.29.0, nanostores 1.1.1, Tailwind CSS 4.2.1 (via `@tailwindcss/vite`)
**Storage**: Static JSON files at build time (`data/malmo/`); `sessionStorage` for client state
**Testing**: Vitest 4.1.0 (unit + post-build), Playwright 1.58.2 (e2e), axe-core (a11y)
**Target Platform**: Static site deployed to GitHub Pages CDN; mobile-first (iPhone 17, 393 px)
**Project Type**: Static web application (Astro MPA with Preact islands)
**Performance Goals**: Lighthouse performance ≥ 0.90, page weight ≤ 100 KB uncompressed per page
**Constraints**: Zero runtime JS by default (Astro static), no external APIs, total island JS ~3–5 KB
**Scale/Scope**: ~261 preschools × 3 locales × 4 route types = ~3,140 generated pages

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                  | Status   | Evidence                                                                                     |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| I. Performance by Default  | **PASS** | No new JS. Pages are static HTML. Same components reused. Page weight budget unchanged.      |
| II. Accessibility First    | **PASS** | No new interactions. Same a11y-audited components. Arabic `dir="rtl"` already in BaseLayout. |
| III. Data Integrity        | **PASS** | Same data source for all locales. No data model changes.                                     |
| IV. Testing Standards      | **PASS** | Post-build tests extended for 3-locale parity. BDD naming.                                   |
| V. Architecture Discipline | **PASS** | Explicit per-locale page files. No dynamic routing complexity. Follows existing patterns.    |
| VI. Internationalization   | **PASS** | Directly fulfills Constitution VI. All three i18n files exist with enforced key parity.      |
| VII. Privacy by Design     | **PASS** | No new runtime requests, tracking, or cookies. Pure static pages.                            |

**Gate result: ALL PASS** — no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-multi-locale-routes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/pages/
├── en/                           # NEW — English locale pages
│   ├── index.astro               # English directory page
│   ├── forskola/
│   │   └── [id].astro            # English detail pages (dynamic)
│   ├── jamfor/
│   │   └── index.astro           # English comparison page
│   └── om/
│       └── index.astro           # English about page
├── ar/                           # NEW — Arabic locale pages
│   ├── index.astro               # Arabic directory page
│   ├── forskola/
│   │   └── [id].astro            # Arabic detail pages (dynamic)
│   ├── jamfor/
│   │   └── index.astro           # Arabic comparison page
│   └── om/
│       └── index.astro           # Arabic about page
└── sv/                           # EXISTING — unchanged
    ├── index.astro
    ├── forskola/
    │   └── [id].astro
    ├── jamfor/
    │   └── index.astro
    └── om/
        └── index.astro

tests/
├── post-build/
│   └── static-output-verification.test.ts  # MODIFIED — add 3-locale parity assertions
└── e2e/
    └── multi-locale-routes.spec.ts         # NEW — e2e test for locale navigation
```

**Structure Decision**: Explicit page files per locale (`src/pages/{locale}/`), mirroring the existing `src/pages/sv/` structure. Each locale directory contains identical file structure with only the `locale` constant changed. This avoids Astro's `i18n` config complexity and keeps pages independently buildable. No contracts directory needed — this feature has no external interfaces.
