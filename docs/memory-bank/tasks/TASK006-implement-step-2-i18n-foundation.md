# [TASK006] - Implement Step 2 i18n foundation

**Status**: Pending
**Added**: 2026-02-27
**Updated**: 2026-02-27

## Original Request

Fix sequencing by explicitly tracking Step 2 i18n foundation as a prerequisite for Step 3.1-3.3 layout work that depends on `Locale` and translation utilities.

## Thought Process

The layout task (Step 3.1-3.3) references `Locale` from Step 2.3, so Step 2 must be completed first or the layout implementation will be incomplete or forced to use temporary placeholders.

## Implementation Plan

- Implement Step 2.1 Swedish translation file (`src/i18n/sv.json`).
- Implement Step 2.2 placeholder translation files (`src/i18n/en.json`, `src/i18n/ar.json`).
- Implement Step 2.3 `Locale` type plus `getLocaleFromURL()` and `t()` in `src/i18n/utils.ts`.
- Add and pass unit tests for locale detection and key lookup behavior.

## Progress Tracking

**Overall Status**: Not Started - 0%

### Subtasks

| ID  | Description                                      | Status      | Updated    | Notes                                         |
| --- | ------------------------------------------------ | ----------- | ---------- | --------------------------------------------- |
| 6.1 | Add `sv.json` Phase 1 keys                       | Not Started | 2026-02-27 | Step 2.1                                      |
| 6.2 | Add `en.json` and `ar.json` placeholder files    | Not Started | 2026-02-27 | Step 2.2                                      |
| 6.3 | Implement locale helpers in `src/i18n/utils.ts`  | Not Started | 2026-02-27 | Step 2.3                                      |
| 6.4 | Add/validate unit tests for i18n helper behavior | Not Started | 2026-02-27 | Locale path parsing and fallback key handling |

## Progress Log

### 2026-02-27

- Created task to track Step 2 explicitly as a dependency before Step 3.1-3.3.
- Recorded dependency link to `Locale` type usage in BaseLayout and related page wiring.
