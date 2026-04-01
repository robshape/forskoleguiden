# Data Model: Survey PDF Link on Detail Pages

**Branch**: `013-survey-pdf-link` | **Date**: 2026-03-31

## Entity Changes

### PreschoolSurvey (modified)

**File**: `src/lib/types.ts`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | yes | Kebab-case identifier (existing) |
| `preschoolName` | `string` | yes | Display name (existing) |
| `address` | `string` | yes | Physical address (existing) |
| `surveyYear` | `number` | yes | Survey year (existing) |
| `totalRespondentsPercent` | `number` | yes | Response rate, -1 for placeholder (existing) |
| `questionGroups` | `QuestionGroup[]` | yes | Survey question data (existing) |
| **`surveyPdfUrl`** | **`string`** | **no** | **NEW — URL to the official survey results PDF on `forskoleenkatresultat.malmo.se`** |

**Type definition change**:

```typescript
export type PreschoolSurvey = {
  id: string
  preschoolName: string
  address: string
  surveyYear: number
  totalRespondentsPercent: number
  questionGroups: QuestionGroup[]
  surveyPdfUrl?: string  // NEW
}
```

### Validation Rules

| Rule | Enforcement | Details |
|------|-------------|---------|
| `surveyPdfUrl` must be a valid HTTP(S) URL when present | Build-time template guard | Rendered only when `survey.surveyPdfUrl && /^https?:\/\//.test(survey.surveyPdfUrl)` — same pattern as queue link validation |
| `surveyPdfUrl` may be omitted | TypeScript optional field | `surveyPdfUrl?: string` — link area is omitted when field is absent or empty |
| `surveyPdfUrl` must point to `.pdf` files on trusted domain | Data contract test | Contract test validates URL format and domain when field is present |

### Contract Test Assertions

**File**: `tests/unit/malmo-survey-files-contract.test.ts`

Add the following assertions inside the existing preschool iteration loop (after the Helhetsbedömning validation block). Follow the pattern used by `tests/unit/malmo-directory-index-contract.test.ts` for `queueUrl` validation:

```typescript
// Validate surveyPdfUrl when present
if (survey.surveyPdfUrl !== undefined) {
  expect(
    typeof survey.surveyPdfUrl,
    `${surveyFilePath}: surveyPdfUrl must be a string`,
  ).toBe('string')
  expect(
    survey.surveyPdfUrl.length,
    `${surveyFilePath}: surveyPdfUrl must be non-empty`,
  ).toBeGreaterThan(0)
  expect(
    survey.surveyPdfUrl,
    `${surveyFilePath}: surveyPdfUrl must be an absolute https:// URL`,
  ).toMatch(/^https:\/\//)
  expect(
    survey.surveyPdfUrl,
    `${surveyFilePath}: surveyPdfUrl must point to forskoleenkatresultat.malmo.se`,
  ).toMatch(/^https:\/\/forskoleenkatresultat\.malmo\.se\//)
  expect(
    survey.surveyPdfUrl,
    `${surveyFilePath}: surveyPdfUrl must end with .pdf`,
  ).toMatch(/\.pdf$/)
}
```

These assertions enforce:
- Type is string (not number, boolean, etc.)
- Non-empty (catches accidental `""` values)
- HTTPS only (the official domain uses HTTPS)
- Trusted domain (`forskoleenkatresultat.malmo.se`)
- PDF extension (catches accidental HTML page links)

### Survey JSON File Format (after change)

**File pattern**: `data/malmo/2025/*.json`

```json
{
  "id": "example-forskola",
  "preschoolName": "Example förskola",
  "address": "Exempelvägen 1, Malmö",
  "surveyYear": 2025,
  "totalRespondentsPercent": 75,
  "surveyPdfUrl": "https://forskoleenkatresultat.malmo.se/2025/example förskola.pdf",
  "questionGroups": [
    {
      "name": "Helhetsbedömning",
      "questions": [...]
    }
  ]
}
```

When no PDF is available:

```json
{
  "id": "example-forskola",
  "preschoolName": "Example förskola",
  "address": "Exempelvägen 1, Malmö",
  "surveyYear": 2025,
  "totalRespondentsPercent": -1,
  "questionGroups": [...]
}
```

Note: The `surveyPdfUrl` field is simply omitted (not set to `null` or empty string).

## i18n Keys (new)

**Files**: `src/i18n/sv.json`, `en.json`, `ar.json`

| Key | sv | en | ar |
|-----|----|----|-----|
| `detail.surveyPdfLink` | `Visa enkätresultat (PDF)` | `View survey results (PDF)` | `عرض نتائج الاستبيان (PDF)` |

Added under the existing `detail` namespace alongside `detail.queueLink` and `detail.metaDescription`.

## Relationships

```text
PreschoolIndexEntry (index.json)
  └── 1:1 → PreschoolSurvey (2025/*.json)
                └── surveyPdfUrl? → external PDF on forskoleenkatresultat.malmo.se
```

- `PreschoolIndexEntry` is NOT modified. The `surveyPdfUrl` lives on `PreschoolSurvey` because it is year-specific data.
- The `DetailPage.astro` component receives both `preschool: PreschoolIndexEntry` and `survey: PreschoolSurvey` as props, so it has access to the new field without any data-loading changes.

## State Transitions

N/A — the PDF URL is static build-time data with no state changes. The link either renders (URL present and valid) or is omitted (URL absent or invalid).
