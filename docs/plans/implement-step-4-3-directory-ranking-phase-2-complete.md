# Phase 2 Complete: Implement ranking order and rank positions

Phase 2 implemented Step 4.3 ranking behavior on `/sv/` by sorting cards with score-desc logic, preserving null-last behavior through the existing comparator, adding deterministic tie-breaking, and rendering visible rank indexes in each list row. Review approved the phase with no issues.

**Files created/changed**:

- src/pages/sv/index.astro

**Functions created/changed**:

- `preschoolDirectory.sort((leftPreschool, rightPreschool) => ...)`
- `byOverallScoreDesc(...)` usage in `/sv/` route-level sort
- `preschoolDirectory.map((preschool, index) => ...)` rank rendering (`index + 1`)

**Tests created/changed**:

- No new tests in this phase (Phase 1 contracts reused)
- Targeted e2e progress: ranking-order and rank-index assertions now pass

**Review Status**: APPROVED

**Git Commit Message**: feat: sort directory and render rank indexes

- Sort Swedish directory by overall score descending
- Add deterministic name tie-breaker for equal scores
- Render visible ranking numbers alongside preschool cards
