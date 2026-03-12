# TASK026 - Harden Step 8.3 Chart Legend

**Status**: Completed
**Added**: 2026-03-12
**Updated**: 2026-03-12

## Original Request

Address review feedback on the Step 8.3 chart legend implementation by:

1. Adding a Playwright drift-guard test ensuring legend swatch patterns mirror the corresponding main chart patterns structurally.
2. Eliminating the root cause of potential chart/legend drift by extracting a shared `renderPatternContent` helper in `BarChart.tsx` used by both chart `<defs>` and legend swatch `<defs>`.
3. Correcting the stale Step 8.2 references in `docs/memory-bank/progress.md` and syncing tracking artifacts.

## Thought Process

The Step 8.3 legend duplicated SVG pattern-rendering markup between the main chart `<defs>` and each legend swatch's inline `<defs>`. Any future edit to one block could silently diverge from the other. The fix is to extract a single typed helper (`renderPatternContent`) that both code paths call, making structural equivalence a compile-time guarantee rather than a test-only assertion. The structural-equivalence Playwright test adds an additional runtime guard.

## Implementation Plan

- Phase 1: Add a failing drift-guard Playwright test asserting that each legend swatch pattern matches the corresponding chart pattern structure (same SVG primitive types and attributes) for all five response categories.
- Phase 2: Extract shared `renderPatternContent(pDef: PatternDef)` from `BarChart.tsx`; reuse it in chart pattern defs and legend swatch defs.
- Phase 3: Correct stale Step 8.2 references in `progress.md`, update `activeContext.md`, and create tracking artifacts.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                    | Status   | Updated    | Notes                                             |
| --- | ---------------------------------------------- | -------- | ---------- | ------------------------------------------------- |
| 1.1 | Write failing drift-guard Playwright test      | Complete | 2026-03-12 | `legend swatch patterns - drift guard` in spec    |
| 1.2 | Extract `renderPatternContent` in BarChart.tsx | Complete | 2026-03-12 | Chart and legend defs both call the shared helper |
| 1.3 | Fix stale refs and sync memory-bank tracking   | Complete | 2026-03-12 | progress.md, activeContext.md, index, artifacts   |

## Progress Log

### 2026-03-12

- Added failing `'legend swatch patterns mirror chart patterns structurally for all five categories — drift guard'` Playwright test to `tests/e2e/comparison-page-route-shell.spec.ts`; confirmed it failed before the code change.
- Extracted `renderPatternContent(pDef: PatternDef)` helper in `src/components/preact/BarChart.tsx`; both the main chart `<pattern>` defs and the legend swatch `<pattern>` defs now call this helper, eliminating the markup duplication.
- Ran targeted comparison-page Playwright spec — all 15 tests passed including the new drift guard.
- Ran `pnpm validate` — lint, lint:md, format:check, check, 26 unit tests, and build all green.
- Fixed stale Step 8.2 references in `docs/memory-bank/progress.md` top status sentence and updated KCD test count to 26 unit + 42 e2e = 68 total.
- Updated `docs/memory-bank/activeContext.md` current-state paragraph and test count.
- Added TASK026 to `docs/memory-bank/tasks/_index.md`.
- Created `docs/plans/step-8-3-chart-legend-hardening-complete.md` completion artifact.
