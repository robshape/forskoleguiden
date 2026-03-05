# Plan Complete: Implement Step 4.4 Sort Toggle

Step 4.4 is fully implemented and validated for the Swedish directory route. The page now provides an interactive segmented sort control (`Rankning` and `A–Ö`) that reorders list rows deterministically while preserving the default score-based ranking on initial render. Regression hardening and required quality gates confirm the feature is stable and aligned with existing card and ranking contracts.

**Phases Completed**: 3 of 3

1. ✅ Phase 1: Add Failing Sort Toggle E2E Contract
2. ✅ Phase 2: Implement SortToggle Island and Wire Directory Rendering
3. ✅ Phase 3: Regression Hardening and Required Quality Gates

**All Files Created/Modified**:

- docs/plans/implement-step-4-4-sort-toggle-plan.md
- docs/plans/implement-step-4-4-sort-toggle-phase-1-complete.md
- docs/plans/implement-step-4-4-sort-toggle-phase-2-complete.md
- docs/plans/implement-step-4-4-sort-toggle-phase-3-complete.md
- src/pages/sv/index.astro
- src/components/preact/SortToggle.tsx
- tests/e2e/directory-data-rendering.spec.ts
- tsconfig.json
- src/env.d.ts
- docs/memory-bank/activeContext.md
- docs/memory-bank/progress.md

**Key Functions/Classes Added**:

- `SortToggle` (Preact island component)
- `getRows` (SortToggle helper)
- `sortRows` (SortToggle helper)
- `updateRanks` (SortToggle helper)
- `applySort` (SortToggle helper)

**Test Coverage**:

- Total tests written: 1
- All tests passing: ✅

**Recommendations for Next Steps**:

- Start Step 5.1 by implementing compare-state nanostore foundations in `src/lib/state.ts`.
- Keep Step 5.2/5.3 UI interactions isolated to compare button and tray once state-layer contracts are green.
