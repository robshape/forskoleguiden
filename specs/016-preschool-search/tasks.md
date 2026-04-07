# Tasks: Global Preschool Search

**Input**: Design documents from `specs/016-preschool-search/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are included — the spec and project constitution (Principle IV) require test-first development. Unit tests are written before production code; e2e tests are written after all UI is implemented.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. Phases are sequential — each depends on the previous. Within a phase, tasks marked **[P]** can run in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Every task includes exact file paths and parenthetical cross-references

---

## Phase 1: Foundation (Test-First, No UI)

**Purpose**: Write failing unit tests, then implement the search filtering utility and add i18n keys. All user story phases depend on these being complete.

**⚠️ CRITICAL**: No user story UI work can begin until this phase is complete.

- [x] T001 Create `tests/unit/search-filtering.test.ts` — write failing unit tests for `normalizeText()` and `filterPreschools()`: case-insensitive matching, diacritics normalization (ö→o, ä→a, å→a), name field matching, address field matching, result capping at 10, total count accuracy beyond cap, empty query returns no results, no-match returns empty array, alphabetical sort order of results *(plan.md Phase 1 step 1a; research.md R1 — Array.filter approach, R2 — NFD diacritics; data-model.md → SearchablePreschool entity, SearchQuery entity, SearchResult capping/ordering; spec FR-004, FR-018, FR-019; constitution IV)*
- [x] T002 Run `pnpm test -- search-filtering` — tests **fail** on import (module doesn't exist yet); this is the expected red baseline *(plan.md Phase 1 step 1b; constitution IV)*
- [x] T003 Create `src/lib/search.ts` — implement `normalizeText(text: string): string` (lowercase + `String.prototype.normalize('NFD')` + strip `/[\u0300-\u036f]/g`) and `filterPreschools(query: string, preschools: SearchablePreschool[]): { results: SearchablePreschool[], totalCount: number }` (normalize query, filter by name/address `includes()`, sort alphabetically by name, cap at 10, return results + totalCount). Export the `SearchablePreschool` type: `{ id: string, name: string, address: string, operatorType: 'municipal' | 'independent' }`. Empty query returns `{ results: [], totalCount: 0 }`. *(plan.md Phase 1 step 1c; research.md R1 — no search library, R2 — NFD normalization; data-model.md → SearchablePreschool type, SearchResult capping/ordering rules; quickstart.md → search.ts section; spec FR-004, FR-018, FR-019)*
- [x] T004 Run `pnpm test -- search-filtering` — all tests **pass** *(plan.md Phase 1 step 1d; constitution IV)*
- [x] T005 [P] Add `search.*` keys to `src/i18n/sv.json` — 6 keys: `search.placeholder` ("Sök förskola…"), `search.triggerAriaLabel` ("Sök"), `search.noResults` ("Inga träffar"), `search.resultCount` ("Visar {shown} av {total}"), `search.closeAriaLabel` ("Stäng sökning"), `search.resultsAriaLabel` ("Sökresultat") *(plan.md Phase 2 step 2a; data-model.md → i18n Keys table; spec FR-014; constitution VI)*
- [x] T006 [P] Add matching `search.*` keys to `src/i18n/en.json` — same 6 keys with English translations: "Search preschool…", "Search", "No results", "Showing {shown} of {total}", "Close search", "Search results" *(plan.md Phase 2 step 2b; data-model.md → i18n Keys table; spec FR-014)*
- [x] T007 [P] Add matching `search.*` keys to `src/i18n/ar.json` — same 6 keys with Arabic translations: "…ابحث عن روضة أطفال", "بحث", "لا توجد نتائج", "عرض {shown} من {total}", "إغلاق البحث", "نتائج البحث" *(plan.md Phase 2 step 2c; data-model.md → i18n Keys table; spec FR-014, FR-015)*
- [x] T008 Run `pnpm test -- i18n-locale-key-parity` — key parity test passes; all three locale files have identical key structures *(plan.md Phase 2 step 2d; constitution VI)*

**Checkpoint**: Search filtering logic implemented and tested. All i18n keys in place. Key parity green. UI phases can now reference these keys via `t()` calls and import `filterPreschools` in components.

---

## Phase 2: User Story 1+3 — Search, Find, Navigate + Expand/Collapse UX (Priority: P1+P2) 🎯 MVP

**Goal**: A parent on any page activates a compact search trigger in the nav bar. The search expands into a prominent overlay with a text input and results panel. They type a query and see up to 10 matching preschools (name + address + operator type), sorted alphabetically. Clicking a result navigates to the preschool's detail page. Escape, click-outside, or navigation dismisses the search back to compact form.

> **Note**: US1 (search+find) and US3 (expand/collapse) are combined because the expand/collapse mechanism IS how search is activated — they cannot be implemented or tested independently.

**Independent Test**: Open any page → verify compact trigger visible → activate → type a preschool name fragment → see filtered results with count indicator → click result → arrive at detail page. Dismiss via Escape → trigger returns to compact state.

### Implementation for User Story 1+3

- [x] T009 [US1] Create `src/components/preact/SearchPanel.tsx` — single Preact island encompassing compact trigger (magnifying glass `<button>` with `triggerAriaLabel`) and expanded search panel. **Trigger**: icon button, 44×44 px touch target, renders when `isOpen === false`. **Expanded panel**: overlay with full-width `<input>` (uses `placeholder` prop), results list below. **Internal state**: `isOpen` (boolean, `useState`), `query` (string, `useState`). **Filtering**: import `filterPreschools` from `@/lib/search` — call on every query change, render up to 10 `SearchablePreschool` results with name (as `<a>` link to `${basePath}/${locale}/forskola/${id}/`), address, and operator type. **Count indicator**: when `totalCount > results.length`, render text via `interpolate(resultCountTemplate, { shown: results.length, total: totalCount })`. **No-results**: when query is non-empty and results are empty, render `noResultsText`. **Dismiss**: Escape key → close + restore focus to trigger; click-outside → close (attach document click listener with cleanup); clicking a result link → natural navigation closes panel. **ARIA structure**: `role="combobox"` + `aria-expanded` on input wrapper, `role="listbox"` + `aria-label={resultsAriaLabel}` on results container, `role="option"` on each result. **Hydration**: `client:only="preact"`. **Props**: `searchablePreschools`, `locale`, `basePath`, `placeholder`, `triggerAriaLabel`, `noResultsText`, `resultCountTemplate`, `closeAriaLabel`, `resultsAriaLabel`, `addLabel`, `addedLabel`, `compareButtonAriaLabelTemplate` *(plan.md Phase 3 step 3a; research.md R1 — filterPreschools call, R3 — ARIA combobox semantic structure, R5 — local useState for open/close; data-model.md → SearchablePreschool props shape, State Transitions diagram; quickstart.md → SearchPanel.tsx section for full prop list; spec FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-010, FR-011, FR-013, FR-018, FR-019)*
- [x] T010 [US1] Integrate SearchPanel into `src/components/astro/Nav.astro` — in front matter: import `getPreschoolIndex`, `getPreschoolSurveyByYear`, `isPlaceholderSurvey` from `@/lib/data`; import `t` from `@/i18n/utils`; import `getBasePath` from `@/lib/base-path`; import `SearchPanel` from `@/components/preact/SearchPanel`. Load index via `getPreschoolIndex()`, iterate `index.preschools`, for each entry call `getPreschoolSurveyByYear(entry.id, '2025')` and filter out entries where `isPlaceholderSurvey(survey)` is true, map remaining to `{ id: entry.id, name: entry.name, address: entry.address, operatorType: entry.operatorType }`. Resolve all i18n props via `t('search.*', locale)`. Also resolve `addLabel`, `addedLabel`, `compareButtonAriaLabelTemplate` via existing `compareTray.*` or `preschoolCard.*` i18n keys (same labels as CompareButton). Render `<SearchPanel client:only="preact" ... />` in the `ms-auto` div alongside existing CitySelector and LanguageSwitcher. *(plan.md Phase 3 step 3b; research.md R4 — data embedding as props, same pattern as CompareTray; data-model.md → Data Flow build-time section, SearchablePreschool source; quickstart.md → Nav.astro modification section; spec FR-001, FR-016, FR-017)*

**Checkpoint**: Search is functional on all pages. Compact trigger expands to full search panel. Filtering, result display with count indicator, and navigation all work. Dismiss via Escape and click-outside works. US1 and US3 are independently testable. Compare toggle not yet present.

---

## Phase 3: User Story 2 — Compare from Search (Priority: P1)

**Goal**: A parent searches for a preschool and toggles it into or out of the compare set directly from the search results, without leaving the current page or dismissing the search panel. They can add multiple preschools in sequence.

**Independent Test**: Open search on comparison page → search for a preschool → click compare toggle in result → verify compare tray updates → search stays open → verify toggle reflects "added" state. Add a second preschool. Verify max-capacity behavior at 5.

### Implementation for User Story 2

- [x] T011 [US2] Enhance SearchPanel in `src/components/preact/SearchPanel.tsx` — import `useStore` from `@nanostores/preact`, `compareIds` and `toggleCompare` from `@/lib/state`. Call `useStore(compareIds)` to get current IDs. For each search result, add a compare toggle `<button>`: if `currentIds.includes(result.id)` → render `addedLabel` with `aria-pressed="true"` + check icon; else → render `addLabel` with `aria-pressed="false"` + plus icon. On click: call `toggleCompare(result.id)` — existing nanostore handles max capacity (silently refuses at 5). Compare toggle click MUST NOT close the search panel (event handler only calls `toggleCompare`, does not set `isOpen = false`). Use `interpolate(compareButtonAriaLabelTemplate, { name: result.name })` for accessible button label. *(plan.md Phase 3 step 3a — compare toggle portion; research.md R5 — compareIds is the only cross-island state; data-model.md → Compare Toggle rules, SearchResult.isInCompareSet; quickstart.md → Key Integration Points → Compare state; spec FR-007, FR-008, FR-009, FR-011)*

**Checkpoint**: Compare toggle works in search results. Compare tray reflects additions/removals. Search stays open on toggle. Max capacity silently refuses. US1, US2, and US3 are all independently testable.

---

## Phase 4: User Story 4 — Keyboard Navigation & Accessibility (Priority: P2)

**Goal**: A keyboard-only user can activate search via Tab + Enter, type a query, navigate results with arrow keys, trigger the primary action (navigate) with Enter, reach the compare toggle via Tab, and dismiss search with Escape. Screen readers announce the active result and result count.

**Independent Test**: Tab to search trigger → press Enter → verify input focused → type query → press Down arrow → verify first result is visually highlighted and screen reader announces it → press Down/Up arrows → verify active index changes → press Enter → verify navigation to detail page. Tab to compare toggle within active result → press Enter/Space → verify toggle. Press Escape → verify search closes and focus returns to trigger.

### Implementation for User Story 4

- [x] T012 [US4] Enhance SearchPanel in `src/components/preact/SearchPanel.tsx` — add `activeIndex` state (`useState<number>(-1)`, -1 means no active result). On input `onKeyDown`: ArrowDown → increment `activeIndex` (wrap to 0 at end), ArrowUp → decrement (wrap to last at start), Enter with `activeIndex >= 0` → navigate to active result's detail URL via `window.location.href`, Escape → close + restore focus. Add `aria-activedescendant` on input pointing to `search-option-${activeIndex}` when `activeIndex >= 0`. Add `id={`search-option-${index}`}` and `aria-selected={index === activeIndex}` on each `role="option"`. Visually highlight the active result (e.g., `bg-surface-hover` class when `index === activeIndex`). Within each option, the compare toggle button should be reachable via Tab when that option is active. Reset `activeIndex` to -1 when query changes. *(plan.md Phase 3 step 3a — keyboard portion; research.md R3 — ARIA combobox pattern: aria-activedescendant, role="option", aria-selected; data-model.md → State Transitions diagram; spec FR-012, FR-013; spec US4 acceptance scenarios 1–4)*

**Checkpoint**: Full keyboard navigation works. Arrow keys move through results, Enter navigates, Tab reaches compare toggle per result, Escape dismisses with focus restoration. Screen readers announce active result via aria-activedescendant. US4 is independently testable.

---

## Phase 5: User Story 5 — i18n & RTL Layout (Priority: P3)

**Goal**: The search experience renders correctly in all three locales. Arabic locale displays the search panel in RTL direction. UI text (placeholder, labels, no-results) is displayed in the current locale.

**Independent Test**: Switch to Arabic locale → activate search → verify input right-aligned, results panel flows RTL → type query → verify results render correctly. Switch to English → verify English labels. Switch to Swedish → verify Swedish labels.

### Implementation for User Story 5

- [x] T013 [US5] Add RTL support to SearchPanel in `src/components/preact/SearchPanel.tsx` — import `isRtlLocale` from `@/lib/locale-switch`. When `isRtlLocale(locale)` is true, apply `rtl:` Tailwind variants to: panel positioning (flip horizontal alignment), input text direction, result list layout, close button position, compare toggle button position. Verify that the magnifying glass trigger, input placeholder, and no-results text all render correctly in RTL. The `dir` attribute is already set by BaseLayout on the `<html>` element — the component should use Tailwind's `rtl:` variant classes which respond to the inherited direction. *(plan.md Phase 3 step 3a — RTL portion; research.md R3 — ARIA pattern in RTL; quickstart.md → Key Integration Points → RTL; spec FR-015; spec US5 acceptance scenarios 1–2)*

**Checkpoint**: All locales render correctly. Arabic layout is fully RTL. All user stories (US1–US5) are independently verifiable.

---

## Phase 6: E2e Tests + Full Verification

**Purpose**: Write end-to-end tests covering all user stories and success criteria. Run the full project quality gate.

- [x] T014 Create `tests/e2e/search-panel.spec.ts` — e2e tests covering: (1) search trigger visible on directory, detail, and comparison pages (spec SC-003); (2) activate search → input focused, panel expanded (US3); (3) type query → results appear with name + address (US1, spec SC-001); (4) click result → navigates to detail page (US1, spec SC-001); (5) toggle compare from result → compare tray updates, search stays open (US2, spec SC-002); (6) Escape → search closes, focus returns to trigger (US4, spec SC-004); (7) arrow key navigation through results + Enter to select (US4, spec SC-004); (8) no-results message for non-matching query (US1, spec FR-010); (9) RTL layout for Arabic locale (US5, spec SC-005); (10) result count indicator accuracy ("Showing X of Y") (spec FR-018). Use axe-core accessibility scan on page with search open for WCAG 2.1 AA compliance (spec SC-004). *(plan.md Phase 4 step 4a; quickstart.md → e2e tests section; spec SC-001 through SC-007; user stories 1–5)*
- [x] T015 Run `pnpm validate` — all quality gates pass: lint, format, check, test, build, e2e, Lighthouse *(plan.md Phase 4 step 4b; spec SC-007; constitution I, IV)*
- [x] T016 Run `pnpm test:post-build` — page-weight budget passes with search data (~30 KB for 461 entries) embedded on all pages. If budget is tight, apply fallback from research.md R6 (trim addresses or truncate long values). *(plan.md Phase 4 step 4c; research.md R6 — page-weight impact; spec SC-007)*

**Checkpoint**: Feature complete. All success criteria met. All existing tests pass without regression. Branch is ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Foundation — search.ts + i18n keys)
  └─► Phase 2 (US1+US3 — SearchPanel + Nav integration) 🎯 MVP
        ├─► Phase 3 (US2 — compare toggle)
        ├─► Phase 4 (US4 — keyboard navigation)
        └─► Phase 5 (US5 — RTL layout)
              └─► Phase 6 (E2e tests + full verification)
```

- **Foundation (Phase 1)**: No dependencies — can start immediately. BLOCKS all UI phases.
- **US1+US3 (Phase 2)**: Depends on Foundation. Delivers MVP — functional search on all pages.
- **US2 (Phase 3)**: Depends on Phase 2. Can run in **parallel** with Phase 4 and Phase 5 (different concerns in same file, non-overlapping code regions).
- **US4 (Phase 4)**: Depends on Phase 2. Can run in **parallel** with Phase 3 and Phase 5.
- **US5 (Phase 5)**: Depends on Phase 2. Can run in **parallel** with Phase 3 and Phase 4.
- **E2e + Verification (Phase 6)**: Depends on ALL user story phases (3, 4, 5) being complete.

### User Story Dependencies

- **US1+US3 (P1+P2)**: Can start after Foundation. No dependencies on other stories. **This is the MVP.**
- **US2 (P1)**: Can start after US1+US3. Adds to existing SearchPanel. Independently testable.
- **US4 (P2)**: Can start after US1+US3. Adds to existing SearchPanel. Independently testable.
- **US5 (P3)**: Can start after US1+US3. Adds to existing SearchPanel. Independently testable.

### Within Each Phase

- Foundation: Unit tests MUST fail before implementation (constitution IV)
- US1+US3: Create component before Nav integration (T009 → T010)
- US2, US4, US5: Each is a single enhancement task on SearchPanel.tsx
- E2e: All story phases must be complete before writing e2e tests

### Parallel Opportunities

- **Phase 1**: T005, T006, T007 can run in parallel (different i18n files, no dependencies)
- **Phases 3, 4, 5**: Can all run in parallel after Phase 2 completes (additive enhancements to different code regions in SearchPanel.tsx)

---

## Parallel Example: Foundation Phase

```bash
# Sequential: test-first for search logic
T001: Write failing tests in tests/unit/search-filtering.test.ts
T002: Verify red baseline
T003: Implement src/lib/search.ts
T004: Verify green

# Parallel: i18n keys (3 independent files)
T005: Add keys to src/i18n/sv.json
T006: Add keys to src/i18n/en.json  ──┐ [P] all three in parallel
T007: Add keys to src/i18n/ar.json  ──┘

# Sequential: verify parity
T008: Run i18n key parity test
```

## Parallel Example: User Story Phases (after Phase 2)

```bash
# All three can proceed in parallel (different code regions)
Phase 3 — T011: Add compare toggle to SearchPanel.tsx
Phase 4 — T012: Add keyboard navigation to SearchPanel.tsx  ──┐ [P]
Phase 5 — T013: Add RTL support to SearchPanel.tsx           ──┘
```

---

## Implementation Strategy

### MVP First (US1+US3 Only)

1. Complete Phase 1: Foundation (search.ts + i18n keys)
2. Complete Phase 2: US1+US3 (SearchPanel + Nav integration)
3. **STOP and VALIDATE**: Search works — trigger expands, query filters, results navigate to detail pages
4. Proceed to remaining stories or deploy MVP

### Incremental Delivery

1. Foundation → search utility tested and i18n keys in place
2. Add US1+US3 → functional search on all pages (MVP!)
3. Add US2 → compare-from-search (major UX upgrade)
4. Add US4 → full keyboard navigation (accessibility requirement)
5. Add US5 → RTL polish (i18n completeness)
6. E2e tests → full verification → ready for PR
7. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story from spec.md
- US1+US3 are merged because expand/collapse IS the search activation mechanism — they cannot be tested independently
- Compare toggle labels (`addLabel`, `addedLabel`, `compareButtonAriaLabelTemplate`) reuse existing i18n keys from the CompareButton pattern — no new keys needed for these
- Page-weight budget (~30 KB dataset + ~2–3 KB island code) must be validated in T016 — see research.md R6 for fallback strategies if budget is tight
- All file paths are relative to repository root
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
