# Phase 2 Complete: Implement SortToggle Island and Wire Directory Rendering

Phase 2 delivered the interactive Step 4.4 sort experience on `/sv/` using a `client:load` Preact island. The directory now toggles between `Rankning` and `A–Ö` deterministically while preserving the Step 4.3 default ranking render, heading/count row, ranking explanation text, and card contracts.

**Files created/changed**:

- src/components/preact/SortToggle.tsx
- src/pages/sv/index.astro
- tsconfig.json

**Functions created/changed**:

- `SortToggle` (default export) in `src/components/preact/SortToggle.tsx`
- `getRows` in `src/components/preact/SortToggle.tsx`
- `sortRows` in `src/components/preact/SortToggle.tsx`
- `updateRanks` in `src/components/preact/SortToggle.tsx`
- `applySort` in `src/components/preact/SortToggle.tsx`

**Tests created/changed**:

- tests/e2e/directory-data-rendering.spec.ts (Step 4.4 sort-toggle behavior contract from Phase 1 now passes)

**Review Status**: APPROVED

**Git Commit Message**: feat: add interactive directory sort toggle

- Add SortToggle Preact island with Rankning and A–Ö controls
- Wire /sv/ directory list for deterministic client-side reordering
- Preserve default ranking render and keep Step 4.4 e2e contract green
