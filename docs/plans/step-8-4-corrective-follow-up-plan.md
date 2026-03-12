# Plan: Step 8.4 Corrective Follow-up

Address two verified Step 8.4 follow-up defects with the smallest possible changes: fix the noscript test so it verifies server-rendered HTML rather than live DOM serialization, and align the Step 8.5 table-ID contract documentation to the ID pattern actually emitted by `BarChart`.

## Phases

1. **Phase 1: Fix the No-JS Fallback Test**
   - **Objective**: Make the existing Step 8.4 Playwright contract verify the raw response body instead of `page.content()` in a JavaScript-enabled session.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: none; fix the existing Step 8.4 test to read `response.text()` while preserving the current assertions and scope
   - **Steps**:
     1. Replace the current `page.content()` read in the Step 8.4 noscript test with `response.text()` from the existing navigation response.
     2. Re-run targeted comparison-page coverage to confirm the corrected test still passes.

2. **Phase 2: Align Documentation to the Implemented Table ID Contract**
   - **Objective**: Remove Step 8.5 contract drift by updating all newly added Step 8.4 docs to the actual table ID pattern emitted by `BarChart`.
   - **Files/Functions to Modify/Create**: `docs/plans/step-8-4-table-fallback-complete.md`, `docs/memory-bank/tasks/TASK027-implement-step-8-4-table-fallback.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`
   - **Tests to Write**: none; documentation-only updates
   - **Steps**:
     1. Replace the incorrect `chart-data-table-{chartId}` wording with the implemented `chart-{chartIndex}-table` pattern wherever it appears.
     2. Update TASK027 notes and progress log so the recorded contract matches the implementation.
     3. Leave production code unchanged in this phase.

## Canonical Decision

Keep the implementation as-is: `chart-${chartIndex}-table` is the canonical Step 8.5 target. It matches the existing `chart-${chartIndex}-...` namespace already used throughout `BarChart` for SVG pattern IDs and avoids unnecessary source churn before Step 8.5 is implemented.
