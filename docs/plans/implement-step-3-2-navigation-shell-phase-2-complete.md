# Phase 2 Complete: Implement Nav and wire into layout

Phase 2 is complete with a new locale-aware navigation component integrated into the shared layout. The `/sv/` page now inherits the header shell from `BaseLayout`, and the fail-first unit/e2e contracts for Step 3.2 pass.

**Files created/changed**:

- src/components/astro/Nav.astro
- src/layouts/BaseLayout.astro
- src/pages/sv/index.astro

**Functions created/changed**:

- `Nav` Astro component rendering locale link, city indicator, year, and language placeholder
- `BaseLayout` header composition updated to render `Nav` with `locale`

**Tests created/changed**:

- tests/unit/sv-index-layout.test.ts (validated passing against new Nav wiring)
- tests/e2e/layout-shell.spec.ts (validated passing against new nav shell contract)

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: feat: add locale-aware navigation shell
