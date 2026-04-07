# Quickstart: Global Preschool Search

**Feature**: 016-preschool-search
**Date**: 2026-04-04

## Prerequisites

- Node.js (see `.nvmrc` or `engines` in `package.json`)
- pnpm (enforced by `engines` in `package.json`)

## Setup

```bash
# Clone and install
git clone https://github.com/robshape/forskoleguiden.git
cd forskoleguiden
git checkout 016-preschool-search
pnpm install

# Start dev server
pnpm dev
# → http://localhost:4321/forskoleguiden/sv/
```

## Files to Create

### 1. `src/lib/search.ts` — Search filtering logic

> **References**: research.md R1 (Array.filter, no search library), R2 (NFD diacritics); data-model.md → SearchablePreschool, SearchQuery entities; spec FR-004, FR-018, FR-019

Pure utility module with no side effects. Two exported functions:

- `normalizeText(text: string): string` — Lowercases, applies NFD Unicode normalization, and strips combining diacritical marks (regex `/[\u0300-\u036f]/g`). Used for diacritics-tolerant matching (e.g., "o" matches "ö"). *(research.md R2)*
- `filterPreschools(query: string, preschools: SearchablePreschool[]): { results: SearchablePreschool[], totalCount: number }` — Filters preschools whose normalized name or address contains the normalized query. Returns the first 10 matches (alphabetical by name) plus the total count of all matches. *(research.md R1; data-model.md → SearchResult capping/ordering)*

Type: `SearchablePreschool = { id: string, name: string, address: string, operatorType: 'municipal' | 'independent' }` *(data-model.md → SearchablePreschool entity)*

### 2. `src/components/preact/SearchPanel.tsx` — Search island

> **References**: research.md R3 (ARIA combobox pattern), R4 (data as island props), R5 (local useState for open/close); data-model.md → SearchablePreschool props, State Transitions diagram, Compare Toggle rules; spec FR-001 through FR-013, FR-015, FR-018, FR-019

Single Preact island encompassing both the compact trigger (magnifying glass icon button) and the expanded search panel (input + results list).

**Props** (passed from Nav.astro at build time — follows CompareTray prop pattern, see research.md R4):
- `searchablePreschools: SearchablePreschool[]` — Full list of searchable preschools *(data-model.md → SearchablePreschool entity)*
- `locale: Locale` — Current page locale
- `basePath: string` — Base URL path (from `getBasePath()`)
- i18n label props: `placeholder`, `triggerAriaLabel`, `noResultsText`, `resultCountTemplate`, `closeAriaLabel`, `resultsAriaLabel`, `addLabel`, `addedLabel`, `compareButtonAriaLabelTemplate` *(data-model.md → i18n Keys table)*

**Internal state**: `isOpen` (boolean), `query` (string), `activeIndex` (number, for keyboard navigation) *(research.md R5 — local useState, no nanostore)*

**External state**: `useStore(compareIds)` from `@nanostores/preact` for compare toggle state. *(data-model.md → Compare Toggle rules)*

**Hydration**: `client:only="preact"` — SSR would render stale compare state from sessionStorage.

**ARIA pattern** *(research.md R3)*: Combobox with listbox (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` on input; `role="listbox"` on results container; `role="option"` on each result).

### 3. `tests/unit/search-filtering.test.ts` — Unit tests

> **References**: plan.md Phase 1 steps 1a–1d; research.md R1, R2; spec FR-004, FR-018, FR-019; constitution IV (test-first)

Test the `filterPreschools` and `normalizeText` functions:
- Case-insensitive matching
- Diacritics normalization (ö→o, ä→a, å→a)
- Matching name field
- Matching address field
- Result capping at 10
- Total count accuracy beyond cap
- Empty query returns no results
- No-match returns empty array
- Alphabetical sort order of results

### 4. `tests/e2e/search-panel.spec.ts` — E2e tests

> **References**: plan.md Phase 4 steps 4a–4c; spec SC-001 through SC-007; user stories 1–5

Test the search user flows:
- Search trigger visible on directory, detail, and comparison pages
- Activate search → input focused, panel expanded
- Type query → results appear
- Click result → navigates to detail page
- Toggle compare from result → compare tray updates, search stays open
- Escape → search closes, focus returns to trigger
- Arrow key navigation through results
- No results message for non-matching query
- RTL layout for Arabic locale

## Files to Modify

### 1. `src/components/astro/Nav.astro`

> **References**: research.md R4 (data embedding as props); data-model.md → Data Flow (build-time section), SearchablePreschool entity; spec FR-001, FR-016, FR-017; plan.md Phase 3 step 3b

Add the SearchPanel island alongside CitySelector and LanguageSwitcher. Pass build-time preschool data and i18n labels as props. The data preparation logic:
- Import `getPreschoolIndex`, `getPreschoolSurveyByYear`, `isPlaceholderSurvey` from `@/lib/data`
- Load index, filter out placeholder surveys, map to `{ id, name, address, operatorType }` *(data-model.md → SearchablePreschool source description)*
- Resolve all 6 `search.*` i18n keys via `t()` and pass as string props *(same pattern as CompareTray — see CompareTray.tsx for reference)*
- Pass as `searchablePreschools` prop to SearchPanel with `client:only="preact"` hydration

### 2. `src/i18n/sv.json`, `en.json`, `ar.json`

> **References**: data-model.md → i18n Keys table (full translations for all 3 locales); plan.md Phase 2 steps 2a–2d; spec FR-014; constitution VI

Add `search.*` namespace keys (see data-model.md → i18n Keys table for exact translations):
- `search.placeholder` — Input placeholder text
- `search.triggerAriaLabel` — Aria label for trigger button
- `search.noResults` — Empty state text
- `search.resultCount` — Template: "Showing {shown} of {total}"
- `search.closeAriaLabel` — Aria label for close button
- `search.resultsAriaLabel` — Aria label for results region

## Development Workflow

```bash
# Run unit tests (watches for changes)
pnpm test

# Run specific test file
pnpm test -- tests/unit/search-filtering.test.ts

# Run e2e tests (auto-starts preview server)
pnpm test:e2e

# Run full quality gate
pnpm validate

# Check page weight budget
pnpm build && pnpm test:post-build
```

## Key Integration Points

- **Compare state** *(data-model.md → Compare Toggle rules; spec FR-007, FR-008, FR-009)*: Import `toggleCompare` and `compareIds` from `@/lib/state`. Use `useStore(compareIds)` to read current selections. Call `toggleCompare(id)` when compare button clicked in search results. Follows the same pattern as `CompareButton.tsx`.
- **Base path** *(spec FR-006)*: All detail page links must use `${basePath}/${locale}/forskola/${id}/` format.
- **RTL** *(spec FR-015)*: Use `isRtlLocale(locale)` from `@/lib/locale-switch` to conditionally apply RTL-specific layout classes.
- **i18n** *(research.md R4; data-model.md → i18n Keys table)*: Use `t()` for all labels in Nav.astro when building props; pass pre-resolved strings to the Preact island (same pattern as CompareTray).
- **Page-weight budget** *(research.md R6; spec SC-007)*: The 461-entry dataset adds ~30 KB per page. Run `pnpm test:post-build` after build to validate the 100 KB budget. If tight, see R6 fallback strategies.
