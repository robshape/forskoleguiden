# Active Context

## Current State

Steps 0–5.2 are complete. The `/sv/` directory page renders ranked preschool cards with an interactive sort toggle (Rankning / A–Ö), compare-store foundation, and a store-backed compare button island that reflects selected state with localized labels and `aria-pressed` semantics. The Step 5.1 hardening follow-up keeps the writable atom private, exports a read-only `compareIds` store plus `COMPARE_STORAGE_KEY`, and avoids immediate persistence writes on module registration. `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, `pnpm check`, and `pnpm test` are green. Targeted Step 5.2 browser coverage also passes via `pnpm exec playwright test tests/e2e/directory-data-rendering.spec.ts` (5 tests). Test suite: 18 unit + 9 e2e = 27 total.

Key completed milestones:

- **Step 1**: Data layer (types, data loading, scoring) in `src/lib/`
- **Step 2**: i18n foundation (sv/en/ar locales, `t()` with interpolation, locale routing)
- **Step 3**: Layout shell + design foundations (BaseLayout, Nav, Footer, CityYearSelector, global tokens)
- **Step 4**: Directory page — build-time data assembly, PreschoolCard component, score-desc ranking with deterministic tie-breaks, interactive SortToggle Preact island, full a11y (aria-live, localized labels, keyboard focus)
- **Step 5.1**: compare-store foundation in `src/lib/state.ts` with `compareIds`, `toggleCompare`, `clearCompare`, SSR-safe `sessionStorage` hydration/persistence, and unit coverage for default/toggle/clear/max-cap/hydration behavior
- **Step 5.2**: compare button island wired into `PreschoolCard.astro` with localized selected/unselected labels, preschool-specific accessible naming, and e2e coverage for select/deselect pressed-state behavior

## Next Focus

1. Start Step 5.3 compare tray UI to surface persistent selections and the compare CTA.
2. Keep Step 5.4+ work deferred until the tray flow is in place and validated.

## Active Decisions

- `src/features/` directory is planned for later Step 5+ feature modules (not yet populated).
- Session-backed compare state stays in `src/lib/state.ts` for now and must remain safe to import during Astro SSR/prerender.
- Step 5.2 remains limited to per-card compare-button interaction; the five-item limit explanation and persistent tray UX stay deferred to Step 5.3.
