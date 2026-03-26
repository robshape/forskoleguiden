# Feature Specification: Phase 2 Final Verification

**Feature Branch**: `010-final-verification`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "Final verification: full build and static output check across all locales, comprehensive end-to-end user flow test for Phase 2 features, and full validation pipeline pass"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Full Build and Static Output Verification (Priority: P1)

A contributor completes all Phase 2 work (multi-locale routes, language switcher, RTL layout, queue links, share UI) and needs to confirm the built site contains the correct pages for every locale with expected content.

**Why this priority**: The build output is the most fundamental artifact — if the site doesn't build correctly with all three locales, no other verification matters. This is the gatekeeper for deployment.

**Independent Test**: Can be fully tested by running the build and inspecting the output directory. Delivers confirmation that all Phase 2 content is present and correctly structured.

**Acceptance Scenarios**:

1. **Given** all Phase 2 features are implemented, **When** the site is built, **Then** the output contains locale directories for Swedish, English, and Arabic, each with a directory page, comparison page, about page, and one detail page per preschool.
2. **Given** all Phase 2 features are implemented, **When** the site is built, **Then** the total HTML file count is approximately three times the Phase 1 count (three locales × the Phase 1 page count per locale).
3. **Given** the site is built, **When** inspecting the English directory page, **Then** it contains the English `lang` attribute and does not contain RTL directionality.
4. **Given** the site is built, **When** inspecting the Arabic directory page, **Then** it contains the Arabic `lang` attribute and RTL directionality, and the page contains Arabic script text (not untranslated keys).
5. **Given** the site is built, **When** measuring the total output size (excluding images), **Then** the size remains within a reasonable budget (approximately three times the Phase 1 output size).

---

### User Story 2 - End-to-End Phase 2 User Flow (Priority: P1)

A parent visits the Swedish directory, switches to English, browses and selects preschools, views an independent preschool's queue link, compares their selections, shares the comparison via a link, and a co-parent opens the shared link to see the same preschools — then switches to Arabic to verify RTL layout.

**Why this priority**: This is the core Phase 2 value proposition tested as a single integrated journey. It validates that all Phase 2 features (language switching, queue links, share/restore, RTL) work together seamlessly. Catching integration issues between features is critical before shipping.

**Independent Test**: Can be tested by running a browser-based end-to-end test that simulates the full user journey. Delivers confidence that the cross-feature interaction works correctly.

**Acceptance Scenarios**:

1. **Given** the Swedish directory page is loaded, **When** the user views the language switcher, **Then** "Svenska" appears as the active/current language with links to English and Arabic equivalents.
2. **Given** the Swedish directory is loaded, **When** the user clicks the English language switcher link, **Then** the browser navigates to the English directory page and the page renders with English text.
3. **Given** the English directory page is loaded, **When** the user adds three preschools to the compare set, **Then** the compare tray reflects three selected preschools with English text.
4. **Given** preschools are selected on the English directory, **When** the user clicks a preschool card to view its detail page, **Then** the detail page renders in English with the preschool's data.
5. **Given** the user is viewing an independent preschool's detail page, **When** inspecting the page content, **Then** a queue registration link is visible and points to an external URL.
6. **Given** the user returns to the English directory from a detail page, **When** viewing the compare tray, **Then** the compare state persists (three preschools still selected).
7. **Given** three preschools are selected, **When** the user navigates to the English comparison page, **Then** the comparison view shows all three preschools with English text.
8. **Given** the comparison page is loaded with selected preschools, **When** the user clicks the Share button, **Then** a confirmation message appears indicating the link was copied.
9. **Given** a share URL has been generated, **When** a different user (or new browser context) opens that share URL, **Then** the comparison page restores the same three preschools.
10. **Given** the comparison page is loaded, **When** the user clicks the Arabic language switcher link, **Then** the page switches to the Arabic comparison page with RTL layout directionality.
11. **Given** the Arabic comparison page is loaded, **When** inspecting the page layout, **Then** Arabic text renders correctly with right-to-left flow and the layout mirrors the LTR version.
12. **Given** the user navigates to the Arabic directory from the comparison page, **When** viewing the page, **Then** the compare state persists and the Arabic directory renders with RTL layout.

---

### User Story 3 - Full Quality Gate Pass (Priority: P1)

A contributor runs the complete validation pipeline to confirm that all Phase 2 changes pass linting, type checking, unit tests, the build, post-build verification, end-to-end tests, and accessibility audits with zero errors.

**Why this priority**: The validation pipeline is the project's release gate — it must pass before any deployment. All Phase 2 work is meaningless if it introduces regressions or fails quality standards.

**Independent Test**: Can be tested by running the full validation command. Delivers a single pass/fail signal for the entire Phase 2 release.

**Acceptance Scenarios**:

1. **Given** all Phase 2 features are implemented, **When** the linter runs, **Then** zero lint errors are reported.
2. **Given** all Phase 2 features are implemented, **When** the formatter check runs, **Then** zero formatting issues are reported.
3. **Given** all Phase 2 features are implemented, **When** type checking runs, **Then** zero type errors are reported.
4. **Given** all Phase 2 features are implemented, **When** unit tests run, **Then** all tests pass, including new Phase 2 tests for share encoding, locale utilities, and queue link data contracts.
5. **Given** the site builds successfully, **When** post-build tests run, **Then** all assertions pass for all three locales (page counts, weight budgets, content contracts).
6. **Given** the site is served for testing, **When** end-to-end tests run (including the new Phase 2 user flow test), **Then** all tests pass without regression to existing Phase 1 tests.
7. **Given** the site is served for testing, **When** the accessibility audit runs against all three locale index pages, **Then** the accessibility score meets or exceeds 0.95 for every locale.
8. **Given** the site is served for testing, **When** the performance audit runs against all three locale index pages, **Then** the performance score meets or exceeds 0.9 for every locale.
9. **Given** all individual quality checks pass, **When** the full validation pipeline runs end-to-end, **Then** it exits with a success code (zero).

---

### Edge Cases

- What happens when Build output contains zero-byte HTML files for a locale? The verification should detect and report this as a failure.
- What happens when a Phase 2 feature (e.g., share restoration) only works in one locale but fails in another? The e2e test must exercise the feature across multiple locales to catch locale-specific regressions.
- What happens when a new preschool is added to the data but the detail page is not generated for all three locales? The post-build check should assert equal page counts per locale.
- What happens when the share URL restoration test runs but the encoded payload references preschool IDs that only exist during testing? The test must use IDs from the real data set to ensure the round-trip works against actual content.
- What happens when Lighthouse scores degrade slightly due to increased page count from three locales? The performance budget allows for this (warn at 0.9, not error), but accessibility must stay above 0.95.
- What happens when the Phase 2 e2e user flow test passes but existing Phase 1 e2e tests regress? The full validation pipeline runs all tests together, catching any regression.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The build output MUST contain locale directories for all supported locales (Swedish, English, Arabic), each with a complete set of pages (directory, comparison, about, and one detail page per preschool).
- **FR-002**: The build output MUST contain approximately three times the Phase 1 HTML file count, accounting for three locales.
- **FR-003**: English pages MUST contain the correct `lang` attribute and MUST NOT include RTL directionality.
- **FR-004**: Arabic pages MUST contain the correct `lang` attribute, RTL directionality, and Arabic script content (not raw translation keys).
- **FR-005**: A comprehensive end-to-end test MUST simulate the full Phase 2 user journey: language switching, preschool selection, queue link visibility for independent preschools, comparison view, share link generation, share link restoration in a new context, and locale switching to Arabic with RTL verification.
- **FR-006**: The end-to-end test MUST verify that compare state persists across page navigations within the same locale and across locale switches.
- **FR-007**: The end-to-end test MUST verify that the share URL round-trip works: encoding the compare set, generating a URL, and opening that URL in a new context restores the same preschools.
- **FR-008**: The full validation pipeline MUST pass with zero errors across all quality checks: linting, formatting, type checking, unit tests, build, post-build verification, end-to-end tests, and accessibility/performance audits.
- **FR-009**: The accessibility audit MUST score at least 0.95 for every locale's index page.
- **FR-010**: Existing Phase 1 tests MUST continue to pass without regression after all Phase 2 changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The build output contains HTML files for all three locales, and the total HTML file count is within 10% of the expected count (three times the number of preschools plus the four shared pages, times three locales, plus the root redirect).
- **SC-002**: The comprehensive Phase 2 end-to-end user flow test passes from start to finish, covering all 12 acceptance scenarios in User Story 2 within a single test execution.
- **SC-003**: The full validation pipeline completes with exit code zero, confirming all quality gates pass.
- **SC-004**: The accessibility audit scores at least 0.95 for each of the three locale index pages.
- **SC-005**: Zero Phase 1 test regressions — all previously passing tests continue to pass.
- **SC-006**: The build output size (excluding images) remains under 21 MB across all three locales combined.

## Assumptions

- All Phase 2 features (Steps 0–9 from `docs/implementation-plan-phase-2.md`) are fully implemented before this verification step begins.
- The existing post-build verification tests already cover multi-locale page counts and content contracts from earlier Phase 2 steps. This verification step confirms they all pass together.
- The existing Lighthouse CI configuration already scans all three locale index pages. No configuration changes are needed for this step.
- Real preschool data from the Malmö data set is used in the e2e test (not synthetic/mock data), ensuring the test validates against actual content.
- The test environment supports clipboard access for share URL verification, with a fallback assertion (button exists and is operable) if clipboard is restricted.
