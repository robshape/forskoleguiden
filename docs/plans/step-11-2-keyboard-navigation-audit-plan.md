# Plan: Step 11.2 Keyboard Navigation Audit

Add Playwright keyboard-navigation coverage for the directory page, comparison page, and compare tray using the project's existing accessibility patterns. The work stays test-first and focused on real interactive elements, while also fixing the current mismatch between ring-based focus styling and the shell-only outline assertion helper.

## Phases

1. **Phase 1: Establish keyboard-test helpers**
   - **Objective**: Add or refactor the minimum shared Playwright helpers needed to assert real focus-visible styling and stable keyboard navigation targets.
   - **Files/Functions to Modify/Create**: `tests/e2e/fixtures.ts`, `tests/e2e/layout-shell-accessibility.spec.ts`, a new Step 11.2 spec in `tests/e2e/`
   - **Tests to Write**: A failing focus-visible test against a ring-based interactive control on the directory page.
   - **Steps**:
     1. Write one failing keyboard-focus test against a ring-based control on the directory page.
     2. Extract a reusable focus-ring inspection helper instead of relying on outline-only assertions.
     3. Re-run the targeted test until it passes without changing unrelated UI behavior.

2. **Phase 2: Cover directory page and compare tray keyboard behavior**
   - **Objective**: Verify Tab reachability, visible focus, and Enter/Space operability for the sort toggle, preschool card actions, and compare tray controls.
   - **Files/Functions to Modify/Create**: A new Step 11.2 spec in `tests/e2e/`, possibly small helper reuse from `tests/e2e/compare-tray-interaction.spec.ts`
   - **Tests to Write**: Sort controls receive visible focus and activate via keyboard; compare buttons receive visible focus and toggle via keyboard; compare tray CTA and clear button are Tab-reachable and keyboard-operable.
   - **Steps**:
     1. Write a failing test for the first directory keyboard path.
     2. Add the minimal assertions and helper reuse needed for reachability and operability.
     3. Add tray-specific keyboard tests using the existing hydrated compare-button patterns.

3. **Phase 3: Cover comparison page keyboard behavior and validate**
   - **Objective**: Verify keyboard access on comparison-page interactive flows without forcing non-interactive charts or tables into the tab order.
   - **Files/Functions to Modify/Create**: A new Step 11.2 spec in `tests/e2e/`, possibly minor selector hardening if needed
   - **Tests to Write**: Empty-state back link is focusable and keyboard-operable; multi-selection comparison page keeps back link and tray controls keyboard-accessible; visible focus is present on comparison-page interactive elements.
   - **Steps**:
     1. Write a failing empty-state keyboard test.
     2. Add a failing multi-selection keyboard test with seeded compare state.
     3. Run the narrow Playwright target, then run `pnpm validate` as the final verification for the step.

## Open Questions

1. Treat Step 11.2 as keyboard coverage for interactive elements only. The comparison charts and read-only table remain non-tabbable and stay covered by semantics plus axe tests.
2. Allow a small Playwright-helper refactor so focus assertions match the app's ring-based styling model.
