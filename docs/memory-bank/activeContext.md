# Active Context

## Current State

Steps 0–4 are complete. The `/sv/` directory page renders ranked preschool cards with an interactive sort toggle (Rankning / A–Ö). All quality gates green. Test suite: 15 unit + 8 e2e = 23 total.

Key completed milestones:

- **Step 1**: Data layer (types, data loading, scoring) in `src/lib/`
- **Step 2**: i18n foundation (sv/en/ar locales, `t()` with interpolation, locale routing)
- **Step 3**: Layout shell + design foundations (BaseLayout, Nav, Footer, CityYearSelector, global tokens)
- **Step 4**: Directory page — build-time data assembly, PreschoolCard component, score-desc ranking with deterministic tie-breaks, interactive SortToggle Preact island, full a11y (aria-live, localized labels, keyboard focus)

## Next Focus

1. Start Step 5.1 (`src/lib/state.ts`) nanostore compare-state atoms and toggle/clear helpers.
2. Keep Step 5 scope limited to compare-state foundations before tray/button islands.

## Active Decisions

- `src/features/` directory is planned for Step 5+ (not yet populated).
- No pending tracked tasks.
