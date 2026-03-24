# Feature Specification: Arabic RTL Layout

**Feature Branch**: `003-arabic-rtl-layout`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Step 2 (2.1 to 2.5) from Phase 2: ensure Arabic locale pages render correctly in right-to-left layout across the shell, directory, detail pages, and comparison experience without regressing Swedish or English."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Arabic-Speaking Parent Browses the Site Shell Naturally (Priority: P1)

An Arabic-speaking parent opens the Arabic version of the site and immediately finds that the page reads naturally from right to left. The site title, language controls, attribution, spacing, and text alignment feel intentionally mirrored rather than merely translated. Nothing appears visually backwards or awkward.

**Why this priority**: This is the foundation for the Arabic experience. If the global shell still feels left-to-right, every page feels unfinished and harder to trust.

**Independent Test**: Can be tested by loading the Arabic directory and about pages and verifying that the navigation area, page content, and footer attribution all read naturally right-to-left while remaining fully readable on mobile and desktop.

**Acceptance Scenarios**:

1. **Given** a user opens an Arabic page, **When** they view the global navigation, **Then** the shell reads right-to-left with mirrored spacing and alignment.
2. **Given** a user opens an Arabic page, **When** they inspect the footer and attribution area, **Then** text alignment and spacing match Arabic reading direction.
3. **Given** a user opens the Arabic about page, **When** they scan the page structure, **Then** headings, body copy, and navigation controls follow the same RTL presentation as the rest of the Arabic site.

---

### User Story 2 — Arabic Directory Interactions Feel Native (Priority: P1)

An Arabic-speaking parent browses the preschool directory, reads card content comfortably, uses the sort control, and adds a preschool to compare. The directory feels designed for Arabic: labels align correctly, action controls sit in sensible positions, and selected states remain obvious.

**Why this priority**: The directory is the main entry point to the product. If sorting and compare actions feel visually inconsistent or misplaced in Arabic, the core browsing flow breaks down.

**Independent Test**: Can be tested by loading the Arabic directory page, confirming card text and score content are legible in RTL, using the sort control, and toggling a compare button.

**Acceptance Scenarios**:

1. **Given** a user is on the Arabic directory page, **When** they read preschool cards, **Then** the card content aligns and flows naturally for Arabic reading order.
2. **Given** a user is on the Arabic directory page, **When** they use the sort control, **Then** the control remains visible, readable, and operable without layout collisions or reversed meaning.
3. **Given** a user is on the Arabic directory page, **When** they toggle a compare button, **Then** the button remains easy to identify, the selected state is obvious, and the control does not shift into an awkward position.

---

### User Story 3 — Arabic Detail Pages Preserve Clarity and Direction (Priority: P1)

An Arabic-speaking parent opens a specific preschool detail page. The back navigation, metadata, question cards, chart labels, and response summaries all read naturally in Arabic. Directional cues point the correct way for RTL instead of feeling copied from the Swedish or English versions.

**Why this priority**: Detail pages are where parents slow down and evaluate a preschool. Directional mistakes here create friction exactly where trust and comprehension matter most.

**Independent Test**: Can be tested by opening an Arabic preschool detail page and verifying that back navigation, metadata blocks, question sections, and chart-related text are readable and directionally correct.

**Acceptance Scenarios**:

1. **Given** a user is on an Arabic preschool detail page, **When** they use the back navigation, **Then** the directional cue matches RTL expectations.
2. **Given** a user is on an Arabic preschool detail page, **When** they read the metadata and question sections, **Then** headings, labels, and supporting values are aligned for Arabic reading order.
3. **Given** a user is on an Arabic preschool detail page, **When** they review chart labels and response values, **Then** the information remains understandable and visually balanced in RTL.

---

### User Story 4 — Arabic Comparison Remains Readable with Multiple Selections (Priority: P1)

An Arabic-speaking parent adds several preschools and opens the comparison page. The selected-count label, comparison cards, summaries, and persistent compare tray all feel coherent in Arabic. The comparison remains usable on a narrow phone screen without introducing confusing directional behavior.

**Why this priority**: The comparison page is one of the product's highest-value flows. It must remain easy to scan in Arabic even when the page becomes dense with data.

**Independent Test**: Can be tested by selecting two or more preschools in Arabic, opening the comparison page, and confirming that the comparison content, summary section, and compare tray present correctly in RTL on mobile.

**Acceptance Scenarios**:

1. **Given** a user has selected preschools in Arabic, **When** they open the comparison page, **Then** the comparison content is aligned for RTL reading order.
2. **Given** a user has selected preschools in Arabic, **When** they read the comparison summary, **Then** the summary text is easy to scan and not visually anchored as if it were an LTR page.
3. **Given** a user has selected preschools in Arabic, **When** they use the compare tray actions on a narrow phone screen, **Then** the actions remain visible, tappable, and directionally sensible without clipping or overlap.

---

### User Story 5 — Swedish and English Are Unchanged (Priority: P2)

A Swedish- or English-speaking parent continues to use the site after the Arabic RTL work ships. Their pages still behave like left-to-right interfaces. No spacing, alignment, or control order regression appears in the existing Swedish and English flows.

**Why this priority**: RTL fixes that bleed into LTR locales would turn a targeted improvement into a cross-locale regression.

**Independent Test**: Can be tested by rerunning existing Swedish and English browsing and comparison flows and confirming that layout, navigation, and compare interactions remain unchanged.

**Acceptance Scenarios**:

1. **Given** a user is on a Swedish page, **When** they browse the directory and comparison flows, **Then** the layout remains left-to-right and matches the current experience.
2. **Given** a user is on an English page, **When** they browse the directory and detail flows, **Then** the layout remains left-to-right and stable.
3. **Given** RTL improvements have shipped, **When** automated regression checks run against Swedish and English pages, **Then** no locale-agnostic layout regressions are introduced.

---

### Edge Cases

- Very long Arabic preschool names or addresses must not collide with action controls or clip out of their containers.
- Mixed-script content, such as Latin preschool names inside Arabic UI, must remain readable and not scramble punctuation or numeric values.
- The Arabic comparison experience must remain usable with one selection, with two to five selections, and when the compare tray is present.
- Narrow mobile screens must not introduce accidental horizontal overflow or place primary controls off-screen.
- Any decorative directional cue used in LTR must have an Arabic-equivalent presentation that does not imply the wrong direction.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Every Arabic page MUST present its primary reading direction consistently from right to left across the global shell and page content.
- **FR-002**: The Arabic global shell MUST mirror the visual alignment and spacing of the Swedish and English shells so that navigation, headings, and attribution feel intentionally adapted rather than merely translated.
- **FR-003**: The Arabic directory page MUST present preschool cards, score information, sorting controls, and compare actions in a layout that is comfortable to read and operate in RTL.
- **FR-004**: Interactive controls on the Arabic directory page MUST preserve clear selected, pressed, and hover or focus states after the RTL adaptation.
- **FR-005**: Arabic preschool detail pages MUST present directional navigation cues, metadata, question content, and response summaries in an RTL-friendly arrangement.
- **FR-006**: Information visualizations and their accompanying labels or value lists on Arabic detail pages MUST remain understandable and visually balanced in RTL.
- **FR-007**: The Arabic comparison experience MUST present selected-count text, comparison content, summaries, and persistent tray actions in a layout that is readable in RTL on both mobile and desktop.
- **FR-008**: The Arabic comparison experience MUST remain usable with one to five selected preschools without clipping key content or obscuring primary actions.
- **FR-009**: Arabic pages MUST remain keyboard accessible and screen-reader friendly after the RTL layout changes.
- **FR-010**: Swedish and English pages MUST preserve their existing left-to-right layout and interaction behavior with no regressions introduced by Arabic-specific changes.
- **FR-011**: The same preschool data, routes, and compare-state behavior MUST remain available across locales; this feature changes presentation and directional behavior, not product scope.
- **FR-012**: Arabic pages MUST continue to display survey numbers and percentages using Western numerals (`0-9`) rather than switching to a different numeral system.
- **FR-013**: Any directional back-navigation cue shown on Arabic detail pages MUST be visually mirrored to match RTL expectations.

### Key Entities

- **Arabic page**: Any page in the Arabic locale, including the directory, detail, comparison, and about experiences.
- **Global shell**: The site-wide navigation, layout framing, and footer that appear consistently across pages.
- **Directory card**: A preschool listing in the directory that contains name, metadata, score information, and compare actions.
- **Detail section**: A preschool detail page section containing metadata, question content, and supporting response information.
- **Comparison experience**: The selected-count area, comparison content, summary content, and persistent compare tray shown when one or more preschools are selected.

## Clarifications

### Session 2026-03-24

- Q: For Arabic, should the comparison page keep the current stacked layout or be redesigned into a more explicitly RTL comparison layout? → A: Keep the current stacked layout and adapt RTL alignment only.
- Q: How should numeric values like percentages render on Arabic pages? → A: Keep Western numerals (`0-9`) in the Arabic UI.
- Q: What should happen to the detail-page back navigation cue in Arabic? → A: Mirror the directional cue for RTL.

## Assumptions

- Multi-locale routing and the language switcher already exist and correctly route users into the Arabic locale.
- Arabic translations already exist for the affected pages, so this feature focuses on layout, alignment, and directional clarity rather than translation coverage.
- The compare selection model and underlying preschool data do not change as part of this feature.
- The site remains mobile-first, with the narrow-phone experience treated as the primary layout constraint.
- The Arabic comparison page continues to use the same stacked information structure as the current product; this feature adapts its presentation for RTL rather than redefining the comparison model.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Arabic directory, detail, comparison, and about pages can be manually reviewed on mobile and desktop without any major left-to-right alignment errors.
- **SC-002**: An Arabic-speaking user can sort the directory, toggle compare selection, open a detail page, and use the comparison page without encountering clipped controls or unreadable RTL layout.
- **SC-003**: The Arabic comparison experience remains readable with two or more selected preschools on a narrow mobile viewport and does not introduce unintended horizontal overflow for primary content.
- **SC-004**: Automated accessibility audits report zero new violations on Arabic directory, detail, and comparison pages after the RTL work.
- **SC-005**: Existing Swedish regression coverage for the main browsing and comparison flows continues to pass, demonstrating that RTL changes did not leak into LTR locales.
- **SC-006**: Any directional cue visible to users on Arabic pages matches RTL expectations rather than reusing an LTR-oriented presentation.
