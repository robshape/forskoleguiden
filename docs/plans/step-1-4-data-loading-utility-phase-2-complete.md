# Phase 2 Complete: Implement data-loading utility and refactor naming drift

Phase 2 implemented the Step 1.4 data-loading module with clear contextual errors, year-derived survey path resolution, and deterministic index-order loading for all Malmö surveys. It also refactored remaining `Percentage` naming drift in type-contract tests to canonical `Percent` naming and validated both targeted test files as green.

**Files created/changed**:

- src/lib/data.ts
- tests/unit/data.test.ts
- tests/unit/types.test.ts

**Functions created/changed**:

- `getPreschoolIndex()`
- `getPreschoolSurvey(id: string)`
- `getAllPreschoolSurveys()`
- `readJsonFile<T>(filePath: string, context: string)`
- `getSurveyPath(id: string, year: number)`

**Tests created/changed**:

- `tests/unit/data.test.ts` unknown-id error assertion now verifies both missing id and resolved file path.
- `tests/unit/types.test.ts` response key assertions migrated from `*Percentage` to `*Percent` and aligned with `totalRespondentsPercent` contract.
- Validation run:
  - `pnpm test tests/unit/data.test.ts` (4/4 passing)
  - `pnpm test tests/unit/types.test.ts` (2/2 passing)

**Review Status**: APPROVED

**Git Commit Message**: feat: add Malmö data loading utilities
