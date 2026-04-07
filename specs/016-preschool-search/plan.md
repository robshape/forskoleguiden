# Implementation Plan: Global Preschool Search

**Branch**: `016-preschool-search` | **Date**: 2026-04-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/016-preschool-search/spec.md`

## Summary

Add a global preschool search accessible from the navigation bar on all pages. The search trigger is a compact icon button that expands into an overlay with a full-width input and scrollable results panel (capped at 10 results, alphabetically sorted). Users can navigate to a preschool's detail page or toggle compare directly from results without leaving the current page. Search matches against preschool names and addresses (case-insensitive, diacritics-tolerant). The search is a Preact island hydrated with `client:only="preact"` — it reads from a build-time-embedded list of searchable preschools (461 entries) and shares the existing `compareIds` nanostore for compare state.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode via `astro/tsconfigs/strict`)
**Primary Dependencies**: Astro 6.1.1, Preact 10.29.0, @nanostores/preact 1.1.0, Tailwind CSS 4.2.2
**Storage**: N/A — no runtime storage; search data embedded at build time; compare state via nanostores + `sessionStorage`
**Testing**: Vitest 4.1.2 (unit), Playwright 1.58.2 + @axe-core/playwright (e2e)
**Target Platform**: Static site (GitHub Pages CDN), mobile-first (iPhone 17 — 393×852 px, responsive 320–430 px)
**Project Type**: Static web application (Astro MPA with Preact islands)
**Performance Goals**: Search results visible within 200 ms of typing; page weight ≤ 100 KB uncompressed per page
**Constraints**: Zero runtime external APIs; total island JS budget ~3–5 KB; 461 preschools dataset embedded client-side
**Scale/Scope**: 461 preschools × 3 locales × 3 page types = search available on ~9 pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --------- | ------ | ----- |
| I. Performance by Default | PASS | Search is a Preact island (justified: needs client-side state for input, filtering, compare toggle). Data embedded at build time — no runtime fetches. Island code will be code-split. Must validate page-weight budget post-implementation. |
| II. Accessibility First | PASS | Spec requires full keyboard navigation (arrow keys, Enter, Escape), ARIA combobox/listbox pattern, focus management, screen-reader announcements. RTL support for Arabic. |
| III. Data Integrity | PASS | Search data derived from the same `PreschoolIndex` used by the directory. Filtered at build time to exclude placeholder surveys. No new data sources. |
| IV. Testing Standards | PASS | Unit tests for search filtering logic (diacritics, case-insensitive, result capping). E2e tests for search UX flow, keyboard navigation, compare-from-search. Post-build weight test validates budget. |
| V. Architecture Discipline | PASS | Preact island justified (requires `useState`, event handlers, nanostore subscription). Placed in `src/components/preact/`. Search filtering logic in `src/lib/search.ts`. Named function declaration for component. |
| VI. Internationalization | PASS | All search UI text via `t()`. New i18n keys for all 3 locales. Key parity enforced by existing unit test. RTL via `isRtlLocale()`. |
| VII. Privacy by Design | PASS | No external APIs, no tracking, no cookies. Search is purely client-side against embedded data. |

**Gate result: PASS** — No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/016-preschool-search/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── astro/
│   │   └── Nav.astro              # Modified: add SearchTrigger island
│   └── preact/
│       └── SearchPanel.tsx        # New: search island (input, results, compare toggles)
├── lib/
│   └── search.ts                  # New: search filtering logic (filterPreschools, normalizeText)
└── i18n/
    ├── sv.json                    # Modified: add search.* keys
    ├── en.json                    # Modified: add search.* keys
    └── ar.json                    # Modified: add search.* keys

tests/
├── unit/
│   └── search-filtering.test.ts   # New: unit tests for search logic
└── e2e/
    └── search-panel.spec.ts       # New: e2e tests for search UX
```

**Structure Decision**: Follows existing architecture — Preact island in `src/components/preact/`, pure logic utility in `src/lib/`, i18n keys in existing locale JSONs. No new directories needed. The search component is a single island (`SearchPanel.tsx`) that encapsulates both the compact trigger and expanded panel states — this avoids needing two separate components that coordinate open/close state.

## Implementation Phases

Phases are sequential — each depends on the previous. Tests are written before production code (constitution IV). Within a phase, steps marked **[P]** can run in parallel.

```text
Phase 1 (Search Logic — test-first)
  └─► Phase 2 (i18n Keys)
        └─► Phase 3 (Search UI Island — US1, US2, US3)
              └─► Phase 4 (E2e Tests + Full Verification)
```

### Phase 1: Search Logic (test-first, no UI)

Write failing unit tests for the search filtering module, then implement. This is the foundational utility that Phase 3 depends on.

| Step | File | What | References |
| ---- | ---- | ---- | ---------- |
| 1a | `tests/unit/search-filtering.test.ts` | Write failing unit tests for `normalizeText()` and `filterPreschools()` — covers case-insensitive matching, diacritics normalization (ö→o, ä→a, å→a), name + address matching, result cap at 10, total count accuracy, empty query, no-match, alphabetical sort | research.md R1 (Array.filter approach), R2 (NFD diacritics); data-model.md → SearchablePreschool entity, SearchQuery entity; spec FR-004, FR-018, FR-019 |
| 1b | — | Run `pnpm test -- search-filtering` — tests **fail** on import (module doesn't exist yet); this is the expected red baseline | constitution IV |
| 1c | `src/lib/search.ts` | Implement `normalizeText()` (lowercase + NFD + strip `/[\u0300-\u036f]/g`) and `filterPreschools()` (normalize query, filter by name/address `includes()`, sort alphabetically, cap at 10, return `{ results, totalCount }`) | research.md R1 (no search library), R2 (NFD normalization); data-model.md → SearchablePreschool type, SearchResult capping/ordering rules; spec FR-004, FR-018, FR-019 |
| 1d | — | Run `pnpm test -- search-filtering` — tests **pass** | constitution IV |

**Checkpoint**: Search filtering logic implemented and tested. `filterPreschools()` is a pure function with no UI dependencies. Phase 2 can begin.

### Phase 2: i18n Keys

Add all search-related i18n keys to all three locale files. Must complete before Phase 3 — the SearchPanel island depends on these keys being available as props.

| Step | File | What | References |
| ---- | ---- | ---- | ---------- |
| 2a | `src/i18n/sv.json` | Add `search.*` keys (6 keys): `placeholder`, `triggerAriaLabel`, `noResults`, `resultCount`, `closeAriaLabel`, `resultsAriaLabel` — Swedish values from the i18n Keys table | data-model.md → i18n Keys table (full translations); spec FR-014; constitution VI |
| 2b [P] | `src/i18n/en.json` | Add matching English `search.*` keys — same 6 keys, English translations | data-model.md → i18n Keys table; spec FR-014 |
| 2c [P] | `src/i18n/ar.json` | Add matching Arabic `search.*` keys — same 6 keys, Arabic translations | data-model.md → i18n Keys table; spec FR-014, FR-015 |
| 2d | — | Run `pnpm test -- i18n-locale-key-parity` — key parity test passes | constitution VI |

**Checkpoint**: All i18n keys in place. Key parity green. Phase 3 can now resolve these keys via `t()` in Astro and pass as props.

### Phase 3: Search UI Island (User Stories 1, 2, 3)

Build the SearchPanel Preact island and integrate it into Nav. This phase covers all three user stories since they are all aspects of the same island component.

| Step | File | What | References |
| ---- | ---- | ---- | ---------- |
| 3a | `src/components/preact/SearchPanel.tsx` | Create the search island: compact trigger (magnifying glass `<button>`) + expanded overlay (combobox input + listbox results). Internal state: `isOpen`, `query`, `activeIndex` via `useState`. External state: `useStore(compareIds)`. Results rendered with name link (`${basePath}/${locale}/forskola/${id}/`) + compare toggle button (`toggleCompare(id)`). Keyboard: arrow keys for `activeIndex`, Enter for select/navigate, Escape to close + restore focus. Click-outside to close. RTL via `isRtlLocale(locale)`. Result count indicator via `interpolate(resultCountTemplate, { shown, total })`. | research.md R1 (filterPreschools call), R3 (ARIA combobox pattern: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` on input; `role="listbox"` on results; `role="option"` on each result), R5 (local `useState` for open/close); data-model.md → SearchablePreschool props shape, State Transitions diagram, Compare Toggle rules; spec FR-001 through FR-013, FR-015, FR-018, FR-019; quickstart.md → SearchPanel.tsx section for full prop list |
| 3b | `src/components/astro/Nav.astro` | Import `getPreschoolIndex`, `getPreschoolSurveyByYear`, `isPlaceholderSurvey` from `@/lib/data`. Load index, iterate entries, filter out placeholders, map to `{ id, name, address, operatorType }`. Import `t` from `@/i18n/utils`. Resolve all 6 `search.*` i18n keys. Render `<SearchPanel client:only="preact" ... />` alongside CitySelector and LanguageSwitcher in the `ms-auto` div. | research.md R4 (data embedding as props — same pattern as CompareTray); data-model.md → Data Flow (build-time section); spec FR-001, FR-016, FR-017; quickstart.md → Nav.astro modification section |
| 3c | — | Manual smoke test: `pnpm dev` → verify search trigger visible on all page types → search, filter, compare-from-search, keyboard nav, RTL on Arabic locale | spec SC-001 through SC-006; user stories 1–4 |

**Checkpoint**: Search is functional on all pages. Compact trigger expands to full search panel. Filtering, compare toggle, keyboard navigation, and i18n all working. Ready for e2e tests.

### Phase 4: E2e Tests + Full Verification

Write end-to-end tests covering all user stories and success criteria. Run the full quality gate.

| Step | File | What | References |
| ---- | ---- | ---- | ---------- |
| 4a | `tests/e2e/search-panel.spec.ts` | E2e tests covering: (1) search trigger visible on directory, detail, and comparison pages; (2) activate → input focused, panel expanded; (3) type query → results appear; (4) click result → navigates to detail page; (5) toggle compare from result → compare tray updates, search stays open; (6) Escape → closes, focus returns to trigger; (7) arrow key navigation; (8) no-results message; (9) RTL layout for Arabic; (10) result count indicator accuracy | spec SC-001 through SC-007; user stories 1–5 |
| 4b | — | Run `pnpm validate` — all quality gates pass: lint, format, check, test, build, e2e, Lighthouse | spec SC-007; constitution I, IV |
| 4c | — | Run `pnpm test:post-build` — page-weight budget passes with search data embedded on all pages | research.md R6 (page-weight impact); spec SC-007 |

**Checkpoint**: Feature complete. All success criteria met. All existing tests pass without regression. Branch is ready for PR.
