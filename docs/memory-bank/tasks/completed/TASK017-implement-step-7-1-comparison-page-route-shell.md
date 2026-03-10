# [TASK017] - Implement Step 7.1 comparison page route shell

**Status**: Completed
**Added**: 2026-03-09
**Updated**: 2026-03-09

## Original Request

Implement "Step 7.1" from the project implementation plan: add the `/sv/jamfor/` comparison route shell so the existing compare tray CTA can activate via the build-time route-availability check already wired in `BaseLayout.astro`.

## Thought Process

The compare tray (Step 5.3) already contains route-availability detection in `BaseLayout.astro` that conditionally enables the CTA once a matching `/jamfor/` file is found at build time. Step 7.1 is a deliberately narrow scope: create the Astro page at `src/pages/sv/jamfor/index.astro` and a minimal `ComparisonView` Preact island that renders an empty state, satisfying that check without pulling in full comparison data rendering. This avoids premature complexity — the data threading belongs in Step 7.2 once the shell is reviewed and approved.

A review after Phase 2 surfaced unused survey props that had been threaded into `ComparisonView`. These were removed in a follow-up pass before landing, keeping the island prop surface minimal and honest about what it currently does.

## Implementation Plan

- Phase 1: add failing e2e coverage for the comparison route shell (route availability and empty-state rendering) and confirm the tray CTA spec reflects a live link for Swedish.
- Phase 2: create `src/pages/sv/jamfor/index.astro` and `src/components/preact/ComparisonView.tsx` with the empty-state shell; wire localized string props from the Astro page.
- Phase 2 follow-up: remove dead unused survey props from `ComparisonView` surfaced during review.
- Phase 3: rerun targeted e2e coverage and `pnpm validate`, then sync memory-bank artifacts.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID   | Description                                                       | Status   | Updated    | Notes                                                                           |
| ---- | ----------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------- |
| 17.1 | Add failing comparison route shell e2e contract                   | Complete | 2026-03-09 | `comparison-page-route-shell.spec.ts` (2 tests) fails until route exists        |
| 17.2 | Create `/sv/jamfor/` Astro page and `ComparisonView` island       | Complete | 2026-03-09 | `src/pages/sv/jamfor/index.astro` + `src/components/preact/ComparisonView.tsx`  |
| 17.3 | Remove dead survey props from `ComparisonView` (review follow-up) | Complete | 2026-03-09 | Props anticipating Step 7.2 data threading removed; island surface kept minimal |
| 17.4 | Verify validation pipeline and update documentation               | Complete | 2026-03-09 | `pnpm validate` green; targeted e2e 11/11 passing; memory-bank sync complete    |

## Progress Log

### 2026-03-09

- Created the Step 7.1 task record after plan approval.
- Confirmed the existing `BaseLayout.astro` route-availability check uses `import.meta.glob` to detect compare-route files at build time and that no tray logic changes are required — landing `src/pages/sv/jamfor/index.astro` is sufficient to enable the CTA.
- Defined a four-phase path: failing e2e spec first, route shell second, review-driven prop cleanup third, verification and documentation last.

### 2026-03-09 — Phase 1

- Added `tests/e2e/comparison-page-route-shell.spec.ts` with two tests: one asserting the `/sv/jamfor/` route returns a 200, and one asserting the empty-state copy is visible when no preschools are selected.
- Confirmed the new spec failed as expected before the route existed.

### 2026-03-09 — Phase 2

- Created `src/pages/sv/jamfor/index.astro` with locale `sv`, using `t()` to derive the page title, empty-state title, empty-state body, and back-to-directory label.
- Created `src/components/preact/ComparisonView.tsx` accepting those four string props and rendering the empty state with localized copy and a back-to-directory link.
- Mounted `ComparisonView` as `client:only="preact"` to prevent SSR/hydration mismatches with client-state-driven empty-state detection.
- Reused the existing i18n keys (`compare.heading`, `compare.emptyStateTitle`, `compare.emptyStateBody`, `compare.actions.backToDirectory`) that were already present in `sv.json`, `en.json`, and `ar.json`.
- Confirmed the comparison route shell e2e spec now passed and that `compare-tray-interaction.spec.ts` reflected the CTA as a live link.

### 2026-03-09 — Phase 2 follow-up (review-driven)

- Review identified that `ComparisonView` had been receiving survey-data props (preschool index entries and survey map) that anticipated Step 7.2 but were unused in the shell.
- Removed those props from `ComparisonView` and the corresponding data-loading calls in `index.astro`, keeping the island prop surface honest: only localized strings are passed until Step 7.2 confirms the data shape.
- Reran targeted e2e after the cleanup; suite remained at 11/11 passing.

### 2026-03-09 — Phase 3

- Ran `pnpm test:e2e -- tests/e2e/comparison-page-route-shell.spec.ts tests/e2e/compare-tray-interaction.spec.ts` — 11/11 tests passed.
- Ran `pnpm validate` — lint, format check, type check, unit tests, and build all green.
- Updated `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, and `docs/memory-bank/tasks/_index.md` to reflect Steps 0–7.1 complete.
- Marked TASK017 complete.
