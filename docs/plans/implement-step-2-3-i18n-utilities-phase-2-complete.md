# Phase 2 Complete: Implement Step 2.3 helpers minimally

Implemented the runtime i18n utility module for Step 2.3 with a minimal API and behavior-driven logic. Locale parsing and translation lookup now satisfy the RED tests introduced in Phase 1, and the full unit suite remains green.

**Files created/changed**:

- `src/i18n/utils.ts`

**Functions created/changed**:

- `Locale` type
- `getLocaleFromURL(url: URL | string): Locale`
- `t(key: string, locale: Locale): string`

**Tests created/changed**:

- Existing `tests/unit/i18n-utils.test.ts` now passing (8 tests)
- Full unit suite passing (`pnpm test`)

**Review Status**: APPROVED

**Git Commit Message**: feat: add i18n locale utility helpers

- Add Locale type and URL locale parsing helper
- Implement dot-path translation lookup across sv/en/ar JSON
- Fallback to key for missing or non-string translation values
