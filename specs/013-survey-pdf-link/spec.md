# Feature Specification: Survey PDF Link on Detail Pages

**Feature Branch**: `013-survey-pdf-link`
**Created**: 2026-03-31
**Status**: Draft
**Input**: User description: "Add a link to the original data PDF for each preschool on the preschool details page. All the links can be found here: https://malmo.se/Bo-och-leva/Utbildning-och-forskola/Forskola/Utveckling-av-forskolorna-i-Malmo/Delaktighet-och-paverkan-i-forskolan/Forskoleenkaten/Resultat-fran-forskoleenkaten-2025.html"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Parent Views the Original Survey Data for a Preschool (Priority: P1)

A parent has opened a preschool's detail page and reviewed the survey summary shown on Förskoleguiden. They want to verify the data or see the full original report published by Malmö stad. The detail page displays a clearly labeled link that opens the official survey results PDF for that specific preschool. The link opens in a new browser tab so the parent does not lose their place on the detail page.

**Why this priority**: Transparency and trust are core product values. Parents must be able to verify that the displayed data matches the official source. Providing one-click access to the original PDF closes the trust gap and is the primary value this feature delivers.

**Independent Test**: Can be tested by building the site, opening any preschool detail page, and verifying that a link to the survey PDF is present, labeled in the correct language for the active locale, opens in a new tab, and points to the correct PDF URL hosted on `forskoleenkatresultat.malmo.se`.

**Acceptance Scenarios**:

1. **Given** a parent opens a preschool detail page, **When** they view the page, **Then** a clearly labeled link to the original survey PDF is visible in the metadata or action area.
2. **Given** a parent clicks the survey PDF link, **When** the link activates, **Then** the PDF opens in a new browser tab and the detail page remains in the original tab.
3. **Given** a preschool has a survey PDF URL in its data, **When** the detail page renders, **Then** the link destination matches the official PDF URL for that specific preschool.
4. **Given** the site is viewed in Swedish, **When** a parent reads the PDF link label, **Then** the label text is in Swedish.
5. **Given** the site is viewed in English, **When** a parent reads the PDF link label, **Then** the label text is in English.
6. **Given** the site is viewed in Arabic, **When** a parent reads the PDF link label, **Then** the label text is in Arabic and reads naturally in RTL.

---

### User Story 2 — Parent Understands the Data Source Attribution (Priority: P2)

A parent is on a preschool detail page and notices the survey PDF link. The link label or surrounding context makes it clear that the data originates from an official municipal survey ("Förskoleenkäten 2025" by Malmö stad). This reinforces trust in the data without requiring the parent to click through and read the PDF.

**Why this priority**: Attribution strengthens credibility. Even parents who never click the PDF link benefit from seeing that the data is sourced from an official survey. However, the link itself (User Story 1) must exist first for attribution to be meaningful.

**Independent Test**: Can be tested by loading a detail page and verifying that the link label or surrounding text conveys the official data source clearly enough that a parent unfamiliar with the site can understand where the numbers come from.

**Acceptance Scenarios**:

1. **Given** a parent is on a preschool detail page, **When** they see the survey PDF link, **Then** the link label or surrounding context communicates that the data comes from an official municipal survey.
2. **Given** a parent who has never visited the site before opens a detail page, **When** they read the PDF link area, **Then** they can understand that the survey results are from an official source without clicking the link.

---

### Edge Cases

- A preschool data record that is missing a survey PDF URL must not render a broken or empty link; the link area must be omitted gracefully.
- The survey PDF URLs point to an external domain (`forskoleenkatresultat.malmo.se`); links must carry `rel="noopener noreferrer"` and `target="_blank"`.
- Some preschool names in the PDF URLs do not match the canonical preschool name used in the data (e.g., "Duvans montessoriförskola" maps to a PDF filename containing "montessoriförskolan duvan"; "Filifjonkan personalkooperativ" maps to "personalkooperativet filifjonkan"). The PDF URL must be stored per-preschool rather than computed from the name, to avoid broken links.
- The PDF link must not push the preschool name, survey scores, or primary question sections off-screen on the smallest supported mobile viewport.
- The PDF link label in Arabic must not overflow or clip on narrow mobile viewports.
- If the external PDF host becomes unavailable or a URL goes stale, the link will lead to a 404 on the external domain. The app cannot prevent this without runtime checks, which are out of scope.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Detail pages for preschools MUST display a link to the original survey results PDF when a survey PDF URL is available for that preschool.
- **FR-002**: The survey PDF link MUST open in a new browser tab and include `rel="noopener noreferrer"`.
- **FR-003**: The survey PDF link label MUST use the correct localized text for the page's active locale across Swedish, English, and Arabic.
- **FR-004**: Detail pages for preschools that are missing a survey PDF URL MUST NOT display a broken or empty link; the link area must be omitted gracefully.
- **FR-005**: The survey PDF link MUST be placed after all existing action buttons in the detail page action area (after the compare button and, when present, the queue link) so it is visible without scrolling past the survey question sections on a standard mobile viewport. This positions it as a secondary reference action, preserving the visual hierarchy of compare (primary) and queue registration (conversion) above it.
- **FR-006**: The survey PDF link MUST be rendered as a styled anchor element (icon + localized label text) that is clearly identifiable as a clickable action. It should be visually lighter than the primary compare button so it does not compete with the core comparison action in the page hierarchy.
- **FR-007**: The survey PDF URL used in the link MUST come from each preschool's per-survey-year data record (the individual survey JSON file, not the city index) and MUST NOT be hardcoded in the page template or computed from the preschool name, because the official PDF filenames do not always match the canonical preschool names used in the app.
- **FR-008**: All new user-facing text strings (link label, any attribution text) MUST be defined in all three locale files with identical key structures, so the i18n key-parity test continues to pass.
- **FR-009**: The survey PDF link MUST render correctly in the Arabic RTL layout without introducing horizontal overflow or misalignment on narrow mobile viewports.
- **FR-010**: The survey PDF link MUST be available for all preschools that have survey data, regardless of operator type (both municipal and independent).
- **FR-011**: The survey PDF link MUST appear on detail pages only. It MUST NOT appear on comparison page cards. Parents who want the original PDF from the comparison view can follow the existing detail page link on each comparison card.

### Key Entities

- **Survey PDF URL**: An external URL pointing to the official survey results PDF for a specific preschool, hosted on `forskoleenkatresultat.malmo.se`. One URL per preschool per survey year. Stored in the per-preschool survey data record (not the city index) because it is year-specific data. The URL is not derivable from the preschool name due to naming inconsistencies in the official PDFs.
- **Preschool data record**: The per-preschool data entry that includes the preschool's name, address, operator type, and (with this feature) survey PDF URL. Applies to both municipal and independent preschools.
- **Survey results PDF**: A PDF document published by Malmö stad containing the full survey results for one preschool. The authoritative data source from which the app's survey data was originally extracted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every preschool detail page that has a survey PDF URL in its data displays a working link to the correct PDF — verified by automated tests asserting the link is present, points to the expected domain, and opens in a new tab.
- **SC-002**: No preschool detail page displays a broken, empty, or missing-destination survey PDF link — verified by automated tests asserting graceful omission when the URL is absent.
- **SC-003**: The survey PDF link label text matches the active locale on all three locale paths (Swedish, English, Arabic) — verified by automated tests or manual inspection across all three locales.
- **SC-004**: The survey PDF link does not cause layout overflow on the smallest supported mobile viewport (320 px) — verified by visual inspection or screenshot comparison in e2e tests.

## Clarifications

### Session 2026-03-31

- Q: Where should the survey PDF link be positioned relative to the existing compare button and queue link in the detail page action area? → A: After all existing action buttons (last item in the action row), as it is a secondary reference action.
- Q: Should the survey PDF URL be stored in the city index file or the per-preschool survey JSON file? → A: In the per-preschool survey JSON file, because the PDF URL is year-specific data that belongs with the survey responses.
- Q: Should the survey PDF link also appear on comparison page cards, or only on detail pages? → A: Detail pages only. The comparison page is optimized for side-by-side data comparison; adding PDF links to each card would add clutter. Parents can reach the PDF via the detail page link on each comparison card.

## Assumptions

- The official PDF URLs on `forskoleenkatresultat.malmo.se` will remain stable and accessible for the foreseeable future. The app has no control over this external domain.
- Every preschool that has survey data in the app can be matched to an official PDF URL from the Malmö stad results page. If a match cannot be found for a given preschool, its data record will simply omit the PDF URL field, and the link will not be shown.
- The survey PDF URL is a build-time data concern only. No runtime fetching or URL validation is performed.
