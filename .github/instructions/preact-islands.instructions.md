---
applyTo: 'src/components/preact/**'
description: 'Preact island inventory, hydration strategy, and component hierarchy for the interactive islands in src/components/preact/.'
---

# Preact Islands

## Hydration strategy

- `client:load` — small interactive widgets that must be immediately operable
- `client:only="preact"` — component reads `sessionStorage` on mount; SSR would render stale state
- `client:visible` / `client:idle` — below-the-fold or non-critical (none currently used)
- _(child)_ — sub-component rendered by a parent island; not hydrated independently

## Island inventory

| Component         | Hydration              | Purpose                                                                                |
| ----------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| `SortToggle`      | `client:load`          | Toggle alphabetical/rating sort; mutates DOM row order; `aria-live` announcements      |
| `CompareButton`   | `client:only="preact"` | Select/deselect a preschool for comparison; `aria-pressed` toggle                      |
| `CompareTray`     | `client:only="preact"` | Global compare summary bar; links to comparison page; clearing redirects to directory  |
| `ComparisonView`  | `client:only="preact"` | Comparison page orchestrator: resolves surveys, renders question sections + summary    |
| `BreadcrumbLink`  | `client:load`          | Swaps breadcrumb target when `?from=compare` is in URL                                 |
| `SearchPanel`     | `client:only="preact"` | Search input in Nav; filters preschools, navigates to detail on selection              |
| `DetailsBarChart` | _(static)_             | SVG bar chart with pattern fills; rendered inside `QuestionCard.astro` (`aria-hidden`) |

## Sub-components (children, not independently hydrated)

| Component                   | Parent           | Purpose                                                                                  |
| --------------------------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `ComparisonCard`            | `ComparisonView` | Single preschool row: remove button, score, breakdown bar, sr-only table                 |
| `ComparisonCardTable`       | `ComparisonCard` | SR-only accessible data table for survey response percentages                            |
| `ComparisonBreakdownBar`    | `ComparisonCard` | Inline SVG agree-share breakdown (completely + partly agree segments with pattern fills) |
| `ComparisonQuestionSection` | `ComparisonView` | Section wrapper for one comparison question; renders ComparisonCards                     |
| `ComparisonSummary`         | `ComparisonView` | Best-per-question summary; shows which preschool scored highest per question             |
| `ComparisonEmptyState`      | `ComparisonView` | Empty state UI when no preschools selected                                               |
| `ShareBox`                  | `ComparisonView` | Share CTA box: title, description, share button (shown when 2+ selected)                 |
| `ShareFeedback`             | `ComparisonView` | Feedback UI: copied confirmation, clipboard fallback, stale-ID warning, error            |
| `SearchResultList`          | `SearchPanel`    | Filtered search result list with keyboard navigation and compare buttons                 |

## Conventions

- Named `function` declarations for all Preact components (`export default function Name()`)
- Consume compare store via `useStore(compareIds)` from `@nanostores/preact`
- Never write to the internal atom directly — use `toggleCompare` / `clearCompare` / `setCompareIds`
- SVG charts use pattern fills for color-blind safety
