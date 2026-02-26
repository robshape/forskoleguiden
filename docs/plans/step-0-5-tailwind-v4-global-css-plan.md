# Plan: Step 0.5 Tailwind Wiring

Implement Tailwind CSS v4 global stylesheet setup for the project and validate integration using a temporary Swedish index page, then clean up the temporary page while keeping the global stylesheet. This follows an incremental, test-first workflow with explicit red/green verification at each phase.

## Phases

1. **Phase 1: Add Global Tailwind Stylesheet**
   - **Objective**: Create the global stylesheet entrypoint required by Tailwind v4.
   - **Files/Functions to Modify/Create**: `src/styles/global.css`
   - **Tests to Write**: No new test files; use command-based verification (`pnpm astro check` or `pnpm build`).
   - **Steps**:
     1. Run a baseline check to confirm current project state before introducing the stylesheet.
     2. Create `src/styles/global.css` with only `@import "tailwindcss";`.
     3. Run `pnpm astro check` (or `pnpm build`) to verify the stylesheet addition introduces no configuration or compile regressions.

2. **Phase 2: Temporary Swedish Page for Style Verification**
   - **Objective**: Verify that Tailwind classes are applied on a temporary localized page.
   - **Files/Functions to Modify/Create**: `src/pages/sv/index.astro`
   - **Tests to Write**: No new automated test file; use dev-server behavioral check for visual verification.
   - **Steps**:
     1. Confirm `/sv/` baseline behavior before creating the temporary page.
     2. Create `src/pages/sv/index.astro` importing `../../styles/global.css` and render a heading with `text-2xl font-bold`.
     3. Run `pnpm dev` and verify `/sv/` displays a visibly large, bold heading.

3. **Phase 3: Cleanup Temporary Verification Page**
   - **Objective**: Remove temporary verification route while preserving the global stylesheet for future layout integration.
   - **Files/Functions to Modify/Create**: `src/pages/sv/index.astro` (delete)
   - **Tests to Write**: No new test files; use command-based and route-behavior checks.
   - **Steps**:
     1. Delete `src/pages/sv/index.astro` after verification.
     2. Run `pnpm astro check` (or `pnpm build`) to confirm project validity.
     3. Run `pnpm dev` and verify `/sv/` returns 404 again, confirming cleanup is complete.

## Open Questions

1. Should the visual verification be captured only through manual observation (as currently planned), or do you want a temporary e2e assertion added and then removed in this step?
