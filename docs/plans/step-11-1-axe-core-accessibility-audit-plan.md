# Plan: Step 11.1 Axe-Core Audit

Step 11.1 is mostly test work because the repo already ships Playwright, `@axe-core/playwright`, and route coverage for the three required pages. The gap is a dedicated accessibility suite that proves the directory page, a preschool detail page, and the comparison page with a seeded 2-school selection all pass `wcag2a` and `wcag2aa` axe checks with reliable hydration guards.

## Phases

1. **Phase 1: Add Directory-Page Axe Coverage**
   - **Objective**: Create the Step 11.1 accessibility spec and lock the Swedish directory page to zero `wcag2a` and `wcag2aa` axe violations.
   - **Files/Functions to Modify/Create**: `tests/e2e/accessibility-axe-core.spec.ts`
   - **Tests to Write**: directory page has zero axe-core violations at `wcag2a` and `wcag2aa`
   - **Steps**:
     1. Add a failing Playwright accessibility test for `/forskoleguiden/sv/`.
     2. Wait for the directory page hydration boundary that makes the audit deterministic.
     3. Run the targeted test, fix any real violations if they exist, and re-run until green.

2. **Phase 2: Add Detail-Page Axe Coverage**
   - **Objective**: Audit a generated Swedish preschool detail page and make the scan reliable around the client-only compare button.
   - **Files/Functions to Modify/Create**: `tests/e2e/accessibility-axe-core.spec.ts`
   - **Tests to Write**: detail page has zero axe-core violations at `wcag2a` and `wcag2aa`
   - **Steps**:
     1. Add a failing Playwright accessibility test for `/forskoleguiden/sv/forskola/almgardens-forskola/`.
     2. Wait for the compare button hydration signal before running axe.
     3. Run the targeted test, fix any real violations if they exist, and re-run until green.

3. **Phase 3: Add Comparison-Page Axe Coverage and Validate**
   - **Objective**: Audit the comparison page with 2 seeded preschools selected, then verify the full repo still validates cleanly.
   - **Files/Functions to Modify/Create**: `tests/e2e/accessibility-axe-core.spec.ts`, `tests/e2e/fixtures.ts` only if a tiny compare-state helper materially reduces duplication
   - **Tests to Write**: comparison page with 2 selected preschools has zero axe-core violations at `wcag2a` and `wcag2aa`
   - **Steps**:
     1. Add a failing Playwright accessibility test for `/forskoleguiden/sv/jamfor/` with deterministic compare-state seeding.
     2. Reuse or extract the minimal helper needed to seed `sessionStorage` compare ids before navigation.
     3. Wait for the comparison table and chart islands to hydrate before running axe.
     4. Run the targeted accessibility spec, then run `pnpm validate` to confirm the repo remains green.

## Open Questions

1. Keep the existing chart-specific comparison axe test in `tests/e2e/comparison-page-route-shell.spec.ts`? Recommendation: yes, because it guards chart/table ARIA wiring while the new spec covers Step 11.1 route-level accessibility.
2. Extract a shared compare-state seeding helper or keep the current inline pattern? Recommendation: only extract it if the new spec would otherwise duplicate the exact same setup more than once.

## Phase Checkpoints

- Phase 1 complete (2026-03-15): Added `tests/e2e/accessibility-axe-core.spec.ts` with a dedicated directory-page axe audit scoped to `wcag2a` and `wcag2aa`, guarded by the hydrated `SortToggle` state.
- Phase 2 complete (2026-03-15): Extended `tests/e2e/accessibility-axe-core.spec.ts` with a detail-page axe audit for `almgardens-forskola`, guarded by the hydrated client-only compare button state.
- Phase 3 complete (2026-03-15): Extended `tests/e2e/accessibility-axe-core.spec.ts` with a 2-school comparison-page axe audit, kept sessionStorage seeding inline, and finished with a green `pnpm validate` run.
