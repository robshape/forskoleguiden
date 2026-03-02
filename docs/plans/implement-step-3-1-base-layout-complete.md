# Plan Complete: Implement Step 3.1 Base Layout

Step 3.1 is now fully implemented with a reusable locale-aware base layout and Swedish page migration. The work followed phased TDD and preserved the existing minimal `/sv/` shell content while centralizing document structure and stylesheet wiring. The project is now ready to continue with Step 3.2/3.3 component extraction (`Nav` and `Footer`).

**Phases Completed**: 3 of 3

1. ✅ Phase 1: Add shell acceptance test and make current shell pass
2. ✅ Phase 2: Create reusable `BaseLayout.astro`
3. ✅ Phase 3: Migrate `/sv/` page to `BaseLayout` and verify quality gates

**All Files Created/Modified**:

- src/layouts/BaseLayout.astro
- src/pages/sv/index.astro
- tests/e2e/layout-shell.spec.ts
- tests/unit/sv-index-layout.test.ts
- docs/memory-bank/tasks/TASK001-wire-global-css-base-layout.md
- docs/memory-bank/tasks/\_index.md
- docs/memory-bank/activeContext.md
- docs/memory-bank/progress.md
- docs/plans/implement-step-3-1-base-layout-plan.md
- docs/plans/implement-step-3-1-base-layout-phase-1-complete.md
- docs/plans/implement-step-3-1-base-layout-phase-2-complete.md
- docs/plans/implement-step-3-1-base-layout-phase-3-complete.md

**Key Functions/Classes Added**:

- BaseLayout Astro component (`src/layouts/BaseLayout.astro`)
- Layout shell e2e assertion (`tests/e2e/layout-shell.spec.ts`)
- `/sv/` composition guard test (`tests/unit/sv-index-layout.test.ts`)

**Test Coverage**:

- Total tests written: 2
- All tests passing: ✅

**Recommendations for Next Steps**:

- Implement Step 3.2 by creating `src/components/astro/Nav.astro` and wiring it into `BaseLayout`.
- Implement Step 3.3 by creating `src/components/astro/Footer.astro` with attribution link integration.
- Execute Step 3.4 (`TASK002`) by moving root redirect behavior to Astro config redirects.
