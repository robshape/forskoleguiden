# Phase 2 Complete: Implement `computeOverallScore` and sorting behavior with TDD

Phase 2 added overall scoring for the `Helhetsbedömning` group and expanded test coverage for average scoring and null-score handling. Implementation remains scoped to Step 1.5 logic and passed independent review.

**Files created/changed**:

- `src/lib/scoring.ts`
- `tests/unit/scoring.test.ts`

**Functions created/changed**:

- `computeOverallScore(survey: PreschoolSurvey): number | null`
- `computeAgreeShare(response: SurveyResponse): number` (unchanged behavior; reused by `computeOverallScore`)

**Tests created/changed**:

- `computeOverallScore returns average 85 from agree shares 80 and 90`
- `computeOverallScore returns null when Helhetsbedömning is missing`
- `computeOverallScore returns null when Helhetsbedömning group is present but empty`
- `sorts scores descending and keeps null at the bottom`

**Review Status**: APPROVED

**Git Commit Message**: feat: add overall scoring utility logic

- add `computeOverallScore` for `Helhetsbedömning` agree-share averaging
- return `null` when overall-assessment data is missing or empty
- expand unit tests for score computation and null-aware sorting
