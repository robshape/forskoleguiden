# Phase 1 Complete: Add failing i18n utility tests

Added strict RED contract tests for Step 2.3 i18n utilities before production implementation. The test suite intentionally fails because `@/i18n/utils` is not implemented yet, confirming TDD sequencing is correct.

**Files created/changed**:

- `tests/unit/i18n-utils.test.ts`

**Functions created/changed**:

- None (test-only phase)

**Tests created/changed**:

- `Step 2.3 i18n utilities contract` in `tests/unit/i18n-utils.test.ts`
- `getLocaleFromURL` parsing and default behavior tests
- `t()` lookup and fallback behavior tests

**Review Status**: APPROVED

**Git Commit Message**: test: add red tests for i18n utils

- Add Step 2.3 contract tests for locale path parsing
- Add translation lookup and fallback behavior assertions
- Keep suite in RED until i18n utils implementation is added
