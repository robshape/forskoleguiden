# Active Context

## Current State

Steps 0–5.1 are complete. The `/sv/` directory page renders ranked preschool cards with an interactive sort toggle (Rankning / A–Ö), and `src/lib/state.ts` now provides the compare-store foundation for Step 5 UI work. The Step 5.1 hardening follow-up now keeps the writable atom private, exports a read-only `compareIds` store plus `COMPARE_STORAGE_KEY`, and avoids immediate persistence writes on module registration. `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, and `pnpm test` are green. `pnpm check` is currently blocked because `@astrojs/check` is not installed. Test suite: 18 unit + 8 e2e = 26 total.

Key completed milestones:

- **Step 1**: Data layer (types, data loading, scoring) in `src/lib/`
- **Step 2**: i18n foundation (sv/en/ar locales, `t()` with interpolation, locale routing)
- **Step 3**: Layout shell + design foundations (BaseLayout, Nav, Footer, CityYearSelector, global tokens)
- **Step 4**: Directory page — build-time data assembly, PreschoolCard component, score-desc ranking with deterministic tie-breaks, interactive SortToggle Preact island, full a11y (aria-live, localized labels, keyboard focus)
- **Step 5.1**: compare-store foundation in `src/lib/state.ts` with `compareIds`, `toggleCompare`, `clearCompare`, SSR-safe `sessionStorage` hydration/persistence, and unit coverage for default/toggle/clear/max-cap/hydration behavior

## Next Focus

1. Start Step 5.2 compare button wiring and limit-state UX against the shared compare store.
2. Start Step 5.3 compare tray UI to surface persistent selections and the compare CTA.

## Active Decisions

- `src/features/` directory is planned for later Step 5+ feature modules (not yet populated).
- Session-backed compare state stays in `src/lib/state.ts` for now and must remain safe to import during Astro SSR/prerender.
