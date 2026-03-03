# Active Context

## Current State

Steps 0–3 scaffolding and implementation are complete. The layout shell (BaseLayout, Nav, Footer, CityYearSelector) is styled to mockup baseline with Tailwind v4 design tokens. All tests are KCD-aligned: 13 unit tests + 3 e2e tests = 16 total.

Key completed milestones:

- **Step 1**: Data layer (types, data loading, scoring) in `src/lib/`
- **Step 2**: i18n foundation (sv/en/ar locales, `t()` utility, locale routing)
- **Step 3**: Layout shell + design foundations (BaseLayout, Nav, Footer, global tokens)
- **Step 4.1**: Swedish directory route build-time data assembly completed in `src/pages/sv/index.astro` with index + per-preschool survey score computation, minimal output, and Phase 3 quality-gate verification
- **Step 4.1 (review hardening)**: Added `getPreschoolSurveyByYear(id, year)` for index-read optimization path, localized score/fallback text through `t()`, and tightened e2e naming/assertion diagnostics
- **Step 4.1 (i18n utility enhancement)**: `t()` now supports placeholder interpolation with optional params (for example `{score}`), and `/sv` score rendering now uses centralized i18n interpolation instead of local string replacement
- **Step 4.1 (follow-up hardening)**: Localized `/sv` list aria-label and page title via `t()`, added `directory.listAriaLabel` across locales, removed implementation-detail I/O-count tests from data loader unit tests, and strengthened i18n translation map typing
- **Phase A/B**: UI styling + implementation-plan documentation updates for Steps 4–8

## Next Focus

1. Begin Step 4.2 directory card component implementation with visual baseline from `docs/implementation-plan.md`.
2. Keep Step 4.1 minimal route output stable while expanding only Step 4.2 scope.

## Active Decisions

- `src/features/` directory is planned for Step 4+ (not yet populated).
- No pending tracked tasks.
