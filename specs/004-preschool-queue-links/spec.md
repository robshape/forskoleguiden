# Feature Specification: Independent Preschool Queue Links

**Feature Branch**: `004-preschool-queue-links`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Step 4 (4.1 to 4.2) from Phase 2: for independent preschools, display a prominent link to the preschool's own queue registration page on detail pages and add a visual indicator on directory cards to signal the preschool has its own queue."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Parent Follows a Queue Link on an Independent Preschool Detail Page (Priority: P1)

A parent has browsed the directory, found an independent preschool they like, and opened its detail page. They want to join the queue for that preschool. The detail page shows a clearly labeled, prominently placed link that takes them directly to the preschool's own queue or registration page. The link opens in a new browser tab so they do not lose their place in the comparison flow.

**Why this priority**: Queue registration is the primary conversion action for independent preschools. A parent who has reached the detail page and wants to act must not be left wondering where or how to register. This is the most direct way the product delivers concrete value to parents.

**Independent Test**: Can be tested by building the site, opening an independent preschool detail page in each locale, and verifying that a queue link is present, labeled in the correct language, opens in a new tab, and points to the correct URL. Alone it delivers a complete, navigable action for the parent.

**Acceptance Scenarios**:

1. **Given** a parent opens a detail page for an independent preschool, **When** they view the page, **Then** a clearly labeled queue registration link is visible in the metadata or action area.
2. **Given** a parent clicks the queue link, **When** the link activates, **Then** the destination opens in a new browser tab and the detail page remains in the original tab.
3. **Given** the site is viewed in Swedish, **When** a parent reads the queue link label, **Then** the label text is in Swedish (e.g., "Anmäl dig till kö").
4. **Given** the site is viewed in English, **When** a parent reads the queue link label, **Then** the label text is in English (e.g., "Register for queue").
5. **Given** the site is viewed in Arabic, **When** a parent reads the queue link label, **Then** the label text is in Arabic and reads naturally in RTL.
6. **Given** a parent opens a detail page for a municipal preschool, **When** they view the page, **Then** no independent queue link appears.

---

### User Story 2 — Parent Spots Queue Availability While Scanning the Directory (Priority: P2)

A parent is browsing the preschool directory scanning cards to decide which preschools to investigate further. Independent preschools that have their own queue registration show a small visual indicator on their card. The indicator lets the parent know at a glance that this preschool has its own queue process — encouraging them to visit the detail page to learn more and potentially register.

**Why this priority**: The indicator increases the usefulness of the directory overview by surfacing a meaningful operational difference between preschool types. However, it is an informational hint rather than a primary action, so it is lower priority than the detail-page queue link.

**Independent Test**: Can be tested by building the site, loading the directory page, and verifying that independent preschool cards display the queue indicator while municipal preschool cards do not. No navigation to a detail page is required for this story to be functionally complete.

**Acceptance Scenarios**:

1. **Given** a parent is on the directory page, **When** they scan the preschool cards, **Then** independent preschool cards display a queue indicator consisting of a small icon and a short localized text label side by side.
2. **Given** a parent is on the directory page, **When** they scan the preschool cards, **Then** municipal preschool cards do NOT display the queue indicator.
3. **Given** the queue indicator is visible, **When** a screen reader encounters it, **Then** the visible text label is read naturally and no separate hidden accessible label is required; the rendered text is itself the accessible label.

---

### User Story 3 — Queue Links and Indicators Render Correctly Across All Three Locales (Priority: P2)

A parent switches between Swedish, English, and Arabic while comparing preschools. The queue link label on each detail page updates to match the active locale. Arabic pages render the queue link and directory indicator with RTL-appropriate alignment without breaking the surrounding layout.

**Why this priority**: The product serves parents in three languages. Queue link labels and layout must be consistent with the locale-aware design already established for language switching and Arabic RTL. Inconsistent translations or broken RTL layout would undermine trust in the localized experience.

**Independent Test**: Can be tested by building the site and opening an independent preschool detail page and the directory page in each of the three locale paths, verifying the queue link label language, the indicator presence, and their layout in each case.

**Acceptance Scenarios**:

1. **Given** a parent is on the Swedish detail page for an independent preschool, **When** they read the queue link, **Then** the label is in Swedish.
2. **Given** a parent is on the English detail page for an independent preschool, **When** they read the queue link, **Then** the label is in English.
3. **Given** a parent is on the Arabic detail page for an independent preschool, **When** they read the queue link on a mobile device, **Then** the label is in Arabic and the link and surrounding area align correctly for RTL reading without clipping or overflow.
4. **Given** a parent is on the Arabic directory page, **When** they scan the preschool cards, **Then** the queue indicator on independent preschool cards is positioned correctly for RTL layout.

---

### Edge Cases

- An independent preschool record that is missing a queue URL must not render a broken or empty link; the queue link area must be omitted gracefully, the same as for municipal preschools.
- Queue links point to external domains; they must carry `rel="noopener noreferrer"` and `target="_blank"` to prevent tab-napping and avoid exposing the referrer to the destination domain.
- The queue indicator (icon + text label) on directory cards must not be a clickable element that bypasses the detail page; it is a passive informational signal only.
- Very long queue link label text in Arabic must not overflow or clip against the surrounding detail page layout on narrow mobile viewports.
- The addition of a queue link section on the detail page must not push the preschool name, survey scores, or primary question sections off-screen on the smallest supported mobile viewport.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Detail pages for independent preschools MUST display a queue registration link when a queue URL is available for that preschool.
- **FR-002**: The queue registration link MUST open in a new browser tab and include `rel="noopener noreferrer"`.
- **FR-003**: The queue registration link label MUST use the correct localized text for the page's active locale across Swedish, English, and Arabic.
- **FR-004**: Detail pages for municipal preschools MUST NOT display an independent queue registration link.
- **FR-005**: Detail pages for independent preschools that are missing a queue URL MUST NOT display a broken or empty queue link; the queue link area must be omitted gracefully.
- **FR-006**: The queue registration link MUST be rendered as a prominent styled anchor (icon + localized label text), visually distinct from body text but lighter in visual weight than a primary button, so it is clearly identifiable as a callable action without competing with the preschool name and survey scores in the page hierarchy.
- **FR-007**: The queue registration link MUST be placed in the metadata or action area of the detail page so it is visible without scrolling past the survey question sections on a standard mobile viewport.
- **FR-008**: The directory page MUST display a queue indicator on each independent preschool card that has a queue URL; the indicator MUST consist of a small icon and a short localized text label rendered visibly side by side.
- **FR-009**: The directory card queue indicator MUST NOT appear on municipal preschool cards.
- **FR-010**: The directory card queue indicator's visible text label serves as its accessible label; no additional hidden `aria` text is required provided the label text is meaningful in all three locales.
- **FR-011**: All new user-facing text strings (queue link labels, indicator accessible text) MUST be defined in all three locale files with identical key structures, so the i18n key-parity test continues to pass.
- **FR-012**: The queue link and directory indicator MUST render correctly in the Arabic RTL layout without introducing horizontal overflow or misalignment on narrow mobile viewports.
- **FR-013**: The queue URL used in the queue link MUST come from the preschool's own data record and MUST NOT be hardcoded in the page template.

### Key Entities

- **Queue URL**: An external URL associated with an independent preschool's own queue or registration page. Optional — only present for independent preschools when the data is available.
- **Independent preschool**: A preschool operated by a private provider rather than the municipality. Eligible to display a queue link and directory indicator when a queue URL is present.
- **Municipal preschool**: A preschool operated by the municipality. Uses the city's central queue system; no independent queue link or indicator is shown on its pages or cards.
- **Queue registration link**: The prominently displayed link on a detail page that directs a parent to the independent preschool's queue registration page.
- **Queue indicator**: A small passive visual element on a directory card that signals the preschool has its own queue registration process.

## Clarifications

### Session 2026-03-24

- Q: What form should the directory card queue indicator take? → A: Icon + short text label, both rendered visibly side by side. The visible text label is also the accessible label.
- Q: What visual treatment should the detail-page queue registration link use — button or styled link? → A: Prominent styled link (visually distinct anchor with icon + label, lighter than a full button) so it does not compete with the preschool name and score in the page hierarchy.

## Assumptions

- The data model already supports an optional queue URL field on preschool index entries for independent preschools (Phase 2 Step 3). This feature builds on that foundation.
- Placeholder queue URLs are acceptable for the initial implementation; real URLs will be substituted when the data is available.
- Municipal preschools do not need a link to the municipality's central queue in this feature; that is a potential future enhancement.
- The directory presents preschool cards for all operator types in a single list; the queue indicator is an additive element and does not require restructuring the list or introducing separate sections for operator types.
- Queue URLs are trusted data originating from the project's own static data files and do not require runtime validation beyond confirming the field is a non-empty string.
- The product is a static site; the queue link is rendered as a plain anchor tag at build time, not via a dynamic redirect or server action.
- Arabic queue link labels and indicators follow the existing RTL layout approach established in the Arabic RTL feature; no new RTL infrastructure is needed.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Every independent preschool detail page in each of the three locales contains a queue registration link when a queue URL is present for that preschool, verified by inspecting the built HTML output.
- **SC-002**: No municipal preschool detail page or directory card displays a queue link or queue indicator, verified by inspecting the built HTML output.
- **SC-003**: The queue registration link on every affected detail page carries the correct new-tab and security attributes, verified in the built HTML.
- **SC-004**: Queue link labels appear in the correct language on Swedish, English, and Arabic detail pages with no locale text leaking into another locale's pages.
- **SC-005**: Every independent preschool directory card displays the queue indicator in all three locale directory pages; no municipal card does.
- **SC-006**: The i18n key-parity unit test passes with all new queue link and indicator text keys present and consistently structured across all three locale files.
- **SC-007**: Automated accessibility audits report zero new violations related to the queue link or queue indicator on directory and detail pages.
- **SC-008**: An independent preschool with a missing queue URL renders its detail page and directory card without errors or empty link elements, confirming graceful degradation.
