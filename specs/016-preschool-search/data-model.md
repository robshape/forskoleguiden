# Data Model: Global Preschool Search

**Feature**: 016-preschool-search
**Date**: 2026-04-04

## Entities

### SearchablePreschool

A build-time-derived record representing a preschool eligible for search. Derived from `PreschoolIndexEntry` by filtering out preschools with placeholder surveys.

| Field | Type | Description |
| ----- | ---- | ----------- |
| id | string | Unique preschool identifier (slug, e.g., `"almangens-forskola"`) |
| name | string | Display name in Swedish (e.g., `"Almängens förskola"`) |
| address | string | Street address in Malmö (e.g., `"Solvändegatan 20A-B, Malmö"`) |
| operatorType | `'municipal' \| 'independent'` | Operator classification |

**Source**: `PreschoolIndexEntry` from `data/malmo/index.json`, filtered at build time to exclude entries whose survey has `totalRespondentsPercent === -1` (placeholder surveys, via `isPlaceholderSurvey()`).

**Relationships**: References the same `id` used by `PreschoolSurvey`, detail page routes (`/{locale}/forskola/{id}/`), and the `compareIds` nanostore.

### SearchQuery

Ephemeral client-side value representing the user's current search input.

| Field | Type | Description |
| ----- | ---- | ----------- |
| text | string | Raw input from the search field |
| normalizedText | string | Derived: lowercase + NFD-normalized + diacritics stripped; used for matching |

**Validation rules**:
- Minimum 1 character to trigger filtering (empty query shows no results panel)
- No maximum length constraint (practical limit is the text input width)

### SearchResult

A `SearchablePreschool` that matches the current `SearchQuery`, augmented with runtime compare state.

| Field | Type | Description |
| ----- | ---- | ----------- |
| preschool | SearchablePreschool | The matched preschool data |
| isInCompareSet | boolean | Whether this preschool's ID is currently in the `compareIds` nanostore |

**Derivation**: Computed at render time by filtering `SearchablePreschool[]` against `SearchQuery.normalizedText` and cross-referencing with `compareIds` store value.

**Ordering**: Alphabetical by `preschool.name` (consistent with directory default sort).

**Capping**: At most 10 results displayed. Total match count preserved for the count indicator.

## State Transitions

### Search Panel States

```
[Closed] --activate trigger--> [Open, Empty]
[Open, Empty] --type query--> [Open, With Results] or [Open, No Results]
[Open, With Results] --clear input--> [Open, Empty]
[Open, With Results] --click result link--> [Closed] (navigates away)
[Open, With Results] --toggle compare--> [Open, With Results] (stays open, compare state updates)
[Open, *] --press Escape--> [Closed]
[Open, *] --click outside--> [Closed]
[Closed] <-- focus returns to trigger
```

### Compare Toggle (within search)

Uses existing `toggleCompare(id)` from `src/lib/state.ts`:
- If `id` is in `compareIds` → removes it
- If `id` is not in `compareIds` and `compareIds.length < 5` → adds it
- If `id` is not in `compareIds` and `compareIds.length >= 5` → silently refuses

No new state management needed — the `compareIds` nanostore is shared across all islands (SearchPanel, CompareButton, CompareTray) via the window-level singleton pattern.

## Data Flow

```
Build time:
  data/malmo/index.json
    → getPreschoolIndex() (src/lib/data.ts)
    → filter out placeholder surveys
    → extract { id, name, address, operatorType } per entry
    → serialize as JSON prop to SearchPanel island

Runtime (client):
  SearchPanel hydrates with searchablePreschools[] prop
    → User types query
    → filterPreschools(query, searchablePreschools) (src/lib/search.ts)
    → Results sorted alphabetically, capped at 10
    → Each result cross-references compareIds store for isInCompareSet
    → Renders result list with name links + compare toggle buttons
```

## i18n Keys

New keys to add under `search.*` namespace in all three locale files:

| Key | Swedish (sv) | English (en) | Arabic (ar) |
| --- | ------------ | ------------ | ----------- |
| `search.placeholder` | Sök förskola… | Search preschool… | …ابحث عن روضة أطفال |
| `search.triggerAriaLabel` | Sök | Search | بحث |
| `search.noResults` | Inga träffar | No results | لا توجد نتائج |
| `search.resultCount` | Visar {shown} av {total} | Showing {shown} of {total} | عرض {shown} من {total} |
| `search.closeAriaLabel` | Stäng sökning | Close search | إغلاق البحث |
| `search.resultsAriaLabel` | Sökresultat | Search results | نتائج البحث |
