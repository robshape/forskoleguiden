# [TASK015] - Implement Step 6.1 preschool detail page

**Status**: Completed
**Added**: 2026-03-07
**Updated**: 2026-03-07

## Original Request

Implement "Step 6: 6.1" from the project implementation plan by adding the Swedish preschool detail page route.

## Thought Process

The existing repo already had the prerequisites for Step 6.1: build-time Malmö data loaders, the shared `BaseLayout`, i18n helpers, and a sessionStorage-backed `CompareButton` island. The missing piece was the static route generation and page template under `src/pages/sv/forskola/[id].astro`. The work followed the conductor workflow: write failing e2e contract tests first, implement the smallest route that satisfies those tests, then verify against regressions and `pnpm validate`. Scope stayed intentionally narrow so Step 6.2 can still add the full five-response breakdown later without undoing the Step 6.1 page shell.

## Implementation Plan

- Phase 1: add failing e2e contract tests for generated Swedish preschool detail pages.
- Phase 2: implement `src/pages/sv/forskola/[id].astro` using build-time data, `BaseLayout`, and `CompareButton`.
- Phase 3: rerun detail-page coverage, compare/directory regressions, and `pnpm validate`; then sync the memory bank.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID   | Description                                | Status   | Updated    | Notes                                    |
| ---- | ------------------------------------------ | -------- | ---------- | ---------------------------------------- |
| 15.1 | Add failing detail-page contract tests     | Complete | 2026-03-07 | New Playwright spec for route and toggle |
| 15.2 | Implement Swedish preschool detail route   | Complete | 2026-03-07 | Added the Astro route and compare reuse  |
| 15.3 | Verify regressions and validation pipeline | Complete | 2026-03-07 | E2e regressions and validate run clean   |
| 15.4 | Sync memory bank and plan artifacts        | Complete | 2026-03-07 | Plan and memory-bank records updated     |

## Progress Log

### 2026-03-07 — Phase 1

- Created `tests/e2e/preschool-detail-page-contract.spec.ts` with seven failing tests covering route generation, metadata, Helhetsbedömning content, percentage visibility, and CompareButton interaction.
- Confirmed the new tests failed for the expected reason: the Swedish detail route did not exist yet.
- Review approved the failing-test scope as a correct Step 6.1 contract.

### 2026-03-07 — Phase 2

- Added `src/pages/sv/forskola/[id].astro`.
- Implemented `getStaticPaths()` from `getPreschoolIndex()` and `getPreschoolSurveyByYear()`.
- Rendered the preschool name, operator/address metadata, survey year, Helhetsbedömning section, visible percentage values, back link, and `CompareButton` using existing i18n keys.
- Verified the dedicated detail-page contract tests passed.

### 2026-03-07 — Phase 3

- Reran the new detail-page spec plus directory and compare regressions; all e2e coverage passed.
- Ran `pnpm validate`; first pass required Prettier cleanup, second pass exposed stale `vite@7.3.1` in `node_modules`, and a `pnpm install` resynced the install to the lockfile's pinned `vite@6.4.1`.
- Final validation passed: lint, markdown lint, format check, Astro check, unit tests, and build all green.
- Updated plan artifacts and memory-bank files; marked TASK015 completed.

### 2026-03-07 — Review follow-up hardening

- Localized the detail-page back-navigation landmark label by reusing `t('compare.actions.backToDirectory', locale)` for the `<nav>` `aria-label`.
- Added explicit `Props` typing for `Astro.props` in `src/pages/sv/forskola/[id].astro` so the route boundary is checked at compile time.
- Extended `tests/e2e/preschool-detail-page-contract.spec.ts` with a real click-through scenario from `/forskoleguiden/sv/` into the detail page.
- Rebuilt the static output, reran the targeted detail-page e2e spec, and reran `pnpm validate`; all checks passed.
