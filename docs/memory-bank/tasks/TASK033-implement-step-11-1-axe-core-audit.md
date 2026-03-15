# [TASK033] - Implement Step 11.1 axe-core audit

**Status**: Completed
**Added**: 2026-03-15
**Updated**: 2026-03-15

## Original Request

Implement Step 11.1 from `docs/implementation-plan.md`: run `@axe-core/playwright` accessibility checks on `/sv/`, `/sv/forskola/{any-id}/`, and `/sv/jamfor/` with 2+ preschools selected.

## Thought Process

The repo already had Playwright, `@axe-core/playwright`, and one comparison-page-specific accessibility regression inside the comparison route spec, so the missing work was a dedicated route-level Step 11.1 contract rather than new app behavior. The main design choice was to keep the change test-only unless the audits surfaced real violations, and to use hydration guards for each route so axe would scan the actual hydrated UI instead of partially rendered island markup.

## Implementation Plan

- Add a dedicated Playwright accessibility spec for the three required Swedish routes.
- Use route-specific hydration guards before each axe run, and keep comparison-state seeding inline unless duplication becomes material.
- Validate the change with the narrow accessibility spec and `pnpm validate`, then record the completed step in the plan and memory bank.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                | Status   | Updated    | Notes                                          |
| --- | ------------------------------------------ | -------- | ---------- | ---------------------------------------------- |
| 1.1 | Add directory-page axe audit               | Complete | 2026-03-15 | Added `/sv/` audit with SortToggle guard       |
| 1.2 | Add detail-page axe audit                  | Complete | 2026-03-15 | Added detail audit with compare-button guard   |
| 1.3 | Add comparison-page axe audit and validate | Complete | 2026-03-15 | Added seeded comparison audit and ran validate |

## Progress Log

### 2026-03-15

- Created `tests/e2e/accessibility-axe-core.spec.ts` as the dedicated Step 11.1 accessibility suite and added a `wcag2a` / `wcag2aa` axe contract for the Swedish directory page
- Extended the same spec with a detail-page audit for `almgardens-forskola`, using the hydrated client-only compare button as the readiness signal
- Added a comparison-page audit that seeds `sessionStorage` with `almgardens-forskola` and `augustenborgs-forskola`, waits for the comparison table and chart SVGs, and then runs axe against the rendered comparison state
- Ran the targeted accessibility spec and `pnpm validate`; both finished green after a one-file Prettier correction in the new spec
- Updated the Step 11.1 plan checkpoints, created the plan completion record, and advanced the memory bank's next focus to Steps 11.2 and 11.3
