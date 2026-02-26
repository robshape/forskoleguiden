# [TASK002] - Implement root redirect '/' -> '/sv/' (Step 3.4)

**Status**: Pending
**Added**: 2026-02-26
**Updated**: 2026-02-26

## Original Request

Track unfinished work to implement the root redirect from `/` to `/sv/` in Step 3.4; do not implement redirect in this review-fix pass.

## Thought Process

The root page currently remains a temporary placeholder. Redirect behavior is intentionally deferred to Step 3.4 when localized route structure is in place, so this task keeps that requirement explicit and visible.

## Implementation Plan

- Implement Astro redirect config for `/` to `/sv/` during Step 3.4.
- Replace/remove temporary root placeholder page as needed by the chosen redirect approach.
- Verify redirect behavior in dev and production build output.

## Progress Tracking

**Overall Status**: Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
| - | - | - | - | - |
| 2.1 | Add redirect rule for `/` -> `/sv/` in Astro config | Not Started | 2026-02-26 | Execute only in Step 3.4 |
| 2.2 | Resolve interaction with temporary `src/pages/index.astro` | Not Started | 2026-02-26 | Remove or replace placeholder when redirect lands |
| 2.3 | Validate redirect in dev and build artifacts | Not Started | 2026-02-26 | Confirm expected route behavior |

## Progress Log

### 2026-02-26

- Created task from review feedback to track Step 3.4 redirect explicitly.
- Kept redirect out of this patch per scope constraint.
