# Plan: Step 8.2 Chart Hardening

Harden the completed Step 8.2 chart work by making the new Playwright regression target the semantic chart under test rather than DOM order, and by binding response fields to visual encodings in one source of truth inside `BarChart`. This is a small follow-up: one focused test adjustment, one localized chart refactor, and verification.

## Phases

1. **Phase 1: Stabilize Regression Selectors**
   - **Objective**: Make the Step 8.2 Playwright regression resilient to unrelated chart-order and DOM-order changes.
   - **Files/Functions to Modify/Create**: `tests/e2e/comparison-page-route-shell.spec.ts`
   - **Tests to Write**: update the existing Step 8.2 chart-pattern regression to scope by accessible chart name and stable pattern id suffixes
   - **Steps**:
     1. Re-target the regression to the semantic chart for the first Helhetsbedömning question.
     2. Replace numeric pattern-position assertions with selectors based on stable `pattern[id$="-cat-N"]` suffixes.
     3. Run the targeted Playwright regression to confirm the hardened selector strategy still passes.

2. **Phase 2: Unify Response Series Metadata**
   - **Objective**: Remove positional semantic drift risk by binding response fields and pattern metadata in one array.
   - **Files/Functions to Modify/Create**: `src/components/preact/BarChart.tsx`
   - **Tests to Write**: no new tests beyond Phase 1; use the existing Step 8.2 regression and type-checking as acceptance targets
   - **Steps**:
     1. Replace separate `PATTERN_DEFS` and `RESPONSE_FIELDS` arrays with a single `RESPONSE_SERIES` source of truth.
     2. Update pattern rendering and segment/table rendering to derive from the unified metadata.
     3. Run the targeted regression and confirm behavior remains unchanged.

3. **Phase 3: Validate and Sync Context**
   - **Objective**: Verify the hardening change set and update repository tracking.
   - **Files/Functions to Modify/Create**: memory-bank files as needed for completion tracking
   - **Tests to Write**: none
   - **Steps**:
     1. Run `pnpm validate`.
     2. Update task/memory-bank state for the hardening follow-up.
     3. Write completion artifacts and summarize outcomes.
