# Feature Specification: Accessibility Audit (Phase 2)

**Feature Branch**: `008-accessibility-audit-phase2`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "Accessibility Audit (Phase 2): Extend accessibility testing to cover all Phase 2 features including English and Arabic pages, RTL layout, language switcher, share button, and queue links. Run axe-core on all locale pages, verify keyboard navigation for new interactive elements, and ensure proper screen reader labeling."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Automated Accessibility Compliance Across All Locales (Priority: P1)

A parent using assistive technology visits the site in English or Arabic and expects the same level of accessibility as the Swedish version. All pages — directory, detail, and comparison — in every locale must pass WCAG 2.0 Level A and AA automated checks with zero violations, ensuring no locale is left behind in accessibility coverage. About pages (`/om/`) are excluded from this audit because the routes do not yet exist; they will be covered when implemented.

**Why this priority**: Accessibility compliance is a legal and ethical baseline. Phase 2 tripled the number of pages (3 locales × 4 page types) but existing automated scans only cover a subset. Without full coverage, regressions in new locale pages go undetected.

**Independent Test**: Run axe-core scans on every combination of locale and page type. Each scan independently reports pass/fail with zero violations required.

**Acceptance Scenarios**:

1. **Given** the English directory page is loaded, **When** an axe-core scan runs at WCAG 2.0 Level A and AA, **Then** zero violations are reported.
2. **Given** an English preschool detail page is loaded, **When** an axe-core scan runs, **Then** zero violations are reported.
3. **Given** the English comparison page is loaded with 2+ preschools seeded, **When** an axe-core scan runs, **Then** zero violations are reported.
4. **Given** the Arabic directory page is loaded, **When** an axe-core scan runs, **Then** zero violations are reported and `dir="rtl"` is present on the root element.
5. **Given** an Arabic preschool detail page is loaded, **When** an axe-core scan runs, **Then** zero violations are reported.
6. **Given** the Arabic comparison page is loaded with 2+ preschools seeded, **When** an axe-core scan runs, **Then** zero violations are reported.

---

### User Story 2 — Keyboard Navigation for Phase 2 Interactive Elements (Priority: P1)

A keyboard-only user (or someone using a switch device) navigates the site and expects all new Phase 2 interactive elements — language switcher links, share button, and queue links — to be reachable via Tab and activatable via Enter or Space, with a visible focus indicator on each element.

**Why this priority**: Keyboard operability is a WCAG 2.1 Level A requirement (2.1.1 Keyboard). Phase 2 introduced three new categories of interactive elements. If any is unreachable or inoperable by keyboard, an entire class of users is blocked.

**Independent Test**: Tab through each page type, verify focus lands on every new interactive element, press Enter/Space, and confirm the expected action occurs — all without a mouse.

**Acceptance Scenarios**:

1. **Given** a user is on the Swedish directory page, **When** they press Tab repeatedly, **Then** focus lands on the language switcher toggle, and pressing Enter or Space opens the locale options, and pressing Tab then Enter on a locale link navigates to the target locale page.
2. **Given** a user is on the comparison page with 2+ preschools selected, **When** they press Tab, **Then** focus reaches the Share button, and pressing Enter or Space triggers the share action (clipboard copy or fallback display).
3. **Given** a user is on an independent preschool's detail page, **When** they press Tab, **Then** focus reaches the queue registration link, and pressing Enter opens the link target.
4. **Given** any interactive element receives focus, **When** the user visually inspects the screen, **Then** a visible focus ring is displayed around the focused element.
5. **Given** the share confirmation message appears after clicking Share, **When** focus is inspected, **Then** focus has not been trapped or moved to the confirmation message — the user can continue tabbing normally.

---

### User Story 3 — Screen Reader Labeling for New Elements (Priority: P2)

A screen reader user navigates the site and expects every new Phase 2 element to have meaningful labels, announcements, and semantic structure — so they understand what each control does and receive timely feedback when state changes occur.

**Why this priority**: Without proper labeling, screen reader users encounter unlabeled buttons, links without context, and silent state changes (e.g., share confirmation never announced). This degrades the experience from "usable" to "broken" for blind users. Ranked P2 because it builds on the P1 keyboard navigation foundation.

**Independent Test**: Navigate with a screen reader (or inspect DOM attributes) and verify each new element has correct ARIA attributes and that dynamic feedback is announced via live regions.

**Acceptance Scenarios**:

1. **Given** a screen reader user navigates to the language switcher, **When** the switcher region is encountered, **Then** it is announced as a navigation landmark with a descriptive label (e.g., "Language" or the locale-appropriate equivalent).
2. **Given** the currently active locale in the language switcher, **When** the screen reader reads it, **Then** it announces the element as the current page (via `aria-current="page"`), and each switcher link is pronounced in its own language (via `lang` attribute on each link).
3. **Given** a screen reader user focuses the Share button on the comparison page, **When** it is read, **Then** it is announced with a descriptive label (e.g., "Share comparison" or the locale equivalent), not just "button".
4. **Given** the user activates the Share button, **When** the confirmation message appears, **Then** the screen reader announces the confirmation text (e.g., "Link copied!") via a live region, without requiring the user to navigate to the message.
5. **Given** a share restoration encounters invalid preschool IDs, **When** a warning message is displayed, **Then** the screen reader announces the warning via a live region.
6. **Given** a share restoration fails entirely, **When** an error message is displayed, **Then** the screen reader announces the error via an assertive live region.
7. **Given** a screen reader user focuses a queue registration link on a detail page, **When** it is read, **Then** the link text is descriptive (e.g., "Register for queue" or the locale equivalent) and indicates it opens in a new window.

---

### Edge Cases

- What happens when axe-core reports violations that are false positives in RTL context (e.g., text direction heuristics)? The team reviews and documents justified exclusions rather than suppressing all RTL-related rules.
- What happens when a dynamically rendered element (e.g., share confirmation) disappears before the screen reader can announce it? The auto-dismiss duration must be long enough (minimum 2 seconds) for screen readers to process the live region announcement.
- What happens when the language switcher is rendered but the target locale page does not exist (broken link)? Axe-core catches the broken link as a violation; the fix is in the page generation, not the accessibility test.
- What happens when a queue link URL is a placeholder (e.g., example.com)? The accessibility audit tests link semantics and labeling, not URL validity — URL validation is a separate data contract concern.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The automated accessibility test suite MUST run axe-core scans (WCAG 2.0 Level A and Level AA) on every page type (directory, detail, comparison) for every supported locale (Swedish, English, Arabic), with zero violations required to pass. About pages are excluded until the routes exist.
- **FR-002**: The test suite MUST seed the comparison page with at least 2 preschools before scanning, so the comparison content (cards, scores, summary) is present during the accessibility check.
- **FR-003**: The test suite MUST verify that all Phase 2 interactive elements (language switcher links, share button, queue registration links) are reachable via sequential Tab key presses and activatable via Enter or Space key.
- **FR-004**: The test suite MUST verify that a visible focus indicator appears on every interactive element when it receives keyboard focus.
- **FR-005**: The language switcher navigation MUST be enclosed in a landmark with a descriptive `aria-label` in the page's locale language.
- **FR-006**: The currently active locale in the language switcher MUST be marked with `aria-current="page"`.
- **FR-007**: Each language switcher link MUST carry a `lang` attribute matching its target locale so screen readers pronounce locale names correctly.
- **FR-008**: The Share button MUST have an accessible label (visible text or `aria-label`) that describes its action.
- **FR-009**: The share confirmation message MUST use a live region (`role="status"` or `aria-live="polite"`) so screen readers announce it without requiring user navigation.
- **FR-010**: Share restoration warning messages (partial ID failures) MUST use a live region so screen readers announce them.
- **FR-011**: Share restoration error messages (complete decode failures) MUST use `role="alert"` so screen readers announce them assertively.
- **FR-012**: Queue registration links on detail pages MUST have descriptive link text (not generic text like "Click here") and MUST indicate they open in a new window.
- **FR-013**: The share confirmation auto-dismiss timing MUST allow at least 2 seconds for screen readers to process the live region announcement before the message is removed or hidden.
- **FR-014**: After the Share button is activated, focus MUST NOT be trapped or forcibly moved to the confirmation message — the user's focus position MUST remain stable.

### Key Entities

- **Locale Page**: A combination of locale (`sv`, `en`, `ar`) and page type (directory, detail, comparison, about) — the unit of accessibility scanning.
- **Interactive Element**: A focusable, operable UI control introduced in Phase 2 — language switcher link, share button, queue registration link.
- **Live Region**: A DOM element with ARIA live region attributes that causes screen readers to announce content changes without user navigation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero axe-core violations (WCAG 2.0 Level A and AA) across all 9 locale-page combinations (3 locales × 3 existing page types; about pages deferred until routes exist) when the test suite runs in CI.
- **SC-002**: 100% of Phase 2 interactive elements (language switcher links, share button, queue links) are reachable via keyboard Tab navigation and operable via Enter or Space, as verified by automated e2e tests.
- **SC-003**: Every new interactive element displays a visible focus indicator when focused, as verified by computed style assertions in e2e tests.
- **SC-004**: All dynamic feedback messages (share confirmation, share warning, share error) are announced by screen readers via live regions, as verified by DOM attribute assertions in e2e tests.
- **SC-005**: The language switcher navigation landmark, `aria-current` marking, and `lang` attributes are present and correct on every locale page, as verified by DOM assertions in e2e tests.
- **SC-006**: All accessibility tests pass as part of the existing CI pipeline with no manual intervention required.
