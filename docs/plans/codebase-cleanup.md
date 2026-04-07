# Codebase Cleanup Plan

Audit date: 2025-04-07
Source: 3,683 lines across `src/` | Tests: 7,740 lines across `tests/`

This plan evaluates the codebase against LLM AI coding principles: predictability, regenerability, flat explicit structure, small-to-medium functions, minimal coupling, and deterministic testable behavior. Items are grouped by priority. If something works well, it's not listed.

---

## High Priority

### 1. Split `SearchPanel.tsx` (343 lines)

**Principle violated:** Small-to-medium functions; regenerability (hard to rewrite one concern without touching all).

The largest Preact island mixes input handling, keyboard navigation, results rendering, focus management, and ARIA bookkeeping in a single file. This makes it the hardest component to regenerate or debug in isolation.

**Proposed split:**

| New file                   | Responsibility                                     | ~Lines |
| -------------------------- | -------------------------------------------------- | ------ |
| `SearchPanel.tsx`          | Orchestrator: state, open/close, layout            | ~120   |
| `SearchResultList.tsx`     | Renders filtered results list with compare toggles | ~80    |
| `search-panel-keyboard.ts` | `handleInputKeyDown` switch logic                  | ~40    |
| `useSearchFocus.ts`        | Custom hook for focus management on open/close     | ~20    |

**Result:** Main component drops from 343 → ~120 lines. Each extracted piece is independently testable and regenerable.

### 2. Split `ComparisonView.tsx` (288 lines)

**Principle violated:** Same as above — single file orchestrates share decoding, ID validation, section rendering, share button, feedback, and summary.

**Proposed split:**

| New file                        | Responsibility                                         | ~Lines |
| ------------------------------- | ------------------------------------------------------ | ------ |
| `ComparisonView.tsx`            | Orchestrator: store read, share decode, layout         | ~100   |
| `ComparisonQuestionSection.tsx` | Renders one question heading + cards for that question | ~60    |
| `useShareRestore.ts`            | Custom hook for `?s=` param decoding + validation      | ~50    |

**Result:** Drops from 288 → ~100 lines. Share restoration logic becomes independently testable without rendering.

### 3. Trim `ComparisonCard.tsx` (270 lines)

**Principle violated:** Single component handles remove button, school link, score display, breakdown bar SVG, response rate badge, and sr-only data table.

**Proposed split:**

| New file                     | Responsibility                  | ~Lines |
| ---------------------------- | ------------------------------- | ------ |
| `ComparisonCard.tsx`         | Card shell: name, remove, score | ~100   |
| `ComparisonBreakdownBar.tsx` | Inline 2-segment SVG bar        | ~80    |
| `ComparisonCardTable.tsx`    | Screen-reader-only data table   | ~50    |

---

## Medium Priority

### 4. Delete empty `scripts/` directory

**Principle violated:** Predictable project layout — an empty directory creates false expectations.

The `scripts/` directory contains no files. All automation lives in `package.json` scripts and CI workflows. Delete it. If scripts are needed later, recreate per-task.

### 5. Reduce e2e test overlap in comparison page tests

**Principle:** Tests should be focused on verifying observable behavior, not re-asserting the same DOM structure across multiple files.

Three e2e files test the comparison page with overlapping assertions:

- `comparison-page-route-shell.spec.ts` (597 lines) — asserts preschool links, headings, percentages, response rates, share box, empty state
- `comparison-page-breakdown-bar.spec.ts` — re-asserts preschool links and headings before testing bar charts
- `comparison-page-mobile-webkit.spec.ts` — re-asserts links and headings for WebKit regression

**Action:** Remove generic link/heading assertions from `breakdown-bar` and `mobile-webkit` specs. Let `route-shell` own structural assertions; let the others focus on their specific concerns (SVG charts, WebKit layout).

### 6. Consider splitting `comparison-page-route-shell.spec.ts` (597 lines)

This is the largest test file. It covers empty state, single selection, three-preschool state, share box, and more. Breaking it into 2–3 focused specs (e.g., `comparison-empty-state.spec.ts`, `comparison-multi-select.spec.ts`) would improve regenerability — each file becomes a self-contained behavior description.

---

## Low Priority

### 7. Standardize `features/` directory usage

Currently only `src/features/comparison/` exists with 2 files (`summary.ts`, `summaryText.ts`). The search logic in `src/lib/search.ts` could move to `src/features/search/search.ts` if/when `SearchPanel` is split. This would establish a consistent pattern: domain logic in `features/`, generic utilities in `lib/`.

Not urgent — only worth doing alongside the SearchPanel split (item 1).

### 8. Add note to `docs/implementation-plan-phase-2.md` about Phase 3

Phase 2 is complete (steps 0–10). Specs 014–016 represent next work but aren't referenced in any implementation plan. A brief "What's Next" section linking to the active specs would improve discoverability.

---

## Not Changing (Already Aligned)

These areas were reviewed and found to already follow LLM coding principles well:

- **Route files per locale** (9 files, 3 lines each) — explicit and predictable, even though duplicated. The duplication is trivial (3 lines per file) and makes routing behavior obvious without dynamic resolution logic.
- **`chart-patterns.tsx`** — correctly uses `.tsx` extension (contains JSX). No rename needed.
- **`src/lib/` module sizes** — all under 125 lines. Clean, focused, no dead exports.
- **Type system** — all types in `types.ts` are actively used. No dead code.
- **i18n structure** — key parity enforced by tests. Clean separation of concerns.
- **Page shell pattern** — `DirectoryPage.astro`, `ComparisonPage.astro`, `DetailPage.astro` cleanly separate data loading from routing. Good regenerability.
- **State management** — `state.ts` at 124 lines is reasonable for its scope (store + persistence + SSR guards).
- **Test naming** — BDD-style names throughout. Helpers properly shared.
- **Config files** — standard, well-documented, no unnecessary complexity.
