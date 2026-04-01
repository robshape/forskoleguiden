# Feature Specification: Response Rate Display

**Feature Branch**: `014-response-rate-display`
**Created**: 2026-04-01
**Status**: Draft
**Input**: User description: "Add totalRespondentsPercent from the JSON data to the UI. It is an important metric to understand how happy parents are with a preschool. A high totalRespondentsPercent is better than a low. Add totalRespondentsPercent to both the preschool details page and the comparison page."

## User Scenarios & Testing

### User Story 1 — View Response Rate on Preschool Detail Page (Priority: P1)

As a parent viewing a preschool's detail page, I want to see the survey response rate so I can judge how representative the survey results are. A high response rate means many parents participated, making the results more trustworthy. A low response rate may indicate the survey results are less reliable.

**Why this priority**: The response rate is a critical trust signal. Without it, parents may place equal weight on survey results from a preschool where 90% of parents responded and one where only 20% did. Showing this metric helps parents make better-informed decisions.

**Independent Test**: Visit any preschool detail page and confirm the response rate is visible in the hero metadata row (alongside address and operator type). The value should match the `totalRespondentsPercent` from the preschool's JSON file.

**Acceptance Scenarios**:

1. **Given** a preschool has a `totalRespondentsPercent` of 85, **When** I visit that preschool's detail page, **Then** I see "85%" displayed as the response rate with a descriptive label explaining what it represents.
2. **Given** a preschool has a low `totalRespondentsPercent` (e.g. 25), **When** I visit that preschool's detail page, **Then** the response rate is still displayed clearly — no value is hidden or omitted based on its magnitude.
3. **Given** I am using a screen reader, **When** I navigate the preschool detail page, **Then** the response rate and its label are announced accessibly.

---

### User Story 2 — See Response Rate in Side-by-Side Comparison (Priority: P1)

As a parent comparing multiple preschools, I want to see each preschool's response rate in the comparison view so I can factor survey representativeness into my decision. When two preschools have similar agree-share scores but very different response rates, the one with the higher response rate may be a more reliable indicator.

**Why this priority**: Comparison is the core use case of the site. Adding response rate context to the comparison view directly supports the user's decision-making workflow without requiring them to visit each detail page individually.

**Independent Test**: Select 2–3 preschools for comparison, open the comparison page, and confirm each preschool's response rate is visible per card. Values should match their respective JSON data files.

**Acceptance Scenarios**:

1. **Given** I have selected 3 preschools for comparison, **When** I view the comparison page, **Then** each preschool's response rate is displayed in the name/info area of its comparison card alongside existing agree-share data.
2. **Given** two compared preschools have response rates of 90% and 30%, **When** I view the comparison, **Then** both values are clearly visible so I can weigh the reliability of their survey scores.
3. **Given** I am using a screen reader, **When** I navigate comparison cards, **Then** the response rate for each preschool is announced accessibly.

---

### User Story 3 — Understand Response Rate Across Languages (Priority: P2)

As a non-Swedish-speaking parent, I want the response rate label and any explanatory text to be properly translated into my chosen language (English or Arabic) so I can understand what the metric means.

**Why this priority**: The site supports three languages. All user-facing text must be translated to meet the existing accessibility and i18n standards.

**Independent Test**: Switch to English and Arabic, visit a detail page and the comparison page, and confirm the response rate label is translated correctly and renders properly (including RTL layout for Arabic).

**Acceptance Scenarios**:

1. **Given** I am viewing the site in English, **When** I see the response rate, **Then** the label is in English.
2. **Given** I am viewing the site in Arabic, **When** I see the response rate, **Then** the label is in Arabic and the layout respects right-to-left direction.

---

### Edge Cases

- What happens when `totalRespondentsPercent` is missing or `-1` (placeholder survey)? — These preschools are already filtered out of detail pages and comparison by `isPlaceholderSurvey()`, so they will not appear in the UI.
- What happens when `totalRespondentsPercent` is 0? — Display "0%" as-is. The metric should never be hidden or reformatted based on its value.
- What happens when `totalRespondentsPercent` is 100? — Display "100%" as-is.

## Requirements

### Functional Requirements

- **FR-001**: The preschool detail page MUST display the survey response rate (`totalRespondentsPercent`) in the hero metadata row alongside address and operator type, with a clear label explaining what it represents.
- **FR-002**: The comparison page MUST display each compared preschool's response rate once per preschool in the name/info area (alongside the preschool name), visible in every question section.
- **FR-003**: The response rate MUST be displayed as a percentage (e.g. "85%").
- **FR-004**: The response rate label and any descriptive text MUST be translated into all supported languages (Swedish, English, Arabic).
- **FR-005**: The response rate display MUST be accessible to screen readers with appropriate semantic markup.
- **FR-006**: The response rate MUST be visible regardless of its value — no values are hidden, omitted, or visually de-emphasized based on magnitude.
- **FR-007**: The response rate display MUST work correctly in both left-to-right (Swedish, English) and right-to-left (Arabic) layouts.

### Key Entities

- **Response Rate (`totalRespondentsPercent`)**: A number (0–100) representing the percentage of parents who responded to the survey at a given preschool. Already exists in the data model (`PreschoolSurvey.totalRespondentsPercent`). Higher values indicate broader parent participation and more representative results.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Parents visiting a preschool detail page can see the response rate within the first screen of content (no scrolling required on the target mobile viewport).
- **SC-002**: Parents comparing preschools can see each school's response rate without leaving the comparison view.
- **SC-003**: The response rate is correctly displayed for 100% of non-placeholder preschools in all three supported languages.
- **SC-004**: The feature passes existing accessibility checks (axe-core e2e tests, keyboard navigation, screen reader support).

## Clarifications

### Session 2026-04-01

- Q: Where on the detail page should the response rate appear? → A: In the hero metadata row, alongside address and operator type.
- Q: Where on the comparison page should the response rate appear? → A: Once per preschool in the name/info area (alongside the preschool name), visible in every question section.
- Q: Should the response rate also appear on directory listing cards? → A: No, only on the detail page and comparison page. Directory cards stay focused on the primary agree-share metric.

## Assumptions

- The existing `totalRespondentsPercent` field in the data model is reliable and does not require recalculation or validation beyond the existing placeholder check (`-1`).
- The response rate is presented as a simple informational metric — no tier coloring, scoring logic, or ranking behavior is associated with it (unlike agree-share scores which have high/medium/low tiers).
- The response rate is NOT shown on directory listing cards (PreschoolCard) — only on the detail page and comparison page — to keep the directory view focused and scannable on mobile.
- The label used is descriptive (e.g. "Response rate" / "Svarsfrekvens") rather than the raw field name, to help parents understand what the number means.
