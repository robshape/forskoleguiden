# TASK019 - Implement Step 7.2 comparison view

**Status**: Completed
**Added**: 2026-03-10
**Updated**: 2026-03-10

## Original Request

Implement "Step 7: 7.2"

## Thought Process

The existing `/sv/jamfor/` route shell from Step 7.1 already mounted a `client:only="preact"` `ComparisonView` island and correctly handled the empty state. Step 7.2 needed to keep that route-shell architecture, load all survey data at build time in Astro, and let the island filter by the sessionStorage-backed `compareIds` store at runtime. The work was driven with Playwright contracts first so the one-selected and multi-selected comparison states were fixed against real rendered behavior before the island implementation changed.

During implementation, a requirement gap surfaced: the first single-selection pass showed only a prompt, but Step 7.2 required the selected preschool's results as well. The comparison contract and island were revised so the one-selected state now shows both the prompt and a one-column results table.

## Implementation Plan

- Add failing Playwright contracts for the one-selected and three-selected comparison states.
- Thread all survey data and localized single-selection copy into `ComparisonView` from `/sv/jamfor/`.
- Render a semantic comparison table that covers both one-selected and 2–5 selected states in selection order.
- Validate with targeted Playwright runs and `pnpm validate`, then update the memory bank.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                         | Status   | Updated    | Notes                                                           |
| --- | --------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------- |
| 1.1 | Add failing comparison-state Playwright contracts   | Complete | 2026-03-10 | Covered one-selected and three-selected comparison states       |
| 1.2 | Thread survey data into the comparison route/island | Complete | 2026-03-10 | Added localized single-selection copy with locale parity intact |
| 1.3 | Render one-selected and multi-selected results      | Complete | 2026-03-10 | One-selected state revised to show both prompt and results      |
| 1.4 | Validate and sync memory bank                       | Complete | 2026-03-10 | `pnpm validate` green; task and memory-bank docs updated        |

## Progress Log

### 2026-03-10

- Added failing Playwright contracts to `tests/e2e/comparison-page-route-shell.spec.ts` for the one-selected and three-selected states.
- Loaded all preschool surveys in `src/pages/sv/jamfor/index.astro` and passed them into `ComparisonView` together with localized single-selection copy.
- Implemented the comparison table rendering in `src/components/preact/ComparisonView.tsx` using `compareIds`, `OVERALL_ASSESSMENT_GROUP`, and `computeAgreeShare()`.
- Revised the one-selected state after review so it now shows both the localized prompt and the selected preschool's results, matching the original Step 7.2 requirement.
- Added `compare.singleSelectionPrompt` to the Swedish copy contract regression guard and reran `pnpm validate` successfully.
- Applied follow-up hardening from review feedback: stale compare IDs now fall back to the empty state, comparison cells resolve by question text instead of index, the question column is explicitly labeled for accessibility, and the Malmö survey-file contract now locks the canonical Helhetsbedömning question texts and order.
