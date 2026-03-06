# Active Context

## Current State

Steps 0–5.3 are complete. The `/sv/` directory page now includes the full Step 5 compare foundation so far: ranked preschool cards, the shared compare store, store-backed compare buttons, and a global compare tray mounted from `BaseLayout.astro`. The tray reflects `compareIds`, shows the localized selected-count text, keeps the compare action disabled until a locale-matching `/jamfor/` route exists, reserves body space via a tray-height CSS variable so bottom content stays visible, and clears selections while keeping compare-button state in sync even after a full page reload. `pnpm exec playwright test tests/e2e/compare-tray-interaction.spec.ts`, `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, `pnpm check`, and `pnpm test` are green. Test suite: 18 unit + 15 e2e = 33 total.

Key completed milestones:

- **Step 1**: Data layer (types, data loading, scoring) in `src/lib/`
- **Step 2**: i18n foundation (sv/en/ar locales, `t()` with interpolation, locale routing)
- **Step 3**: Layout shell + design foundations (BaseLayout, Nav, Footer, CityYearSelector, global tokens)
- **Step 4**: Directory page — build-time data assembly, PreschoolCard component, score-desc ranking with deterministic tie-breaks, interactive SortToggle Preact island, full a11y (aria-live, localized labels, keyboard focus)
- **Step 5.1**: compare-store foundation in `src/lib/state.ts` with `compareIds`, `toggleCompare`, `clearCompare`, SSR-safe `sessionStorage` hydration/persistence, and unit coverage for default/toggle/clear/max-cap/hydration behavior
- **Step 5.2**: compare button island wired into `PreschoolCard.astro` with localized selected/unselected labels, preschool-specific accessible naming, and e2e coverage for select/deselect pressed-state behavior
- **Step 5.3**: global compare tray island in `src/components/preact/CompareTray.tsx`, mounted from `BaseLayout.astro` with locale-aware labels and build-time route-availability detection; tray visibility, disabled compare semantics, reload recovery, clear behavior, keyboard access, and footer-safe spacing covered by dedicated e2e tests

## Next Focus

1. Start the next compare-flow step without changing the Step 5.3 tray contract.
2. Keep the comparison page route and any tray-detail enhancements deferred until their planned steps.

## Active Decisions

- `src/features/` directory is planned for later Step 5+ feature modules (not yet populated).
- Session-backed compare state stays in `src/lib/state.ts` for now and must remain safe to import during Astro SSR/prerender.
- Step 5.3 intentionally keeps the tray count-based only; selected preschool names and pluralization refinements stay out of scope until a later UX pass.
- Step 5.3 keeps the compare CTA rendered as a focusable `aria-disabled` button until the matching `/jamfor/` route exists for the current locale. When the route is added later, the layout-level availability check can re-enable the live navigation path.
- The fixed tray writes its measured height to `--tray-height`, and the base layer reserves that space on `body` so footer/content remain scrollable above the tray.
- The compare tray is mounted as `client:only="preact"` rather than `client:load` to avoid a reload-time hydration mismatch between SSR-empty tray markup and client-persisted compare selections.
