# [TASK002] - Implement root redirect '/' -> '/sv/' (Step 3.4)

**Status**: Completed
**Added**: 2026-02-26
**Updated**: 2026-03-02

## Original Request

Track unfinished work to implement the root redirect from `/` to `/sv/` in Step 3.4; do not implement redirect in this review-fix pass.

## Thought Process

The root page currently remains a temporary placeholder. Redirect behavior is intentionally deferred to Step 3.4 when localized route structure is in place, so this task keeps that requirement explicit and visible.

## Implementation Plan

- Implement Astro redirect config for `/` to `/sv/` during Step 3.4.
- Replace/remove temporary root placeholder page as needed by the chosen redirect approach.
- Verify redirect behavior in dev and production build output.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                                | Status   | Updated    | Notes                                                             |
| --- | ---------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------- |
| 2.1 | Add redirect rule for `/` -> `/sv/` in Astro config        | Complete | 2026-03-02 | Implemented via `redirects: { '/': '/sv/' }` in `astro.config.ts` |
| 2.2 | Resolve interaction with temporary `src/pages/index.astro` | Complete | 2026-03-02 | Removed temporary meta-refresh root page                          |
| 2.3 | Validate redirect in dev and build artifacts               | Complete | 2026-03-02 | Fail-first unit test and build artifact verification completed    |

## Progress Log

### 2026-02-26

- Created task from review feedback to track Step 3.4 redirect explicitly.
- Kept redirect out of this patch per scope constraint.

### 2026-03-02

- Added fail-first regression coverage in `tests/unit/root-redirect.test.ts` for Astro redirect config and root placeholder-page removal.
- Implemented Step 3.4 by adding `redirects: { '/': '/sv/' }` in `astro.config.ts`.
- Removed temporary root `src/pages/index.astro` meta-refresh implementation to avoid route ownership ambiguity.
- Verified green targeted test + build output redirect evidence (`dist/index.html` redirects to `/sv/`).
- Ran required repository gates successfully: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.

### 2026-03-02 (review hardening follow-up)

- Replaced brittle source-text regex checks in `tests/unit/root-redirect.test.ts` with direct object assertions against imported Astro config.
- Removed the vacuous file non-existence assertion for `src/pages/index.astro`.
- Added runtime redirect e2e coverage in `tests/e2e/smoke.spec.ts` to assert `page.goto('/')` lands on `/sv/`.
- Verified targeted validation: `pnpm test tests/unit/root-redirect.test.ts` and `pnpm build && CI=1 pnpm test:e2e tests/e2e/smoke.spec.ts`.
- Re-verified required quality gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
