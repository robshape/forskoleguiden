# [TASK010] - Implement Step 5.1 compare store

**Status**: Completed
**Added**: 2026-03-06
**Updated**: 2026-03-06

## Original Request

Implement Step 5.1 from the approved compare-store plan in `docs/plans/step-5-1-compare-store-plan.md`.

Scope for this task:

- Phase 1: create failing unit tests that define compare-store behavior.
- Phase 2: add `src/lib/state.ts` with SSR-safe nanostore compare state and `sessionStorage` persistence.
- Phase 3: validate the completed work against the required quality gates and sync the memory bank/task tracking.

## Thought Process

Step 5.1 is foundation-only work, so the implementation needed to stay out of compare-button and compare-tray UI. The safest path was to lock the behavior at the store boundary first with focused unit tests, then add the smallest `nanostores` implementation that centralizes the five-school cap and remains safe to import during Astro SSR.

## Implementation Plan

- Phase 1: Write failing unit tests for empty SSR initialization, toggle add/remove, clear, five-item cap, and pre-hydration from `sessionStorage`.
- Phase 2: Create `src/lib/state.ts` with `atom<string[]>`, browser-guarded hydration/persistence helpers, and exported `MAX_COMPARE`, `toggleCompare()`, and `clearCompare()`.
- Phase 3: Confirm required quality gates remain green and update memory-bank status/task files to mark Step 5.1 complete.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID   | Description                        | Status   | Updated    | Notes                                            |
| ---- | ---------------------------------- | -------- | ---------- | ------------------------------------------------ |
| 10.1 | Define failing compare-store tests | Complete | 2026-03-06 | SSR, toggle, clear, cap, hydration               |
| 10.2 | Implement SSR-safe compare store   | Complete | 2026-03-06 | compareIds plus guarded persistence              |
| 10.3 | Validate Step 5.1 quality gates    | Complete | 2026-03-06 | Follow-up: 18 unit + 8 e2e; `pnpm check` blocked |
| 10.4 | Sync memory bank and task tracking | Complete | 2026-03-06 | Updated status files and task index              |

## Progress Log

### 2026-03-06 (Phase 1)

- Added failing BDD-style unit coverage in `tests/unit/compare-store-state-behavior.test.ts` to define the Step 5.1 contract before store code existed.
- Covered SSR-safe default state, toggle add/remove, clear behavior, hard-cap enforcement, and hydration from pre-existing `sessionStorage`.
- Confirmed the failure mode was limited to the missing compare-store module, which kept scope clean for Phase 2.

### 2026-03-06 (Phase 2)

- Added `src/lib/state.ts` with a `nanostores` `atom<string[]>` compare store and centralized five-item cap enforcement.
- Implemented browser-guarded hydration/persistence so Astro SSR and Vitest node imports remain safe without `window` or `sessionStorage`.
- Brought the Phase 1 compare-store tests to green without introducing any Step 5.2 or Step 5.3 UI work.

### 2026-03-06 (Phase 3 closure)

- Verified the original Step 5.1 closure against the then-current workspace validation state before the later hardening follow-up.
- Updated memory-bank status files and task tracking to mark Steps 0–5.1 complete and reflect the then-current total of 17 unit tests + 8 e2e tests = 25.
- Kept this phase limited to documentation and verification updates only, with Step 5.2 compare button and Step 5.3 compare tray retained as the next focus.

### 2026-03-06 (Hardening follow-up)

- Kept the writable compare atom private, exported `compareIds` as a read-only store, and exported `COMPARE_STORAGE_KEY` for reuse by tests and future consumers.
- Replaced persistence registration via `subscribe()` with `listen()` so importing the store in a browser context does not immediately write `[]` back to `sessionStorage`.
- Extended compare-store tests to cover write-back after `toggleCompare()` and `clearCompare()`, plus corrupt persisted payload fallback for invalid JSON and non-array JSON values.
- Revalidated with `pnpm lint`, `pnpm lint:md`, `pnpm format:check`, targeted compare-store Vitest, and full `pnpm test`; `pnpm check` is still blocked because `@astrojs/check` is not installed in the repo.
