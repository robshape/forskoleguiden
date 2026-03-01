# Phase 1 Complete: Add Locale Parity Contract Test

Implemented a dedicated Step 2.2 parity contract test that enforces exact top-level key-set alignment across `sv`, `en`, and `ar` locale files. The targeted test run fails deterministically in the current state because `en.json` and `ar.json` are not yet present, validating the red phase for strict test-first implementation.

**Files created/changed**:

- `tests/unit/i18n-locales.test.ts`

**Functions created/changed**:

- `loadLocaleFromDisk(locale)`
- `sortedTopLevelKeys(locale)`

**Tests created/changed**:

- `Step 2.2 locale parity contract > matches top-level key set across sv/en/ar locales`

**Review Status**: APPROVED

**Git Commit Message**: test: add locale parity red contract

- Add Step 2.2 parity test for sv/en/ar top-level i18n keys
- Fail deterministically when en/ar locale files are missing
- Keep scope isolated to dedicated i18n parity test file
