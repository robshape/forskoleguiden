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
- **Step 4.2 (Phase 2)**: Added reusable `src/components/astro/PreschoolCard.astro` with static card structure, detail-link URL pattern, operator badge, score badge treatment with defensive null handling, and a static compare button placeholder (`data-id`) for later interactive phases
- **Step 4.2 (Phase 3)**: Integrated `PreschoolCard` into `src/pages/sv/index.astro` list rendering so `/sv/` now renders card-based list items with required name/address/operator/score/detail-link content; Step 4.2 acceptance e2e is green after selector alignment with current localized list semantics
- **Step 4.2 (Phase 3 review revision)**: Hardened `tests/e2e/preschool-card-contract.spec.ts` to avoid brittle exact `section[aria-label=...]` selectors and index-order coupling by locating each card through detail-link href (`/sv/forskola/{id}/`) and asserting card contract fields per preschool
- **Step 4.2 (a11y/i18n hardening patch)**: Removed Swedish bypass and hardcoded badge copy in `PreschoolCard` by routing all labels through `t()`, added per-preschool compare button aria-label interpolation, replaced redundant score `aria-label` with null-state `sr-only` text, added stable `data-testid="preschool-card"`, and updated e2e assertions to avoid `data.ts` coupling and fragile XPath ancestry
- **Test hardening patch (2026-03-04)**: Replaced silent early return in `tests/unit/data-loader-contract.test.ts` with explicit throw on missing Helhetsbedömning, and switched score-fallback detection in `tests/e2e/preschool-card-contract.spec.ts` from `.sr-only` class coupling to stable `data-testid="score-fallback"` contract via `PreschoolCard`
- **Phase A/B**: UI styling + implementation-plan documentation updates for Steps 4–8
- **Test-suite naming cleanup (2026-03-04)**: Renamed all `tests/unit` and `tests/e2e` files from step/generic names to domain-focused contract names; updated markdown/memory-bank references to keep command snippets copy-safe
- **Dependabot auto-merge workflow (2026-03-04)**: Added `.github/workflows/dependabot.yml` — auto-tests, auto-approves, and squash-auto-merges Dependabot PRs after full quality gates pass; keeps open Dependabot branches updated when `main` advances

## Next Focus

1. Start Step 4.3 work (ranking explanation/sort controls) now that Step 4.2 acceptance is complete.
2. Keep Step 4.4+ and Step 5 interaction behaviors out of scope until Step 4.3 acceptance criteria are locked.

## Active Decisions

- `src/features/` directory is planned for Step 4+ (not yet populated).
- No pending tracked tasks.
