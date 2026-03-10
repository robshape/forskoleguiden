# [TASK018] - Fix Step 7.1 comparison clear-state regression

**Status**: Completed
**Added**: 2026-03-10
**Updated**: 2026-03-10

## Original Request

Fix the Step 7.1 regression where clearing compare selections from `/sv/jamfor/` redirected the user back to `/sv/` instead of leaving them on the comparison page with the empty state visible.

## Thought Process

The Step 7.1 shell already had the correct zero-selection render branch inside `ComparisonView`, but a follow-up redirect effect overrode it whenever the page mounted with selections and `compareIds` later became empty. That behavior conflicted with the implementation plan and hid the comparison page's own empty state after `Rensa`. The safest fix is to remove the redirect entirely and strengthen e2e coverage around the clear-on-comparison-page transition so the route stays on `/sv/jamfor/` and renders the empty state for both mouse and keyboard flows.

## Implementation Plan

- Phase 1: add failing regression coverage for clearing compare selections while already on `/sv/jamfor/`.
- Phase 2: remove the redirect-on-clear behavior from `ComparisonView` and make the new tests pass.
- Phase 3: rerun validation and sync memory-bank artifacts.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID   | Description                                             | Status   | Updated    | Notes                                                                  |
| ---- | ------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------- |
| 18.1 | Add failing clear-state regression coverage             | Complete | 2026-03-10 | Added direct clear-on-`/sv/jamfor/` e2e plus updated keyboard flow     |
| 18.2 | Remove redirect-on-clear behavior from `ComparisonView` | Complete | 2026-03-10 | Empty state now renders reactively whenever `compareIds` becomes empty |
| 18.3 | Verify validation pipeline and sync documentation       | Complete | 2026-03-10 | `pnpm validate` green; targeted e2e 12/12 passing; memory-bank synced  |

## Progress Log

### 2026-03-10

- Confirmed the current `ComparisonView` implementation still redirects to the directory when compare selections are cleared after the page mounts with an existing compare set.
- Confirmed the direct-empty-state test and keyboard tray test did not cover the selected-to-empty transition on `/sv/jamfor/`.

### 2026-03-10 — Phase 1

- Added a focused Playwright regression in `tests/e2e/comparison-page-route-shell.spec.ts` that seeds `sessionStorage`, lands on `/sv/jamfor/`, clears via `Rensa`, and asserts the route stays on `/sv/jamfor/` with the empty state visible.
- Updated the keyboard-accessibility scenario in `tests/e2e/compare-tray-interaction.spec.ts` so clearing from the comparison page now expects the user to remain on `/sv/jamfor/` and see the empty state.
- Verified both tests failed for the expected reason only: the page redirected to `/sv/` instead of staying on the comparison route.

### 2026-03-10 — Phase 2

- Removed the redirect effect from `src/components/preact/ComparisonView.tsx`, leaving the existing `ids.length === 0` render branch as the sole clear-state behavior.
- Cleaned up the now-unneeded `useEffect` and `useRef` imports.
- Updated the new regression test comments so they describe the current sessionStorage precondition instead of the removed internal implementation detail.

### 2026-03-10 — Phase 3

- Ran `pnpm validate` successfully.
- Ran `pnpm test:e2e -- tests/e2e/comparison-page-route-shell.spec.ts tests/e2e/compare-tray-interaction.spec.ts` successfully with 12/12 passing tests.
- Updated memory-bank status and task tracking to reflect the corrected Step 7.1 clear-state behavior.
