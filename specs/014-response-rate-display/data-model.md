# Data Model: Response Rate Display

**Feature**: 014-response-rate-display
**Date**: 2026-04-01

## Existing Entities (No Changes Required)

### PreschoolSurvey

The `totalRespondentsPercent` field already exists in the `PreschoolSurvey` type and all preschool JSON data files. No data model changes are required for this feature.

```
PreschoolSurvey
├── id: string
├── preschoolName: string
├── address: string
├── surveyYear: number
├── totalRespondentsPercent: number    ← Already exists, newly consumed by UI
├── surveyPdfUrl?: string
└── questionGroups: QuestionGroup[]
```

**Field details**:
- `totalRespondentsPercent`: Integer 0–100. Represents the percentage of parents who responded to the survey.
- Special value `-1`: Indicates a placeholder survey with no data. These are filtered out by `isPlaceholderSurvey()` and never reach the UI.

### Validation

Existing contract tests (`malmo-survey-files-contract.test.ts`) already validate:
- Field exists on every survey JSON file
- Field is a number
- No additional validation rules needed for this feature

## i18n Keys (New)

Three new translation keys added to all locale files:

| Key | sv | en | ar |
|-----|----|----|-----|
| `detail.responseRate` | Svarsfrekvens | Response rate | معدل الاستجابة |

## Data Flow

```
Build time:
  data/malmo/2025/*.json (totalRespondentsPercent already present)
    → src/lib/data.ts (getPreschoolSurveyByYear / getAllPreschoolSurveys)
    → Detail page: survey.totalRespondentsPercent rendered in Astro template
    → Comparison page: survey objects passed as props to ComparisonView → ComparisonCard

No new data loading, transformation, or storage required.
```
