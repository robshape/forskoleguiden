# [TASK011] - Implement Step 5.2 compare button

**Status**: Completed
**Added**: 2026-03-06
**Updated**: 2026-03-06

## Original Request

Implement Step 5.2 from the approved compare-button plan in `docs/plans/completed/step-5-2-compare-button-plan.md`.

Scope for this task:

- Phase 1: create failing tests that define compare-button behavior on the Swedish directory page.
- Phase 2: add the interactive compare button island and replace the static directory-card placeholder.
- Phase 3: validate the completed work against the required quality gates and sync the memory bank/task tracking.

## Thought Process

Step 5.2 should stay tightly scoped to the add-to-compare interaction itself. The store already exists, so the safest path is to define the browser interaction contract first, then swap the static button in the preschool card for a minimal Preact island that subscribes to the shared compare state without pulling compare-tray work into the same change.

## Implementation Plan

- Phase 1: Write failing browser coverage for selected and deselected compare-button behavior, plus any copy-contract assertions needed for new button labels.
- Phase 2: Create `src/components/preact/CompareButton.tsx`, wire it into `PreschoolCard.astro`, and update locale files for selected-state copy.
- Phase 3: Re-run the required repo quality gates and update memory-bank status/task files to mark Step 5.2 complete.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID   | Description                          | Status   | Updated    | Notes                                                       |
| ---- | ------------------------------------ | -------- | ---------- | ----------------------------------------------------------- |
| 11.1 | Define failing compare-button tests  | Complete | 2026-03-06 | Added failing e2e and copy-contract coverage                |
| 11.2 | Implement interactive compare button | Complete | 2026-03-06 | Store-backed island wired and targeted tests green          |
| 11.3 | Validate Step 5.2 quality gates      | Complete | 2026-03-06 | All required gates green; targeted e2e rerun green          |
| 11.4 | Sync memory bank and task tracking   | Complete | 2026-03-06 | Active context, progress, index, and completion doc updated |

## Progress Log

### 2026-03-06

- Approved the Step 5.2 plan and created the plan/task artifacts.
- Confirmed the implementation surface is limited to the compare-button island, preschool card integration, locale copy parity, and targeted e2e coverage.
- Began Phase 1 to lock the selected and deselected compare-button behavior in failing tests before UI implementation.

### 2026-03-06 (Phase 1 complete)

- Added failing e2e coverage in `tests/e2e/directory-data-rendering.spec.ts` for selecting two compare buttons, asserting `aria-pressed`, then deselecting one while the other remains selected.
- Extended the Swedish copy contract to require `directory.addedToCompare` with the approved selected-state copy `Tillagd`.
- Verified both targeted test commands fail for the expected reasons and received review approval to proceed to Phase 2 without broadening scope.

### 2026-03-06 (Phase 2 complete)

- Confirmed the existing partial implementation already wired `CompareButton.tsx` into `PreschoolCard.astro` with store-backed selected state, localized labels, and `aria-pressed` semantics.
- Fixed the Phase 2 blocker in `tests/e2e/directory-data-rendering.spec.ts` by waiting for the Astro compare-button islands to hydrate before clicking and by replacing the invalid helper typing with the explicit Playwright `Page` type.
- Revalidated the phase with `pnpm build`, `pnpm playwright test tests/e2e/directory-data-rendering.spec.ts`, and `pnpm vitest run tests/unit/i18n-swedish-copy-contract.test.ts`, then received review approval to stop before Phase 3.

### 2026-03-06 (Phase 3 closure)

- Ran the required validation sequence in repo gate order: `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, `pnpm check`, and `pnpm test`; all commands passed in the current workspace.
- Confirmed `pnpm check` is no longer blocked: `astro check` completed with 0 errors, 0 warnings, and 0 hints across 37 files.
- Reran the focused compare-button browser coverage with `pnpm exec playwright test tests/e2e/directory-data-rendering.spec.ts`; all 5 tests passed.
- Updated Step 5.2 completion tracking so the memory bank now reflects Steps 0–5.2 complete and Step 5.3 compare tray as the next focus.
