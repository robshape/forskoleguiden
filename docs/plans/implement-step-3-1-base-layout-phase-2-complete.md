# Phase 2 Complete: Create reusable `BaseLayout.astro`

Phase 2 introduced a reusable locale-aware Astro layout for Step 3.1 while preserving the current `/sv/` page wiring for Phase 3 migration. The implementation is intentionally minimal and provides the required semantic document scaffold and stylesheet import point.

**Files created/changed**:

- src/layouts/BaseLayout.astro
- docs/memory-bank/tasks/TASK001-wire-global-css-base-layout.md
- docs/memory-bank/tasks/\_index.md

**Functions created/changed**:

- None (layout component props and template structure only)

**Tests created/changed**:

- None in this phase (Phase 1 guard test retained: tests/e2e/layout-shell.spec.ts)

**Review Status**: APPROVED

**Git Commit Message**: feat: add reusable locale base layout
