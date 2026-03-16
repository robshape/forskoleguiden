# [TASK034] - Implement Step 11.2 keyboard navigation audit

**Status**: Completed
**Added**: 2026-03-15
**Updated**: 2026-03-15

## Original Request

Implement Step 11.2 from `docs/implementation-plan-phase-1.md`: write keyboard navigation audits that verify Tab reachability and keyboard operability across the directory page, comparison page, and compare tray controls.

## Thought Process

The repo already has route-level axe coverage and some keyboard assertions in the shell accessibility spec, so the missing work is targeted Playwright coverage for the interactive controls that matter to Step 11.2. The main implementation constraint is that most app-level controls use `focus-visible:ring-*`, while the existing helper only inspects CSS outlines, so the tests need a shared focus-ring assertion before the new keyboard coverage can be added cleanly.

## Implementation Plan

- Add or refactor shared Playwright helpers so tests can assert the app's focus-visible ring styling instead of shell-only outline styles.
- Add a dedicated Step 11.2 keyboard-navigation Playwright spec that covers the directory page, compare tray, and comparison page flows with real keyboard input.
- Run the narrow Playwright target and `pnpm validate`, then record the completed step in the plan and memory bank.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                      | Status   | Updated    | Notes                                            |
| --- | ------------------------------------------------ | -------- | ---------- | ------------------------------------------------ |
| 1.1 | Add shared focus-ring keyboard test helper       | Complete | 2026-03-15 | Added shared ring and outline focus helpers      |
| 1.2 | Add directory and compare-tray keyboard audits   | Complete | 2026-03-15 | Added sort, card, compare button, and tray tests |
| 1.3 | Add comparison-page keyboard audits and validate | Complete | 2026-03-15 | Added empty-state and seeded comparison coverage |

## Progress Log

### 2026-03-15

- Approved the Step 11.2 implementation plan and created the plan file `docs/plans/step-11-2-keyboard-navigation-audit-plan.md`
- Created the task record for Step 11.2 and identified the main technical constraint: ring-based focus styling needs a shared Playwright assertion helper before the new keyboard tests can be added cleanly
- Added shared `getFocusRingContract` and `getFocusOutlineContract` helpers in `tests/e2e/fixtures.ts` so keyboard tests can assert both ring-based and outline-based focus treatments without duplicating CSS inspection logic
- Created `tests/e2e/keyboard-navigation-focus-ring.spec.ts` with 8 Playwright tests covering sort-toggle keyboard focus, compare button keyboard toggling, compare tray Tab reachability and clearing, comparison-page back-link keyboard behavior, and non-tabbable chart/table assertions
- Addressed a minor test follow-up by asserting visible focus on the `Betyg` sort button and using an unconditional tray disappearance assertion after keyboard clear
- Ran the narrow Playwright keyboard suite, full Playwright suite, and `pnpm validate`; all finished green with no product-code changes required
- Followed up on review feedback by exercising tray CTA navigation with `Enter`, removing a misleading `.focus()` / `focus-visible` comment from the compare-button keyboard test, and deduplicating the shared outline helper by importing it into `tests/e2e/layout-shell-accessibility.spec.ts`
