# Plan: Implement Step 2.3 i18n utilities

Implement Step 2.3 by adding a runtime i18n helper module and test coverage using strict TDD. This unblocks Step 3 layout work by providing the shared `Locale` type and deterministic locale/key lookup behavior.

## Phases

1. **Phase 1: Add failing i18n utility tests**
   - **Objective**: Define Step 2.3 behavior contract in unit tests first (RED).
   - **Files/Functions to Modify/Create**: `tests/unit/i18n-utils.test.ts`
   - **Tests to Write**:
     - `getLocaleFromURL` parses `/sv/`, `/en/compare`, `/ar/`, and defaults to `sv` for `/`
     - `getLocaleFromURL` handles `URL` inputs
     - `t('site.title', 'sv')` returns Swedish value
     - `t('nonexistent.key', 'sv')` falls back to key
     - `t` falls back when dot-path resolves to non-string
   - **Steps**:
     1. Create `tests/unit/i18n-utils.test.ts` with only Step 2.3 assertions.
     2. Run targeted tests to confirm failure due to missing `src/i18n/utils.ts`.
     3. Verify failure output matches expected missing implementation.

2. **Phase 2: Implement Step 2.3 helpers minimally**
   - **Objective**: Implement the smallest production code to satisfy Step 2.3 tests (GREEN).
   - **Files/Functions to Modify/Create**: `src/i18n/utils.ts`
   - **Tests to Write**: None (reuse Phase 1 tests)
   - **Steps**:
     1. Add `Locale` type export: `'sv' | 'en' | 'ar'`.
     2. Implement `getLocaleFromURL(url: URL | string)` with strict first-path-segment matching and `sv` default.
     3. Implement `t(key, locale)` with dot-path lookup against locale JSON and key fallback for missing/non-string values.
     4. Re-run targeted tests and iterate until green.

3. **Phase 3: Validate + update task memory**
   - **Objective**: Confirm repository quality gates and update memory-bank/task tracking for completion.
   - **Files/Functions to Modify/Create**:
     - `docs/memory-bank/tasks/TASK006-implement-step-2-i18n-foundation.md`
     - `docs/memory-bank/tasks/_index.md` (if status changes)
     - `docs/memory-bank/activeContext.md`
     - `docs/memory-bank/progress.md`
   - **Tests to Write**: None
   - **Steps**:
     1. Run `pnpm test` to verify Step 2.3/unit suite stability.
     2. Run required repository gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
     3. Update TASK006 subtasks/log and memory-bank status to reflect Step 2.3 completion.

## Open Questions

1. For non-prefixed paths like `/compare`, `getLocaleFromURL` defaults to `sv`.
2. If `t()` resolves a key to an object (e.g. `site`), fallback returns the key string.
