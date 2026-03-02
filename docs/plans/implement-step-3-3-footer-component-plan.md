# Plan: Implement Step 3.3 Footer Component

Create a reusable footer component, compose it in the shared layout, and validate attribution rendering with test-first updates. This keeps scope tightly aligned to Step 3.3 while preserving existing shell architecture and accessibility expectations.

## Phases

1. **Phase 1: Add Footer Layout Contract Test (TDD)**
   - **Objective**: Lock the layout contract so `BaseLayout` composes `Footer` inside the semantic `<footer>` element.
   - **Files/Functions to Modify/Create**:
     - `tests/unit/sv-index-layout.test.ts`
   - **Tests to Write**:
     - `imports Footer and composes it with locale prop in BaseLayout footer`
   - **Steps**:
     1. Add the failing unit assertion for Footer import/composition in BaseLayout.
     2. Run targeted unit test to confirm the red state.
     3. Keep the assertion style consistent with existing layout shell tests.

2. **Phase 2: Implement Footer Component and Wire It (TDD)**
   - **Objective**: Implement Step 3.3 with minimal changes by creating `Footer.astro` and wiring it through `BaseLayout`.
   - **Files/Functions to Modify/Create**:
     - `src/components/astro/Footer.astro`
     - `src/layouts/BaseLayout.astro`
     - `src/pages/sv/index.astro`
   - **Tests to Write**:
     - Re-run Phase 1 test and make it pass.
   - **Steps**:
     1. Create `Footer.astro` with `locale: Locale` prop.
     2. Render attribution text and source link to Malmö stad using i18n keys.
     3. Replace footer slot composition in BaseLayout with `<Footer locale={locale} />`.
     4. Remove obsolete footer slot content from `/sv/` page.
     5. Run targeted unit test to confirm green state.

3. **Phase 3: Verify Footer Output and Finalize Records (TDD + validation)**
   - **Objective**: Validate runtime shell output for `/sv/` and update project tracking docs.
   - **Files/Functions to Modify/Create**:
     - `tests/e2e/layout-shell.spec.ts`
     - `docs/memory-bank/activeContext.md`
     - `docs/memory-bank/progress.md`
     - `docs/memory-bank/tasks/TASK001-wire-global-css-base-layout.md`
     - `docs/memory-bank/tasks/_index.md`
   - **Tests to Write**:
     - Extend shell e2e assertions for attribution text and source link in footer.
   - **Steps**:
     1. Add failing e2e footer assertions.
     2. Run targeted e2e to confirm failure.
     3. Ensure implementation satisfies e2e assertions.
     4. Run required project gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
     5. Update memory bank + task index/status to reflect Step 3.3 completion.

## Open Questions

1. Should footer copy use `attribution.*` keys or `footer.*` keys from `sv.json`? Option A: `attribution.*` / Option B: `footer.*`.
