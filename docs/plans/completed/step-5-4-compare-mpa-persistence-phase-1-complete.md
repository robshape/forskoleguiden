# Phase 1 Complete: Add failing MPA persistence tests

Phase 1 added the missing red-state Playwright coverage for compare-state persistence across real Astro page navigations without changing any product logic. The new tests are failing for the intended reason: the shared-layout secondary route does not exist yet, which cleanly defines the next implementation slice for Phase 2.

**Files created/changed**:

- docs/plans/step-5-4-compare-mpa-persistence-plan.md
- docs/plans/step-5-4-compare-mpa-persistence-phase-1-complete.md
- docs/memory-bank/tasks/TASK013-implement-step-5-4-compare-mpa-persistence.md
- docs/memory-bank/tasks/\_index.md
- tests/e2e/compare-tray-interaction.spec.ts

**Functions created/changed**:

- None

**Tests created/changed**:

- selected preschools remain in the tray after navigating to a second page and back
- compare-button pressed state is restored after returning from a second Astro page
- clearing compare via the tray on a second page removes tray on return to the directory

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: test: define compare MPA persistence
