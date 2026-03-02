# Plan: Implement Step 3.1 Base Layout

Implement a reusable locale-aware Astro layout that satisfies Step 3.1 acceptance criteria while keeping each phase green through strict test-first execution. The work starts by codifying shell requirements in e2e tests, then extracts shared HTML scaffolding into `BaseLayout`, and finally migrates the Swedish page to consume the layout.

## Phases

1. **Phase 1: Add shell acceptance test and make current shell pass**
   - **Objective**: Encode Step 3.1 semantic shell requirements in e2e and ensure they pass against the current `/sv/` page.
   - **Files/Functions to Modify/Create**: `tests/e2e/layout-shell.spec.ts`, `src/pages/sv/index.astro`
   - **Tests to Write**: `layout shell renders html lang and semantic landmarks on /sv/`
   - **Steps**:
     1. Write a new e2e test asserting `/sv/` has `html[lang="sv"]`, `header`, `main`, and `footer`.
     2. Run the targeted test and confirm it fails.
     3. Add minimal semantic shell placeholders to the current `/sv/` page to satisfy assertions.
     4. Re-run the targeted test and confirm it passes.

2. **Phase 2: Create reusable `BaseLayout.astro`**
   - **Objective**: Implement a shared layout component with locale-aware document attributes, metadata, global CSS import, and slot-based structure.
   - **Files/Functions to Modify/Create**: `src/layouts/BaseLayout.astro`
   - **Tests to Write**: No new file required; preserve passing Phase 1 shell assertions while implementing reusable layout.
   - **Steps**:
     1. Reuse Phase 1 shell assertions as a guard.
     2. Create `BaseLayout.astro` with props `title` and `locale`, plus required document/head/body structure.
     3. Implement `lang={locale}` and conditional `dir="rtl"` for Arabic locale.
     4. Include `src/styles/global.css`, semantic `header/main/footer`, and `<slot />`.

3. **Phase 3: Migrate `/sv/` page to `BaseLayout` and verify quality gates**
   - **Objective**: Adopt `BaseLayout` on `src/pages/sv/index.astro` and validate all required repository checks.
   - **Files/Functions to Modify/Create**: `src/pages/sv/index.astro`
   - **Tests to Write**: Existing e2e shell test remains active; no additional test required.
   - **Steps**:
     1. Refactor `src/pages/sv/index.astro` to render content through `BaseLayout`.
     2. Keep page content minimal and aligned with Step 3.1 scope.
     3. Run `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`, and targeted e2e shell test.

## Open Questions

1. None. Decisions approved: semantic placeholders now, dedicated layout test file, and defer `/ar/` route creation.
