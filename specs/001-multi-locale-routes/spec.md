# Feature Specification: Multi-Locale Page Routes

**Feature Branch**: `001-multi-locale-routes`
**Created**: 2026-03-23
**Status**: Draft
**Input**: User description: "Multi-locale page routes: generate English and Arabic versions of all existing Swedish pages so every route has a /{locale}/ equivalent. Foundation for language switcher and RTL."

## User Scenarios & Testing _(mandatory)_

### User Story 1 — English-Speaking Parent Browses the Site (Priority: P1)

An English-speaking parent in Malmö visits the site and navigates to the English version. They can browse the full preschool directory, open individual preschool detail pages, view the comparison page, and read the about page — all in English. Every page they visit displays English text and all navigation keeps them within the English locale.

**Why this priority**: English is the most commonly needed additional language after Swedish. Many international families in Malmö read English first. Without English pages, a significant portion of the target audience cannot use the site at all.

**Independent Test**: Can be fully tested by loading the English directory page, verifying English headings and labels appear, clicking a preschool card, and confirming the detail page also shows English content within the English locale path.

**Acceptance Scenarios**:

1. **Given** the site is built, **When** a user navigates to the English directory page, **Then** they see a page with English headings and labels derived from the English translation file.
2. **Given** the user is on the English directory page, **When** they click a preschool card, **Then** they are taken to the English detail page for that preschool (the URL stays within the English locale path).
3. **Given** the user is on the English directory page, **When** they navigate to the comparison page, **Then** the comparison page renders in English.
4. **Given** the user is on any English page, **When** they inspect the page markup, **Then** the HTML language attribute is set to English and there is no right-to-left direction attribute.

---

### User Story 2 — Arabic-Speaking Parent Browses the Site in RTL (Priority: P2)

An Arabic-speaking parent visits the Arabic version of the site. They see all content in Arabic with proper right-to-left text direction. The directory, detail pages, comparison page, and about page are all available in Arabic. The layout reads naturally from right to left.

**Why this priority**: Arabic is the third required language and introduces the critical RTL layout requirement. While the actual RTL styling is out of scope for this step, the page infrastructure (correct HTML attributes and Arabic content rendering) must be in place first.

**Independent Test**: Can be tested by loading the Arabic directory page, verifying Arabic text appears, confirming the HTML attributes include both the Arabic language and RTL direction, and navigating to a detail page to verify consistent Arabic content.

**Acceptance Scenarios**:

1. **Given** the site is built, **When** a user navigates to the Arabic directory page, **Then** they see a page with Arabic headings and labels from the Arabic translation file.
2. **Given** the user is on the Arabic directory page, **When** they inspect the HTML element, **Then** it contains both the Arabic language attribute and a right-to-left direction attribute.
3. **Given** the user is on any Arabic page, **When** they click a preschool card, **Then** they are taken to the Arabic detail page for that preschool (the URL stays within the Arabic locale path).
4. **Given** the user is on the Arabic about page, **When** they read the content, **Then** it displays Arabic text from the Arabic translation file.

---

### User Story 3 — Internal Navigation Stays Within the Active Locale (Priority: P1)

A user browsing the site in any language finds that all internal links — preschool cards, breadcrumbs, comparison page links, back links — keep them within their current locale. They never accidentally cross into a different language while navigating.

**Why this priority**: Consistent locale context is fundamental to a usable multilingual experience. If links break locale boundaries, the user experience becomes confusing and unreliable.

**Independent Test**: Can be tested by loading an English page, following every internal link type (card link, comparison link, back link), and asserting every resulting URL stays within the English locale path.

**Acceptance Scenarios**:

1. **Given** the user is on the English directory page, **When** they click a preschool card link, **Then** the resulting URL contains the English locale path prefix.
2. **Given** the user is on an English detail page, **When** they click the breadcrumb back link, **Then** they return to the English directory page.
3. **Given** the user is on the English detail page and came from the comparison page, **When** they click the breadcrumb, **Then** they return to the English comparison page.
4. **Given** the user is on an Arabic detail page, **When** they click any navigation link, **Then** all resulting URLs contain the Arabic locale path prefix.

---

### User Story 4 — Default Language for First-Time Visitors (Priority: P3)

A first-time visitor who arrives at the site root (without a locale in the URL) is automatically directed to the Swedish version of the site. Swedish is the default language as the site primarily serves Malmö residents.

**Why this priority**: While important for user experience, the existing Phase 1 behavior already handles Swedish as the default. This story ensures that the new multi-locale routes do not break the current default landing behavior.

**Independent Test**: Can be tested by visiting the root URL and verifying the user ends up on the Swedish directory page.

**Acceptance Scenarios**:

1. **Given** a user visits the site root URL (no locale prefix), **When** the page loads, **Then** they are redirected to the Swedish locale directory page.

---

### User Story 5 — Build Output Verification for All Locales (Priority: P2)

After the site is built, all three locales have the same set of pages generated. No locale is missing any page that exists in another locale. This ensures the build pipeline correctly produces the full multilingual output.

**Why this priority**: Build verification is essential infrastructure for ongoing development. Without automated checks, locale parity can silently drift, causing broken links or missing pages.

**Independent Test**: Can be tested by examining the build output directory and asserting all three locale directories contain matching HTML files for every route.

**Acceptance Scenarios**:

1. **Given** the site has been built, **When** the build output is inspected, **Then** the Swedish, English, and Arabic locale directories each exist with the same set of page files.
2. **Given** the site has been built, **When** the English directory page HTML is examined, **Then** it contains English-language content (not Swedish).
3. **Given** the site has been built, **When** the Arabic directory page HTML is examined, **Then** it contains the RTL direction attribute.

---

### Edge Cases

- What happens if a user manually types a URL in a locale that doesn't exist (e.g., `/de/`)? The site should return a 404 or redirect to the default locale.
- What happens if a user navigates to an English detail page for a preschool ID that doesn't exist? The page should 404 consistently across all locales.
- What happens if translation keys are missing for a locale? The i18n system should fall back to the key string itself as a visible indicator (existing behavior).
- What happens if the preschool data changes (new preschool added or removed)? All three locales should reflect the same data set since they share the same data source.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The site MUST generate a complete set of pages for each of the three supported locales (Swedish, English, Arabic) at the same URL paths, differing only by the locale prefix.
- **FR-002**: English pages MUST display all user-facing text in English using the English translation file.
- **FR-003**: Arabic pages MUST display all user-facing text in Arabic using the Arabic translation file.
- **FR-004**: Arabic pages MUST include a right-to-left direction attribute on the root HTML element.
- **FR-005**: English pages MUST NOT include a right-to-left direction attribute.
- **FR-006**: Every internal link on any page MUST stay within the current locale — navigating from an English page always leads to another English page, and likewise for Arabic and Swedish.
- **FR-007**: The root URL (no locale prefix) MUST redirect visitors to the Swedish locale as the default.
- **FR-008**: All locale versions MUST display the same preschool data (names, scores, addresses) since they share one data source. Only the UI text language differs.
- **FR-009**: The dynamic preschool detail pages MUST be generated for every preschool in every locale, using the same set of preschool IDs.
- **FR-010**: The build output MUST include all three locale directories, each containing the same number and structure of pages.
- **FR-011**: The existing Swedish pages MUST continue to work identically after the English and Arabic pages are added — no regressions.

### Key Entities

- **Locale**: One of three supported languages (Swedish, English, Arabic). Determines the URL prefix, display language, and text direction. Swedish is the default.
- **Page Route**: A URL path within a locale that maps to a specific page (directory, detail, comparison, about). Every route exists in all three locales with identical structure.
- **Translation File**: A per-locale file containing all user-facing text keyed by identifiers. All locale files share identical key structures.

## Assumptions

- The three translation files (Swedish, English, Arabic) already exist with complete and structurally identical keys. No new translation keys need to be added for this feature.
- The existing component architecture already accepts a `locale` parameter and routes all user-facing text through the translation function. No component refactoring is needed.
- All internal link construction in existing components already uses dynamic locale interpolation (not hardcoded to Swedish). This has been verified in the codebase.
- The right-to-left direction attribute is already conditionally applied by the base layout when the locale is Arabic. No layout changes are needed for this step (component-level RTL styling is a separate step).
- End-to-end test URL constants are currently hardcoded to Swedish paths. These will need updating in a separate testing step but are not blockers for this feature's core functionality.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The build output contains three locale directories (Swedish, English, Arabic), each with an identical count of generated HTML pages.
- **SC-002**: An English directory page contains English-language headings (not Swedish) when the HTML is inspected.
- **SC-003**: An Arabic directory page contains Arabic-language text and the root HTML element includes both the Arabic language attribute and the RTL direction attribute.
- **SC-004**: Clicking a preschool card link on the English directory page navigates to a detail page URL that stays within the English locale path.
- **SC-005**: The root URL redirects to the Swedish locale directory page.
- **SC-006**: All existing Swedish-locale end-to-end tests continue to pass without modification, confirming zero regression.
- **SC-007**: The total build output stays within the established page-weight budget per page (100 KB uncompressed).
