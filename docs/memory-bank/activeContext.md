# Active Context

## Current State

Steps 0–6.1 are complete, and Husky pre-commit integration remains in place. In addition to the ranked `/sv/` directory, compare store, compare buttons, and global compare tray, the repo now ships statically generated Swedish preschool detail pages at `src/pages/sv/forskola/[id].astro` for every Malmö preschool in the index. Those pages reuse `BaseLayout.astro`, render the preschool metadata plus a minimal Helhetsbedömning section, mount the existing `CompareButton` island with the same sessionStorage-backed behavior used on directory cards, and now type their page props explicitly while localizing the back-navigation landmark label through the same i18n copy as the visible link. `pnpm validate` is green, the detail-page contract suite now also covers the click path from the directory into the detail route, and the test suite now stands at 25 unit + 26 e2e = 51 total.

Key completed milestones:

- **Step 1**: Data layer (types, data loading, scoring) in `src/lib/`
- **Step 2**: i18n foundation (sv/en/ar locales, `t()` with interpolation, locale routing)
- **Step 3**: Layout shell + design foundations (BaseLayout, Nav, Footer, CityYearSelector, global tokens)
- **Step 4**: Directory page — build-time data assembly, PreschoolCard component, score-desc ranking with deterministic tie-breaks, interactive SortToggle Preact island, full a11y (aria-live, localized labels, keyboard focus)
- **Step 5.1**: compare-store foundation in `src/lib/state.ts` with `compareIds`, `toggleCompare`, `clearCompare`, SSR-safe `sessionStorage` hydration/persistence, and unit coverage for default/toggle/clear/max-cap/hydration behavior
- **Step 5.2**: compare button island wired into `PreschoolCard.astro` with localized selected/unselected labels, preschool-specific accessible naming, and e2e coverage for select/deselect pressed-state behavior
- **Step 5.3**: global compare tray island in `src/components/preact/CompareTray.tsx`, mounted from `BaseLayout.astro` with locale-aware labels and build-time route-availability detection; tray visibility, disabled compare semantics, reload recovery, clear behavior, keyboard access, and footer-safe spacing covered by dedicated e2e tests
- **Step 5.4**: MPA persistence verified — compare selections and compare-button pressed-state survive Astro cross-page navigations backed by `sessionStorage`; minimal `/sv/om/` Astro page added as MPA navigation target; three new Playwright cross-page persistence scenarios added to `compare-tray-interaction.spec.ts` (9 total in that spec)
- **Step 6.1**: Swedish preschool detail pages implemented — `src/pages/sv/forskola/[id].astro` uses `getStaticPaths()` with the Malmö index and survey loaders, renders preschool name/address/operator/year plus Helhetsbedömning question content, and reuses the existing `CompareButton` island. The page now types `Astro.props` explicitly and localizes the back-navigation landmark label via existing i18n copy. Dedicated e2e coverage in `tests/e2e/preschool-detail-page-contract.spec.ts` verifies route generation, metadata, content, compare interaction, and the click path from the directory into the detail route.
- **Husky pre-commit hook**: Husky 9.1.7 installed; `prepare` script wired so `husky` runs on `pnpm install`; `.husky/pre-commit` runs `pnpm validate` before every commit; CI install steps use `HUSKY: 0` so hook registration is skipped on CI; a 7-test unit contract covers all integration points, including step-scoped workflow assertions for the `Install dependencies` step; `pnpm validate` remains green after the Step 6.1 work

## Next Focus

1. Implement Step 6.2 so preschool detail pages render the full five-response breakdown instead of the current minimal single-percentage display.
2. Implement Step 7 to add `/sv/jamfor/` and let the existing layout-level route-availability check enable the tray CTA without changing the Step 5.3 tray contract.

## Active Decisions

- Session-backed compare state stays in `src/lib/state.ts` for now and must remain safe to import during Astro SSR/prerender.
- Step 5.3 intentionally keeps the tray count-based only; selected preschool names and pluralization refinements stay out of scope until a later UX pass.
- Step 5.3 keeps the compare CTA rendered as a focusable `aria-disabled` button until the matching `/jamfor/` route exists for the current locale. When the route is added later, the layout-level availability check can re-enable the live navigation path.
- The fixed tray writes its measured height to `--tray-height`, and the base layer reserves that space on `body` so footer/content remain scrollable above the tray.
- The compare tray is mounted as `client:only="preact"` rather than `client:load` to avoid a reload-time hydration mismatch between SSR-empty tray markup and client-persisted compare selections.
- Step 5.4 confirmed that `sessionStorage`-backed compare state already survived MPA navigation correctly — no compare-store or island code changes were needed; only the missing `/sv/om/` route and tighter Playwright response null-guard were required.
- Step 6.1 keeps the detail-page response display intentionally minimal by showing only a visible percentage per Helhetsbedömning question; the full five-label response breakdown remains deferred to Step 6.2.
