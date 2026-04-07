# Feature Specification: Global Preschool Search

**Feature Branch**: `016-preschool-search`
**Created**: 2026-04-04
**Status**: Draft
**Input**: User description: "Add a search that is accessible from all pages of the app. It should be discrete when not used, but not be afraid to take up space when it is being used. I should be able to interact with the pre-schools from the search directly; for example, if I search on the comparison page, I should be able to add a pre-school to the comparison from the search."

## Clarifications

### Session 2026-04-04

- Q: Should search match against name only, or also address/operator type? → A: Name + address — search matches against both preschool name and address text.
- Q: Should the result list have a maximum visible count, or show all matches? → A: Show top 10 results with a count indicator (e.g., "10 of 47") to encourage query refinement.
- Q: Where should the search trigger be placed in the UI? → A: In the navigation bar, alongside CitySelector and LanguageSwitcher.
- Q: Should toggling compare from a search result dismiss the search panel? → A: No — search stays open on compare toggle so the user can add multiple preschools in sequence. Search dismisses only on navigation or explicit close.
- Q: How should search results be sorted when multiple preschools match? → A: Alphabetical by name, consistent with the directory’s default sort order.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Search and find a preschool by name (Priority: P1)

A parent visiting any page of Förskoleguiden wants to quickly find a specific preschool by typing part of its name. They activate the search field, type a query, and see a filtered list of matching preschools. They can then navigate to that preschool's detail page from the results.

**Why this priority**: Finding a known preschool by name is the most fundamental search use case. Parents often already have a preschool in mind (from word-of-mouth, neighborhood awareness, etc.) and need the fastest path to it. Without this, the user must manually scroll through 200+ preschools in the directory.

**Independent Test**: Can be fully tested by activating search on any page, typing a preschool name fragment, seeing filtered results, and clicking through to the detail page.

**Acceptance Scenarios**:

1. **Given** a user is on any page (directory, detail, or comparison), **When** they activate the search field and type at least one character, **Then** the search displays a list of preschools whose names or addresses contain the typed text (case-insensitive, diacritics-tolerant).
2. **Given** the user has typed a query that matches one or more preschools, **When** they select a result, **Then** they are navigated to that preschool's detail page.
3. **Given** the user has typed a query that matches no preschools, **When** the result list is displayed, **Then** a clear "no results" message is shown.

---

### User Story 2 — Add a preschool to comparison directly from search results (Priority: P1)

A parent on the comparison page (or any page) wants to add a preschool to their comparison without leaving the current page. They search for a preschool and use a compare action directly within the search results to toggle it into or out of the comparison set.

**Why this priority**: This is the core differentiator of the search feature — the ability to interact with results in-context. The user specifically requested being able to add preschools to the comparison from search, avoiding the friction of navigating away and back. This makes the search a productivity tool, not just a navigation shortcut.

**Independent Test**: Can be tested by opening search on the comparison page, searching for a preschool, using the compare toggle in the search result, and verifying the compare tray updates without page navigation.

**Acceptance Scenarios**:

1. **Given** a user is on any page and has search results visible, **When** they use the compare action on a search result, **Then** the preschool is added to (or removed from) the compare set without navigating away from the current page.
2. **Given** the compare set is already at the 5-preschool maximum, **When** the user tries to add another preschool from search, **Then** the system follows existing maximum-capacity behavior (the add is silently refused, matching current `toggleCompare` behavior).
3. **Given** a preschool in search results is already in the compare set, **When** the search results are displayed, **Then** that preschool's compare action reflects its current "added" state.

---

### User Story 3 — Discrete search that expands when used (Priority: P2)

A parent visits the site and sees a compact, unobtrusive search trigger (icon or collapsed field) in a consistent location on every page. When they activate it, the search experience expands to occupy meaningful screen space — showing a full input field and results panel. When they dismiss search or navigate away, it returns to its compact state.

**Why this priority**: The user explicitly asked for search that is "discrete when not used, but not afraid to take up space when it is being used." This defines the visual interaction design. It is secondary to the core search functionality (P1 stories) but essential for the intended user experience.

**Independent Test**: Can be tested by verifying the search trigger is visible and compact on each page type, activating it, confirming the expanded state covers adequate space, and dismissing it to confirm it returns to its compact form.

**Acceptance Scenarios**:

1. **Given** search is inactive, **When** the user views any page, **Then** the search trigger is visible as a compact element (e.g., icon button) that does not compete with primary page content.
2. **Given** search is inactive, **When** the user activates the search trigger, **Then** an expanded search experience appears with a prominent text input and results area that uses substantial screen space.
3. **Given** search is active and expanded, **When** the user presses Escape, clicks outside the search area, or selects a result that navigates to a detail page, **Then** the search collapses back to its compact state. Toggling the compare action on a result does NOT dismiss search.

---

### User Story 4 — Keyboard-accessible search (Priority: P2)

A keyboard-only user wants to activate search, type a query, navigate results, and interact with preschools (select or toggle compare) entirely via keyboard. The focus management is logical and screen readers announce relevant state changes.

**Why this priority**: Accessibility is a core requirement (PRD §4, P0). The search must be fully keyboard-navigable and screen-reader friendly to meet existing accessibility standards. This is essential for launch but secondary to the raw feature functionality.

**Independent Test**: Can be tested by tabbing to the search trigger, pressing Enter to activate, typing a query, using arrow keys to navigate results, pressing Enter to select, and verifying focus management throughout.

**Acceptance Scenarios**:

1. **Given** search is inactive, **When** the user tabs to the search trigger and presses Enter (or a keyboard shortcut), **Then** search activates and focus moves to the search input.
2. **Given** search is active and results are displayed, **When** the user presses the down/up arrow keys, **Then** focus moves through search results sequentially.
3. **Given** a search result is focused, **When** the user presses Enter, **Then** the result's primary action is triggered (navigate to detail page). A secondary interaction (toggle compare) is accessible via a dedicated key or tab stop within the result.
4. **Given** search is active, **When** the user presses Escape, **Then** search closes and focus returns to the element that originally triggered the search.

---

### User Story 5 — Search works with all supported languages (Priority: P3)

A user viewing the site in English or Arabic uses search. The search placeholder text, "no results" message, and result labels are all displayed in the current locale. Arabic search layout respects RTL direction.

**Why this priority**: The site supports three locales (sv, en, ar). Search labels and UI text must follow the existing i18n pattern. This is important for completeness but is a lower priority than core functionality since preschool names are in Swedish regardless of locale.

**Independent Test**: Can be tested by switching to each locale, activating search, verifying label translations, and for Arabic, verifying the RTL layout renders correctly.

**Acceptance Scenarios**:

1. **Given** the user is viewing the site in English or Arabic, **When** they activate search, **Then** all search UI text (placeholder, labels, "no results" message) is displayed in the current locale.
2. **Given** the user is viewing the site in Arabic, **When** they activate search, **Then** the search input and results respect right-to-left text direction.
3. **Given** the user searches for a preschool name (which is always in Swedish), **When** results are displayed, **Then** the preschool name, address, and operator type label are shown with the operator type translated to the current locale.

---

### Edge Cases

- What happens when the user types very quickly (debounce/throttle)? Search input should feel responsive; filtering should not block the UI or cause visible jank on 200+ preschool datasets.
- What happens when the user searches while on a detail page for a preschool that matches the search? The current page's preschool should appear in results like any other, with its compare state accurately reflected.
- What happens on very narrow screens (320 px)? The expanded search must remain usable and not overflow or obscure critical navigation elements beyond the search overlay/panel itself.
- What about preschools with no survey data (placeholder surveys)? These should be excluded from search results, consistent with the directory which only shows preschools with real survey data.
- What happens if the user opens search, types a query, then navigates to another page via a non-search link? Search should close. On the new page, the search trigger returns to its compact state.
- What happens when a very short query (e.g., a single letter) matches many preschools? The result list is capped at 10 with a total count indicator, keeping the panel manageable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A search trigger MUST be present and visible in the navigation bar on every page of the site (directory, detail, comparison), alongside the existing city selector and language switcher.
- **FR-002**: When inactive, the search trigger MUST be compact and unobtrusive — it MUST NOT compete with the primary content of the page.
- **FR-003**: When activated, the search MUST expand into a prominent experience with a text input field and a results panel that is allowed to use substantial screen space (e.g., overlay or dropdown panel).
- **FR-004**: Search MUST filter preschools by matching the user's query against preschool names and addresses. The match MUST be case-insensitive.
- **FR-005**: Search results MUST include the preschool name, address, and operator type for each match.
- **FR-006**: Each search result MUST provide a way to navigate to the preschool's detail page.
- **FR-007**: Each search result MUST provide a way to add or remove the preschool from the compare set without leaving the current page.
- **FR-008**: The compare action in search results MUST reflect the current compare state (added vs. not added) and update in real time as the user toggles.
- **FR-009**: When the compare set is at maximum capacity (5), attempting to add another from search MUST follow the same behavior as the existing compare toggle (silently refuse).
- **FR-010**: Search MUST display a clear "no results" message when the query matches zero preschools.
- **FR-011**: Search MUST be dismissible via Escape key, clicking/tapping outside the search area, or selecting a result that triggers navigation. Toggling the compare action on a search result MUST NOT dismiss the search panel — the panel stays open so the user can add multiple preschools in sequence.
- **FR-012**: Search MUST be fully keyboard-navigable: activate via keyboard, type query, navigate results with arrow keys, trigger actions with Enter.
- **FR-013**: Focus management MUST return focus to the search trigger when search is dismissed.
- **FR-014**: All user-facing search text (placeholder, labels, empty-state messages) MUST be translated using the existing i18n system for all three locales (Swedish, English, Arabic).
- **FR-015**: Search layout MUST respect RTL direction when the site is viewed in Arabic.
- **FR-016**: Preschools without survey data (placeholder surveys) MUST be excluded from search results.
- **FR-017**: Search MUST work against the full set of preschools available in the current city and survey year (Malmö, 2025 for MVP).
- **FR-018**: Search results MUST display at most 10 matching preschools at a time. When more than 10 matches exist, a count indicator MUST show the total number of matches (e.g., "Showing 10 of 47") to encourage the user to refine their query.
- **FR-019**: Search results MUST be sorted alphabetically by preschool name, consistent with the directory page's default sort order.

### Key Entities

- **Search Query**: A user-entered text string used to filter preschools. Key attributes: text value, minimum length (1 character).
- **Search Result**: A preschool that matches the current query. Attributes: preschool ID, name, address, operator type, current compare state (selected or not). Derived from `PreschoolIndexEntry` cross-referenced with available survey data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can find a specific preschool by name and reach its detail page within 10 seconds of activating search, across any page.
- **SC-002**: A user can add a preschool to the compare set from search results without navigating away from their current page.
- **SC-003**: The search trigger is visually present and accessible on 100% of site pages.
- **SC-004**: The search experience meets WCAG 2.1 AA criteria: fully keyboard-navigable, screen-reader accessible, and focus-managed.
- **SC-005**: Search UI text is translated for all three supported locales (Swedish, English, Arabic) and the Arabic layout renders correctly in RTL.
- **SC-006**: Search returns results within 200 ms of the user finishing typing for the full dataset of 200+ preschools (perceived as instant).
- **SC-007**: The expanded search state does not increase total page weight beyond the existing 100 KB budget constraint.

## Assumptions

- Preschool names are always in Swedish regardless of the active locale. Search will match against Swedish preschool names in all locales.
- The existing `PreschoolIndexEntry` data (name, address, operatorType) provides sufficient information for search results without needing to load individual survey JSON files at search time.
- The dataset size (200+ preschools) is small enough for client-side search without requiring a search index or server-side search. All data can be embedded in the page at build time.
- The compare set state (`compareIds` nanostore) is the same store used by the existing `CompareButton` component. Search results will use the same `toggleCompare` function.
- The search keyboard shortcut (if implemented) should not conflict with browser-native shortcuts or other site keyboard interactions.
- Diacritics tolerance (e.g., matching "o" to "ö") is a quality-of-life enhancement. The spec assumes basic case-insensitive substring matching as the baseline, with diacritics normalization as a reasonable default.
