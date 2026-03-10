# TASK020 - Implement Step 7.3 Empty and Single-Selection States

**Status**: Completed
**Added**: 2026-03-10
**Updated**: 2026-03-10

## Original Request

Implement Step 7.3: close the gap between the already-shipped empty and single-selection UI behaviors and the implementation-plan intent by adding real-flow e2e coverage.

## Thought Process

The comparison page already shipped the correct empty state and the one-selected-preschool prompt + results behavior in Step 7.2. Step 7.3 was a test-only obligation: prove that behavior through the intended end-to-end user flow (clicking a real compare button, using the tray CTA, and confirming the results) rather than relying solely on seeded sessionStorage state. A second scenario hardened the one-school clear-state path.

Scope was deliberately kept narrow to avoid unnecessary component churn when the behavior itself was already correct.

## Implementation Plan

- Phase 1: Add failing real-flow Playwright scenario (empty → back link → select via real UI → open via tray CTA → assert single-selection prompt and results table).
- Phase 2: Add failing one-school clear-state Playwright scenario (select one → open comparison → clear via tray → assert stays on page and shows empty state).
- Phase 3: Run e2e spec and `pnpm validate`, fix any formatting issues, update memory bank.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                   | Status   | Updated    | Notes                                               |
| --- | --------------------------------------------- | -------- | ---------- | --------------------------------------------------- |
| 1.1 | Real-flow empty→single-selection e2e scenario | Complete | 2026-03-10 | Added to comparison-page-route-shell.spec.ts        |
| 1.2 | One-school clear-state e2e scenario           | Complete | 2026-03-10 | Clearing via tray stays on page and shows empty     |
| 1.3 | pnpm validate + Prettier fix in plan file     | Complete | 2026-03-10 | Fixed formatting in plan.md, then validate is green |
| 1.4 | Memory-bank and task-tracking sync            | Complete | 2026-03-10 | activeContext, progress, \_index, TASK020 updated   |

## Progress Log

### 2026-03-10

- Phase 1 (TASK020): Added a real-flow Playwright scenario proving the empty-state back-link round trip and one-preschool selection via the real compare-button UI opened through the tray CTA. The new contract passed against the existing production behavior, confirming Step 7.3 was a test-coverage gap rather than an implementation gap.
- Phase 2 (TASK020): Added a one-school clear-state Playwright scenario. Confirmed clearing via the compare tray stays on `/sv/jamfor/` and re-asserts the empty-state message. Tightened the compare-button locator to a preschool-name regex so it remains stable across the `Jämför` → `Tillagd` accessible-name transition.
- Phase 3 (TASK020): Ran `pnpm exec playwright test tests/e2e/comparison-page-route-shell.spec.ts --reporter=line` — 8/8 passing. Ran `pnpm validate` — Prettier reported an issue in `docs/plans/implement-step-7-3-empty-and-single-selection-states-plan.md`. Fixed with `pnpm exec prettier --write`. Reran `pnpm validate` — fully green (lint 0, lint:md 0, format:check clean, check 0, tests 26 unit + build complete). Updated memory-bank docs and created this task file.
- **Files changed** (Phase 3 only): `docs/plans/implement-step-7-3-empty-and-single-selection-states-plan.md` (Prettier fix), `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, `docs/memory-bank/tasks/completed/TASK020-implement-step-7-3-empty-and-single-selection-states.md`.
