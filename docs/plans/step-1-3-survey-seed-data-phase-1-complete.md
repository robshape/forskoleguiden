# Phase 1 Complete: Add Step 1.3 Failing Contract Test

Implemented a dedicated Step 1.3 contract test that encodes survey-file existence and response integrity requirements against the Malmö index. The test intentionally fails in red state because per-preschool survey files are not yet present, which is the expected TDD outcome for this phase.

**Files created/changed**:

- tests/unit/malmo-surveys.test.ts

**Functions created/changed**:

- getIndex
- getSurveyFilePath
- assertResponseContract

**Tests created/changed**:

- Step 1.3 Malmö survey seed data contract > has one survey file per preschool id in index
- Step 1.3 Malmö survey seed data contract > keeps Helhetsbedömning group and response integrity for each existing survey file

**Review Status**: APPROVED

**Git Commit Message**: test: add malmo survey contract tests
