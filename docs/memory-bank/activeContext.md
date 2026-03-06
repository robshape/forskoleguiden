# Active Context

## Current State

Steps 0–5.4 are complete. The `/sv/` directory page now includes the full Step 5 compare foundation: ranked preschool cards, the shared compare store, store-backed compare buttons, a global compare tray mounted from `BaseLayout.astro`, and verified MPA persistence so compare selections survive Astro page navigations. A secondary `/sv/om/` page (`src/pages/sv/om/index.astro`) was added as the minimal MPA navigation target. The `compare-tray-interaction.spec.ts` Playwright suite was expanded with three cross-page persistence scenarios. `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, `pnpm check`, `pnpm test`, and `pnpm exec playwright test tests/e2e/compare-tray-interaction.spec.ts` are all green. Test suite: 18 unit + 18 e2e = 36 total.

Key completed milestones:

- **Step 1**: Data layer (types, data loading, scoring) in `src/lib/`
- **Step 2**: i18n foundation (sv/en/ar locales, `t()` with interpolation, locale routing)
- **Step 3**: Layout shell + design foundations (BaseLayout, Nav, Footer, CityYearSelector, global tokens)
- **Step 4**: Directory page — build-time data assembly, PreschoolCard component, score-desc ranking with deterministic tie-breaks, interactive SortToggle Preact island, full a11y (aria-live, localized labels, keyboard focus)
- **Step 5.1**: compare-store foundation in `src/lib/state.ts` with `compareIds`, `toggleCompare`, `clearCompare`, SSR-safe `sessionStorage` hydration/persistence, and unit coverage for default/toggle/clear/max-cap/hydration behavior
- **Step 5.2**: compare button island wired into `PreschoolCard.astro` with localized selected/unselected labels, preschool-specific accessible naming, and e2e coverage for select/deselect pressed-state behavior
- **Step 5.3**: global compare tray island in `src/components/preact/CompareTray.tsx`, mounted from `BaseLayout.astro` with locale-aware labels and build-time route-availability detection; tray visibility, disabled compare semantics, reload recovery, clear behavior, keyboard access, and footer-safe spacing covered by dedicated e2e tests
- **Step 5.4**: MPA persistence verified — compare selections and compare-button pressed-state survive Astro cross-page navigations backed by `sessionStorage`; minimal `/sv/om/` Astro page added as MPA navigation target; three new Playwright cross-page persistence scenarios added to `compare-tray-interaction.spec.ts` (9 total in that spec)

## Next Focus

1. Begin Step 5.5+ or the next compare-flow step (comparison page route, shortlist, or sharing) without changing the stable tray and MPA-persistence contracts.
2. Keep the comparison page route and any tray-detail enhancements deferred until their planned steps.

## Active Decisions

- Session-backed compare state stays in `src/lib/state.ts` for now and must remain safe to import during Astro SSR/prerender.
- Step 5.3 intentionally keeps the tray count-based only; selected preschool names and pluralization refinements stay out of scope until a later UX pass.
- Step 5.3 keeps the compare CTA rendered as a focusable `aria-disabled` button until the matching `/jamfor/` route exists for the current locale. When the route is added later, the layout-level availability check can re-enable the live navigation path.
- The fixed tray writes its measured height to `--tray-height`, and the base layer reserves that space on `body` so footer/content remain scrollable above the tray.
- The compare tray is mounted as `client:only="preact"` rather than `client:load` to avoid a reload-time hydration mismatch between SSR-empty tray markup and client-persisted compare selections.
- Step 5.4 confirmed that `sessionStorage`-backed compare state already survived MPA navigation correctly — no compare-store or island code changes were needed; only the missing `/sv/om/` route and tighter Playwright response null-guard were required.
