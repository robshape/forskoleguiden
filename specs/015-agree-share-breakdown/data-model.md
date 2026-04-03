# Data Model: Agree-Share Breakdown on Comparison Page

**Date**: 2026-04-02
**Feature**: [spec.md](spec.md)

## Entities

This feature introduces no new entities. It reuses existing data structures to render an additional visualization.

### Existing Entities (consumed, not modified)

#### SurveyResponse

The five percentage fields defined in `src/lib/types.ts`. The bar chart uses only the first two (agree categories); the remaining three are still rendered in the sr-only `<table>` for screen readers.

| Field | Type | Bar chart | sr-only table |
|-------|------|-----------|---------------|
| `completelyAgreePercent` | `number` | **Yes** — first segment (solid blue) | Yes |
| `partlyAgreePercent` | `number` | **Yes** — second segment (diagonal stripe) | Yes |
| `neitherAgreeNorDisagreePercent` | `number` | No | Yes |
| `partlyDisagreePercent` | `number` | No | Yes |
| `completelyDisagreePercent` | `number` | No | Yes |

**Constraint**: All five fields sum to 100 (enforced by contract tests).

#### SurveyQuestion

Contains a question `text` string and a `response: SurveyResponse`. Each question within the Helhetsbedömning group is rendered as a section on the comparison page.

#### PreschoolSurvey

Top-level survey object containing `questionGroups`. The comparison page filters for the `OVERALL_ASSESSMENT_GROUP` ("Helhetsbedömning") group.

### Derived Data (computed at render time)

#### Chart Index

A unique integer per bar chart instance on the page, used to generate globally unique SVG `<pattern>` element IDs.

| Context | Formula | Example (3 surveys, 2 questions) |
|---------|---------|----------------------------------|
| Comparison page | `questionIndex * selectedSurveys.length + surveyIndex + 1000` | Q0S0=1000, Q0S1=1001, Q0S2=1002, Q1S0=1003, Q1S1=1004, Q1S2=1005 |
| Detail page (existing) | Sequential integer `0, 1, 2, ...` | 0, 1 |

The `+ 1000` offset avoids any hypothetical collision with detail page indices, though in practice the comparison and detail pages are separate documents. See [research.md § R2](research.md#r2-svg-pattern-id-uniqueness-strategy) for the full rationale and alternatives considered.

## Relationships

```text
ComparisonView (Preact island)
  └── renders per question:
        └── ComparisonCard (per selected survey)
              ├── reads: SurveyQuestion.response (SurveyResponse)
              ├── renders: inline agree-share bar (imports renderPatternContent,
              │           RESPONSE_SERIES, TILE_SIZE from chart-patterns;
              │           shows only completelyAgreePercent + partlyAgreePercent)
              └── renders: sr-only <table> (existing, unchanged — all 5 categories)
```

## New Data Structures

None. No new types, interfaces, or schemas are introduced.

## State Transitions

None. The bar chart is a pure render — no state changes, no user interactions on the chart itself.

## Validation Rules

- `chartIndex` must be unique across all agree-share bar instances rendered on the same page (enforced by unit test).
- `SurveyResponse` field values must be valid percentages (0–100, sum to 100) — already enforced by existing contract tests.
