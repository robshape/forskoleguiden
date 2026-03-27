# Feature Specification: Mobile Target Update — iPhone 17

**Feature Branch**: `012-mobile-target-update`
**Created**: 2025-07-18
**Status**: Draft
**Input**: User description: "Change the mobile target from iPhone 13 mini to iPhone 17 base, with responsive support for iPhone 17 Pro, iPhone 17 Pro Max, smaller screens down to iPhone 13 mini, and equivalent Android devices. Scope includes updating current documentation in the codebase as well as update the actual code and CSS/styling to support these screen sizes for responsiveness and adaptability."

## Clarifications

### Session 2026-03-27

- Q: Should this feature include actively auditing and fixing visual/styling issues at the new viewport, or is it config/docs only? → A: Audit & fix — visually verify all page types at 393×852 and fix any layout/spacing issues found.
- Q: Should visual regression baselines be maintained at both old (375×812) and new (393×852) viewports, or new only? → A: New only — regenerate baselines at 393×852 and remove old 375×812 baselines.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Parent browses preschools on iPhone 17 (Priority: P1)

A parent opens Förskoleguiden on a standard iPhone 17 (393×852 CSS viewport). The directory page, detail page, and comparison page all render correctly at this viewport width — no horizontal overflow, no clipped content, and all touch targets remain reachable. This is the new baseline experience that the majority of new device owners will encounter.

**Why this priority**: iPhone 17 is the new primary target device. If the site does not render correctly at 393 px wide, the core user journey is broken for the largest share of future visitors.

**Independent Test**: Load every page type (directory, detail, comparison) at 393×852 viewport and verify no horizontal scrollbar, all text readable, all interactive elements tappable.

**Acceptance Scenarios**:

1. **Given** a 393×852 viewport, **When** the parent loads the directory page, **Then** all preschool cards render fully within the viewport width, no horizontal scrollbar appears, and the sort toggle and compare buttons are tappable.
2. **Given** a 393×852 viewport, **When** the parent navigates to a preschool detail page, **Then** all bar charts, question cards, and queue link render without clipping or overflow.
3. **Given** a 393×852 viewport, **When** the parent opens the comparison page with 3 selected preschools, **Then** comparison cards stack vertically without horizontal scrolling and the share button is reachable.

---

### User Story 2 — Parent uses a larger iPhone 17 Pro Max (Priority: P1)

A parent with an iPhone 17 Pro Max (430×932 CSS viewport) expects the additional horizontal space to be used gracefully — no awkwardly narrow centered content column with excessive side margins, and spacing that feels proportional rather than cramped or overly stretched.

**Why this priority**: The Pro Max is a popular premium device. The site must feel intentional on this viewport, not like a stretched-up phone layout. The existing responsive system already handles up to 430 px via the phone range defined in the design context, but test coverage and documentation must explicitly verify this.

**Independent Test**: Load all page types at 430×932 viewport and confirm layout integrity, proportional spacing, and no visual oddities.

**Acceptance Scenarios**:

1. **Given** a 430×932 viewport, **When** the parent loads the directory page, **Then** preschool cards use the full available width without excessive left/right whitespace and all interactive elements meet minimum 44×44 px touch targets.
2. **Given** a 430×932 viewport, **When** the parent opens a comparison with 5 preschools, **Then** all cards are accessible via vertical scrolling and no content is cut off horizontally.

---

### User Story 3 — Parent on an older or smaller phone still has full functionality (Priority: P2)

A parent using an iPhone 13 mini (375×812), a Samsung Galaxy S-series (360 px), or an even narrower device (down to 320 px) continues to have a fully functional experience. No regressions are introduced by the target change.

**Why this priority**: Backward compatibility is essential — existing users on older devices must not lose functionality. However, these devices are no longer the primary optimization target, so pixel-perfect tuning for 375 px is deprioritized in favor of 393 px.

**Independent Test**: Run the existing e2e test suite at 375×812, 360×780, and 320×568 viewports and confirm all tests pass without modification to assertions (only viewport size updates where the primary target changed).

**Acceptance Scenarios**:

1. **Given** a 375×812 viewport (iPhone 13 mini), **When** the parent uses the full site flow (browse → detail → compare → share), **Then** all features work identically to the current production behavior.
2. **Given** a 320×568 viewport, **When** the parent loads the directory page, **Then** all preschool cards render without horizontal overflow and the language switcher shows ISO codes instead of full locale names.
3. **Given** a 360×780 viewport (Samsung Galaxy S-class), **When** the parent navigates through the site, **Then** all pages render correctly with no clipped text or overlapping elements.

---

### User Story 4 — Documentation reflects the updated mobile target (Priority: P2)

Any developer or contributor reading project documentation (PRD, tech stack docs, copilot instructions, implementation plans, design context) sees iPhone 17 as the primary mobile target with the supported responsive range clearly stated. No stale references to "iPhone 13 mini" as the primary target remain.

**Why this priority**: Stale documentation causes developer confusion and inconsistent implementation decisions. This is a hygiene requirement but not user-facing, hence P2.

**Independent Test**: Search the entire codebase for "iPhone 13 mini" references. All references in documentation and config files either point to iPhone 17 as the primary target or explicitly mention iPhone 13 mini only as the lower end of the supported range.

**Acceptance Scenarios**:

1. **Given** a developer opens `docs/prd.md`, **When** they search for viewport target information, **Then** they find iPhone 17 (393×852) listed as the primary target and iPhone 13 mini listed as the lower bound of the supported range.
2. **Given** a developer opens `.github/copilot-instructions.md`, **When** they read the mobile constraints section, **Then** they find the primary target updated to iPhone 17 with the responsive range 320–430 px clearly stated.

---

### User Story 5 — Automated tests verify the new primary viewport (Priority: P1)

The Playwright e2e test suite and WebKit regression suite use iPhone 17 (393×852) as the default mobile viewport instead of iPhone 13 mini (375×812). Tests that verify specific viewport-dependent behavior (e.g., language switcher showing ISO codes on narrow viewports) remain correct with updated thresholds as needed.

**Why this priority**: If tests still target 375 px as the primary viewport, regressions at the actual primary viewport (393 px) will go undetected. This directly supports the reliability of User Stories 1 and 2.

**Independent Test**: Run `pnpm test:e2e` and `pnpm test:e2e:webkit` — all tests pass with updated viewport configurations.

**Acceptance Scenarios**:

1. **Given** the Playwright default config, **When** the e2e test suite runs, **Then** mobile viewport tests use 393×852 as the primary mobile size.
2. **Given** the WebKit regression config (`playwright.webkit.config.ts`), **When** `pnpm test:e2e:webkit` runs, **Then** the device profile uses iPhone 17 dimensions (393×852).
3. **Given** a test that checks language switcher behavior at narrow viewports, **When** the test sets viewport to 375 px or narrower, **Then** the test still correctly asserts that ISO codes are shown (the 375 px breakpoint behavior is a narrow-viewport edge case, not the primary target).

---

### Edge Cases

- What happens at exactly 393 px wide? All content must fit without horizontal scroll — this is the primary design target, not an edge case.
- What happens between 375 px and 393 px (e.g., 384 px, Samsung Galaxy S26+)? Content must render correctly at any width in this range; no "dead zone" where layout breaks.
- What happens below 320 px? This is below the minimum supported width. Graceful degradation is acceptable (horizontal scroll may appear) but the site should not crash or become unusable.
- What happens at 430 px (iPhone 17 Pro Max)? The layout must not feel empty or stretched. Content should expand naturally to use available width.
- Do SVG mockup viewBoxes in `docs/mockups/` need updating? Yes — they currently use 375×812 canvas size and should be updated to 393×852 to reflect the new primary target dimensions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The primary mobile design target MUST be updated from iPhone 13 mini (375×812 CSS pixels) to iPhone 17 (393×852 CSS pixels) across all documentation, test configurations, and design artifacts.
- **FR-002**: All pages (directory, detail, comparison) MUST render without horizontal overflow at viewports from 320 px to 430 px wide.
- **FR-003**: The Playwright default mobile viewport in test configurations MUST be updated to 393×852 (iPhone 17).
- **FR-004**: The WebKit regression test configuration (`playwright.webkit.config.ts`) MUST use iPhone 17 as its device profile (393×852, WebKit engine).
- **FR-005**: E2e tests that hardcode 375×812 as the "primary mobile" viewport MUST be updated to 393×852. Tests that use 375 px to test narrow-viewport edge cases (e.g., language switcher ISO code threshold) MUST retain 375 px with updated comments explaining it is a narrow-viewport test, not the primary target.
- **FR-006**: All documentation files (`docs/prd.md`, `docs/implementation-plan-phase-1.md`, `docs/tech-stack.md`, `.github/copilot-instructions.md`) MUST replace references to iPhone 13 mini as the primary target with iPhone 17, while noting iPhone 13 mini as the lower bound of the supported range.
- **FR-007**: The design context file (`.impeccable.md`) MUST update the phone portrait range description to reference iPhone 17 as the primary target if it currently references iPhone 13 mini.
- **FR-008**: SVG mockup files in `docs/mockups/` MUST update their `viewBox` and dimension attributes from 375×812 to 393×852 to reflect the new primary target.
- **FR-009**: CSS and component styling MUST continue to work correctly across the full responsive range (320–430 px) without introducing new breakpoints or framework changes. Existing Tailwind v4 breakpoints (`sm:`, `md:`, `lg:`) remain unchanged. A visual audit of all page types (directory, detail, comparison) MUST be performed at 393×852, and any layout or spacing issues discovered MUST be fixed as part of this feature.
- **FR-010**: The language switcher MUST continue to show ISO codes on viewports ≤375 px and full locale names on wider viewports. The threshold does not change — it is defined by the narrow-viewport behavior, not the primary target.
- **FR-011**: Visual regression test screenshot baselines MUST be regenerated at the new primary viewport size (393×852) and the old 375×812 baselines MUST be removed. Dual-viewport baselines are not maintained — functional e2e tests cover 375 px behavior separately.
- **FR-012**: All spec files in `specs/001-006/` that reference iPhone 13 mini as the primary target MUST be updated to reference iPhone 17 as the primary target.
- **FR-013**: The copilot instructions entry for `pnpm test:e2e:webkit` MUST be updated to reference iPhone 17 instead of iPhone 13 mini.

### Key Entities

- **Device Viewport Reference Table**: The canonical set of target devices and their CSS viewport dimensions:

  | Device | CSS Width | CSS Height | Role |
  |--------|-----------|------------|------|
  | iPhone 17 | 393 | 852 | Primary target |
  | iPhone 17 Pro | 393 | 852 | Same as primary |
  | iPhone 17 Pro Max | 430 | 932 | Upper mobile bound |
  | Google Pixel 10 | 412 | 915 | Mid-range Android reference |
  | Samsung Galaxy S26 Ultra | 412 | 915 | Mid-range Android reference |
  | Samsung Galaxy S26+ | 384 | 824 | Mid-range Android reference |
  | Samsung Galaxy S26 | 360 | 780 | Lower Android bound |
  | iPhone 13 mini | 375 | 812 | Lower Apple bound (former primary) |
  | Minimum supported | 320 | — | Absolute minimum width |

- **Responsive Range**: The supported viewport width range is 320–430 px. The primary optimization target is 393 px. The site must render correctly at any width within this range.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All pages render without horizontal scrollbar at 393×852, 430×932, 375×812, 360×780, and 320×568 viewports (verifiable via Playwright `scrollWidth <= clientWidth` assertion).
- **SC-002**: `pnpm test:e2e` passes with 100% of tests using 393×852 as the default mobile viewport where previously 375×812 was used.
- **SC-003**: `pnpm test:e2e:webkit` passes with updated iPhone 17 device profile.
- **SC-004**: Zero references to "iPhone 13 mini" as the "primary target" or "primary viewport" remain in documentation files. iPhone 13 mini may only appear in context of "supported range" or "lower bound."
- **SC-005**: Visual regression baselines are regenerated and tests pass at the new viewport dimensions.
- **SC-006**: `pnpm validate` passes with no regressions.
- **SC-007**: Lighthouse accessibility score remains ≥ 0.95 and performance score remains ≥ 0.9 after all changes.
- **SC-008**: All touch targets remain ≥ 44×44 CSS pixels on the 393×852 viewport (verifiable via existing e2e touch-target tests).
