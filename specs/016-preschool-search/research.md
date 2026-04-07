# Research: Global Preschool Search

**Feature**: 016-preschool-search
**Date**: 2026-04-04

## R1: Client-side search approach for 461 preschools

### Decision

Use inline JavaScript string matching (`String.prototype.includes()` after normalization) against a build-time-embedded array of search entries. No search library needed.

### Rationale

- The dataset is 461 preschool entries, each with a name (~30 chars) and address (~40 chars). Total searchable text is roughly 30 KB.
- At this scale, a linear scan with `Array.filter()` completes in <1 ms on modern devices. No index, trie, or fuzzy-matching library is justified.
- A search library (e.g., Fuse.js ~5 KB, MiniSearch ~7 KB) would violate the island JS budget (~3–5 KB total) for negligible benefit on a sub-500-item dataset.
- The approach is deterministic, dependency-free, and trivially testable.

### Alternatives considered

| Alternative | Why rejected |
| ----------- | ------------ |
| Fuse.js (fuzzy search) | Adds ~5 KB gzipped JS; fuzzy matching not needed for exact substring search on known names. Overkill for dataset size. |
| MiniSearch | Adds ~7 KB gzipped; pre-built index adds build complexity. Dataset too small to benefit. |
| Pagefind (static search) | Designed for full-text content search across site pages; adds a WASM runtime (~40 KB). Far too heavy for filtering a flat list. |
| FlexSearch | Adds ~6 KB; multi-language tokenization unnecessary since preschool names are always Swedish. |

## R2: Diacritics normalization strategy

### Decision

Use `String.prototype.normalize('NFD').replace(/[\u0300-\u036f]/g, '')` to strip combining diacritics before comparison. This allows "o" to match "ö", "a" to match "ä"/"å", etc.

### Rationale

- Swedish preschool names frequently contain ä, å, ö. Parents may not have Swedish keyboard layout or may type from memory without diacritics.
- `NFD` normalization decomposes characters like "ö" into "o" + combining diaeresis, then the regex strips the combining mark.
- This is a well-established Unicode normalization technique with zero dependencies.
- Does not affect display — only the comparison key is normalized; displayed names retain original diacritics.

### Alternatives considered

| Alternative | Why rejected |
| ----------- | ------------ |
| `Intl.Collator` with sensitivity: 'base' | Good for sorting but `Collator.compare()` only tells < / = / > — doesn't support substring matching. Would need to iterate character by character. |
| No normalization | Would frustrate users who type "forskola" expecting to find "förskola". Poor UX for the primary use case. |

## R3: ARIA pattern for search widget

### Decision

Use the WAI-ARIA combobox pattern (`role="combobox"`) with a listbox popup (`role="listbox"`) for search results. The search input has `aria-expanded`, `aria-controls`, `aria-activedescendant`. Each result is a `role="option"` with a nested compare button.

### Rationale

- The WAI-ARIA Authoring Practices Guide (APG) defines the [combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) as the standard for text input + filtered list widgets.
- `aria-activedescendant` on the input allows the input to retain DOM focus while visually indicating which result is "active" — this means the user can keep typing while arrowing through results.
- Screen readers announce the active result name and position (e.g., "3 of 10").
- The compare toggle button within each result is a separate tab stop, accessible via Tab after arrowing to a result, or directly via a button within the option.

### Alternatives considered

| Alternative | Why rejected |
| ----------- | ------------ |
| `role="search"` landmark only | A landmark identifies the region but provides no keyboard interaction pattern for results navigation. Insufficient for the required arrow-key navigation. |
| Native `<datalist>` element | Does not support custom rendering (compare buttons, address display) or custom styling. Too limited for this use case. |
| Dialog/modal pattern | Over-engineered — the search is a dropdown overlay, not a modal. Modal semantics (focus trapping) would prevent interaction with the compare tray. |

## R4: Data embedding strategy for search entries

### Decision

Astro pages pass the searchable preschool list as a JSON-serialized prop to the SearchPanel Preact island. Each page's Astro front matter reads the index at build time, filters out placeholder surveys, and passes the resulting array.

### Rationale

- This follows the existing pattern used by `CompareButton` and `CompareTray` — Astro computes data at build time and passes it as props to Preact islands.
- The search data is a subset of `PreschoolIndexEntry` fields (id, name, address, operatorType) — roughly 30 KB for 461 entries after JSON serialization. This is within the 100 KB page-weight budget when accounting for existing page content.
- No new data-loading mechanism required; reuses `getPreschoolIndex()` + `isPlaceholderSurvey()`.
- The data is embedded once per page (as part of the island's serialized props) rather than loaded via a separate fetch.

### Alternatives considered

| Alternative | Why rejected |
| ----------- | ------------ |
| Separate JSON file fetched on search activation | Adds a runtime network request (violates "no runtime external APIs" constraint). Also delays search availability until fetch completes. |
| Shared global JavaScript variable | Works but breaks the Astro island encapsulation pattern. Props are the idiomatic way to pass build-time data to Preact islands. |
| Import the JSON directly in the Preact component | `readFileSync` in `data.ts` only works at build time (Node.js). Preact islands run client-side. Data must be serialized into props. |

## R5: Search panel open/close state management

### Decision

Use local component state (`useState`) within the SearchPanel island for open/close toggle. No nanostore needed for search visibility.

### Rationale

- Search open/close is page-local UI state — it does not need to persist across page navigations (Astro MPA model means each page starts fresh).
- No other island needs to know whether search is open.
- Using a nanostore would be over-engineering for single-component local state.
- The `compareIds` nanostore is the only cross-island state the search component reads (via `useStore`), which is already established.

### Alternatives considered

| Alternative | Why rejected |
| ----------- | ------------ |
| Nanostore atom for search open state | No other component consumes this state; nanostore adds unnecessary indirection for local UI state. |
| URL query parameter for search state | Would trigger page navigation in Astro MPA model; search state is ephemeral and shouldn't be URL-encoded. |

## R6: Impact on page-weight budget

### Decision

The search data (~30 KB for 461 entries) plus the SearchPanel island code (~2–3 KB) must fit within the existing 100 KB uncompressed page-weight budget. This requires validating that current page weights leave sufficient headroom.

### Rationale

- The post-build test enforces 100 KB uncompressed per page.
- Current pages must be measured to confirm headroom. The search data will be embedded on every page (directory, detail, comparison) since it's inside the Nav/BaseLayout.
- If the budget is tight, the searchable data payload can be trimmed (e.g., omit addresses from the embedded data and match name-only, or truncate long addresses).
- Worst case: the 461-entry dataset with id + name + address + operatorType serializes to approximately 25–35 KB. This is the critical number to validate.

### Alternatives considered

| Alternative | Why rejected |
| ----------- | ------------ |
| Lazy-load search data on first activation | Violates "no runtime external APIs" constraint. Also adds latency to the first search interaction. |
| Reduce dataset by only including names | Removes address search capability (already committed in the spec clarifications). Only as a fallback if budget is exceeded. |
