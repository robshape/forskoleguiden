# [TASK016] - Implement Step 6.2 preschool detail response breakdown

**Status**: Completed
**Added**: 2026-03-07
**Updated**: 2026-03-07

## Original Request

Implement "Step 6: 6.2" from the project implementation plan by rendering the full five-response Helhetsbedömning breakdown on Swedish preschool detail pages.

## Thought Process

Step 6.1 already created the static Swedish detail page route and rendered minimal question content, but it intentionally stopped after showing a single response percentage per question. Step 6.2 is a narrow follow-up: tighten the detail-page contract so it fails until all five canonical response labels and percentages are present, then update the detail-page template to render the full response distribution in canonical order from the existing i18n keys. The change should stay focused on the detail page and avoid pulling comparison-page or chart work forward.

## Implementation Plan

- Phase 1: add failing detail-page contract coverage for all five response labels and exact source-data percentages.
- Phase 2: update the Swedish detail-page route to render the five-category breakdown from i18n-driven labels.
- Phase 3: rerun targeted coverage and `pnpm validate`, then sync plan and memory-bank artifacts.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID   | Description                                         | Status   | Updated    | Notes                                                          |
| ---- | --------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------- |
| 16.1 | Add failing Step 6.2 detail-page contract tests     | Complete | 2026-03-07 | New e2e contract fails on the missing labels and percentages   |
| 16.2 | Render five-category detail-page response breakdown | Complete | 2026-03-07 | Implemented with a stable typed mapping and i18n-driven labels |
| 16.3 | Verify validation pipeline and update documentation | Complete | 2026-03-07 | Targeted detail-page e2e and `pnpm validate` both passed       |

## Progress Log

### 2026-03-07

- Created the Step 6.2 task record after plan approval.
- Confirmed the current detail-page implementation only renders the `completelyAgreePercent` label/value pair and that the remaining four canonical response categories are missing.
- Defined a three-phase implementation path: failing e2e contract first, detail-page rendering second, verification and documentation last.

### 2026-03-07 — Phase 1

- Replaced the weak detail-page percentage smoke check with two stronger Playwright contract tests in `tests/e2e/preschool-detail-page-contract.spec.ts`.
- Added label assertions for all five canonical Swedish response categories and question-scoped percentage assertions for the canonical `almgardens-forskola` detail page.
- Verified the targeted Playwright run failed for the expected missing Step 6.2 behavior only: absent labels beyond `Instämmer helt` and absent non-`completelyAgreePercent` values.

### 2026-03-07 — Phase 2

- Updated `src/pages/sv/forskola/[id].astro` to define a stable ordered mapping from `SurveyResponse` fields to the canonical `responses.*` i18n keys.
- Replaced the one-line response output with a five-row per-question breakdown so each Helhetsbedömning question now renders all categories and percentages, including zero values.
- Fixed the strengthened Playwright contract for the duplicate `2%` Q1 case and reran the targeted detail-page spec successfully.

### 2026-03-07 — Phase 3

- Ran `pnpm test:e2e --grep preschool-detail` successfully with 9 passing detail-page tests.
- Ran `pnpm validate`; fixed a markdown-table alignment issue in this task file exposed by `lint:md`, then reran validation successfully.
- Marked TASK016 complete and synchronized the plan/memory-bank artifacts for the finished Step 6.2 work.

### 2026-03-07 — Review follow-up hardening

- Tightened `tests/e2e/preschool-detail-page-contract.spec.ts` so the Step 6.2 contract now asserts the ordered label/value rows inside each Helhetsbedömning question card instead of only checking for visible percentages.
- Removed the previous blind spot around duplicated `2%` values by asserting row order and label pairing rather than collapsing the duplicate case with a broad percentage lookup.
- Reverified the strengthened contract with `pnpm test:e2e --grep preschool-detail` and reran `pnpm validate` successfully.
