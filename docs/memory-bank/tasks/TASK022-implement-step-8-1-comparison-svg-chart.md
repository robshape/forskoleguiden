# TASK022 - Implement Step 8.1 comparison SVG chart

**Status**: Completed
**Added**: 2026-03-10
**Updated**: 2026-03-10

## Original Request

Implement "Step 8: 8.1"

## Thought Process

Step 8.1 should extend the existing comparison-page architecture rather than introduce a new data flow. The comparison page already has the selected survey set, the canonical five response labels, and stable question ordering. The missing work is a reusable SVG chart component plus the minimum i18n and routing plumbing needed to render it accessibly.

The implementation should stay scoped to strict Step 8.1. The existing comparison table remains the primary comparison structure for now, which avoids prematurely pulling in the later Step 8.4 fallback-table and `noscript` requirements.

## Implementation Plan

- Add failing e2e and i18n regression tests for the missing chart structure and aria-label copy.
- Create a reusable `BarChart` Preact component and render it from `ComparisonView` for each comparison question.
- Verify the new chart behavior with targeted tests and full validation.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                 | Status   | Updated    | Notes                                                |
| --- | ------------------------------------------- | -------- | ---------- | ---------------------------------------------------- |
| 1.1 | Add failing Step 8.1 tests                  | Complete | 2026-03-10 | Fails for intended missing-chart reasons             |
| 1.2 | Implement reusable comparison SVG chart     | Complete | 2026-03-10 | Chart, headings, and chart-adjacent data table added |
| 1.3 | Run verification and finalize documentation | Complete | 2026-03-10 | pnpm validate green; 2 formatting fixes applied      |

## Progress Log

### 2026-03-10

- Created the approved Step 8.1 implementation plan in `docs/plans/implement-step-8-1-comparison-svg-chart-plan.md`.
- Opened TASK022 to track the chart work in the memory bank.
- Scoped the work to strict Step 8.1 and selected a chart index prop for deterministic SVG pattern ids.
- Added failing Step 8.1 e2e and i18n contract tests and confirmed they fail for the intended missing-feature reasons.
- Completed Phase 1 review with approval and only minor follow-up recommendations.
- Implemented `BarChart`, wired it into `ComparisonView`, added `compare.chartAriaLabel` across locales, and extended the comparison e2e coverage.
- Addressed Phase 2 review feedback by adding visible chart question headings and a chart-adjacent data table text alternative.
- Phase 3 verification: ran `pnpm validate`. Two pre-existing formatting issues surfaced (MD060 column alignment in TASK022 table; Prettier style in BarChart.tsx). Fixed both, re-ran `pnpm validate` — all gates green: 0 lint errors, 0 format issues, 0 type errors, 26/26 unit tests passed, build successful. Step 8.1 complete.
