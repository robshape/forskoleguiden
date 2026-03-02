# Phase 1 Complete: Add failing Step 3.2 tests

Phase 1 is complete with fail-first coverage for Step 3.2 navigation requirements. Unit and e2e contracts now assert Nav composition, required city/year labels, and disabled semantics before any source implementation changes.

**Files created/changed**:

- docs/plans/implement-step-3-2-navigation-shell-plan.md
- tests/unit/sv-index-layout.test.ts
- tests/e2e/layout-shell.spec.ts

**Functions created/changed**:

- describe('/sv/ page layout composition') test contract extended for Nav composition
- test('navigation shell renders required city/year labels and disabled semantics on /sv/')

**Tests created/changed**:

- tests/unit/sv-index-layout.test.ts — imports Nav and composes it with locale prop in BaseLayout header
- tests/e2e/layout-shell.spec.ts — navigation shell renders required city/year labels and disabled semantics on /sv/

**Review Status**: APPROVED

**Git Commit Message**: test: add fail-first nav shell contracts
