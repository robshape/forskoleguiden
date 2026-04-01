# Research: Response Rate Display

**Feature**: 014-response-rate-display
**Date**: 2026-04-01

## Research Summary

No unknowns or NEEDS CLARIFICATION items were identified in the Technical Context. The feature uses only existing data (`totalRespondentsPercent` already in the data model), existing patterns (Astro components, i18n `t()` calls, Preact island props), and existing infrastructure (three-locale i18n, RTL support, accessibility testing).

## Decision 1: Display Strategy — Pure Static vs. Island

**Decision**: Use purely static Astro rendering for the detail page response rate. Pass the value as a prop to the existing ComparisonCard Preact island for the comparison page.

**Rationale**: The detail page response rate is a static data point read at build time — no client-side state or interactivity needed. This aligns with Constitution Principle I (zero JS unless interactivity required) and V (Astro by default). For the comparison page, ComparisonCard is already a Preact component receiving the full `PreschoolSurvey` object, which already contains `totalRespondentsPercent` — no new props needed, just rendering the existing field.

**Alternatives considered**:
- Creating a new Preact island for response rate display: Rejected — adds unnecessary JS. The data is static and doesn't require event handlers or state.

## Decision 2: Visual Presentation — Plain Text in Metadata Row

**Decision**: Display response rate as a plain text item in the metadata row (detail page) and name/info area (comparison card), using a small icon + translated label + percentage value. No tier coloring or visual weight differentiation.

**Rationale**: The spec explicitly states no tier coloring or scoring logic. The existing metadata row pattern (icon + text, separated by bullet dots) provides a consistent, proven pattern already used for address and operator type. Using the same pattern for response rate maintains visual consistency.

**Alternatives considered**:
- Colored badge with tier logic (high/medium/low): Rejected — spec explicitly excludes tier coloring for this metric. Would add complexity without clear user value.
- Tooltip on hover: Rejected — tooltips are not accessible on touch devices (mobile-first requirement).

## Decision 3: i18n Key Naming

**Decision**: Add `detail.responseRate` key to all three locale files.

**Rationale**: Follows existing naming convention where detail page labels live under the `detail.*` namespace (e.g., `detail.queueLink`, `detail.surveyPdfLink`). The comparison page will reuse the same key since the label is identical in both contexts.

**Alternatives considered**:
- Separate keys for detail and comparison (`detail.responseRate` + `compare.responseRate`): Rejected — the label means the same thing in both contexts. One key avoids duplication and ensures consistency.
- Using `survey.responseRate`: Viable but less consistent with the existing pattern where `detail.*` contains preschool detail page labels.
