# TASK021 - Implement Step 7.4 Mobile Comparison Refinement

**Status**: Completed
**Added**: 2026-03-10
**Updated**: 2026-03-10

## Original Request

Implement Step 7.4: make the comparison page responsive and usable on a 375×812 iPhone 13 mini viewport.

## Thought Process

The comparison page already rendered a working semantic table for 2–5 preschools, but Step 7.2 intentionally stopped at a minimal `overflow-x-auto` baseline. Step 7.4 needed a focused mobile refinement, not a wholesale redesign. The chosen approach was to keep the semantic table and pair real horizontal overflow with a sticky question column instead of introducing a separate card-based mobile layout. That kept scope tight ahead of Step 8 chart work and matched the implementation-plan requirement that all compared schools remain visible or scrollable on small screens.

## Implementation Plan

- Phase 1: Add a failing Playwright contract for the 375×812 four-preschool comparison case.
- Phase 2: Update `ComparisonView` so the table reliably overflows horizontally and keeps the question column sticky.
- Phase 3: Run targeted comparison-page coverage and `pnpm validate`, then sync the memory bank.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                      | Status   | Updated    | Notes                                                              |
| --- | ------------------------------------------------ | -------- | ---------- | ------------------------------------------------------------------ |
| 1.1 | Add failing Step 7.4 mobile e2e contract         | Complete | 2026-03-10 | Added 375×812 four-preschool comparison regression                 |
| 1.2 | Implement sticky-column mobile comparison layout | Complete | 2026-03-10 | `ComparisonView` now uses `w-auto min-w-full` + sticky row labels  |
| 1.3 | Run comparison spec and `pnpm validate`          | Complete | 2026-03-10 | 9/9 comparison tests passing; full validation green                |
| 1.4 | Memory-bank and task-tracking sync               | Complete | 2026-03-10 | activeContext, progress, `_index`, TASK021, and plan docs updated  |
| 1.5 | Harden WebKit and sticky-column regression guard | Complete | 2026-03-10 | Added narrow WebKit suite, stronger scroll-pin assertions, CI sync |

## Progress Log

### 2026-03-10

- Phase 1 (TASK021): Added a new Step 7.4 Playwright contract to `tests/e2e/comparison-page-route-shell.spec.ts` that seeds four preschools, forces the 375×812 viewport, asserts the comparison table is present, proves the table overflows horizontally, and fails specifically when the question column is not sticky.
- Phase 2 (TASK021): Refined `src/components/preact/ComparisonView.tsx` to add a stable comparison-scroll test id, switch the table from `w-full` to `w-auto min-w-full`, reduce the mobile question-column width, add minimum widths to preschool columns, and apply sticky left-aligned row-header cells with explicit zebra backgrounds. A small follow-up revision replaced unsupported arbitrary Tailwind min-width classes with `min-w-32` and `min-w-40`.
- Phase 3 (TASK021): Ran `pnpm exec playwright test tests/e2e/comparison-page-route-shell.spec.ts` — 9/9 passing. Ran `pnpm validate` — fully green. Updated memory-bank docs and created this task file.
- Follow-up hardening (TASK021): Strengthened the default Step 7.4 regression so it proves the sticky question column stays pinned after a real 200 px horizontal scroll instead of only checking computed `position: sticky`. Added `playwright.webkit.config.ts`, a narrow `tests/e2e/comparison-page-mobile-webkit.spec.ts` iPhone 13 mini WebKit regression, the `pnpm test:e2e:webkit` script, and wired the reusable `quality-gates.yml` workflow to install WebKit and run that narrow suite in CI.
- **Files changed**: `src/components/preact/ComparisonView.tsx`, `tests/e2e/comparison-page-route-shell.spec.ts`, `docs/plans/implement-step-7-4-mobile-comparison-refinement-plan.md`, `docs/plans/implement-step-7-4-mobile-comparison-refinement-phase-1-complete.md`, `docs/plans/implement-step-7-4-mobile-comparison-refinement-phase-2-complete.md`, `docs/plans/implement-step-7-4-mobile-comparison-refinement-phase-3-complete.md`, `docs/plans/implement-step-7-4-mobile-comparison-refinement-complete.md`, `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/_index.md`, `docs/memory-bank/tasks/completed/TASK021-implement-step-7-4-mobile-comparison-refinement.md`.
