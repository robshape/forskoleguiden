# Plan: Implement Step 4.3 Directory Ranking UI

Implement Step 4.3 for the Swedish directory page with strict TDD: add failing contracts first, then minimal route-level rendering updates for ranking order, rank positions, and transparent ranking copy. Keep scope limited to Step 4.3 and avoid Step 4.4 interactive sort behavior.

## Assumptions

- The Step 4.3 active sort control is rendered as a static, non-interactive active label (`Rankning`) in the heading row.
- Ranking position is rendered in the directory list wrapper (outside `PreschoolCard`) to keep card API unchanged.

## Phases

1. **Phase 1: Add failing Step 4.3 contracts**
   - **Objective**: Prove current `/sv/` does not satisfy Step 4.3.
   - **Files/Functions to Modify/Create**:
     - `tests/e2e/directory-data-rendering.spec.ts`
     - `tests/unit/i18n-swedish-copy-contract.test.ts` (if new keys are required)
   - **Tests to Write**:
     - Directory order matches score-desc ranking.
     - Ranking explanation text is visible.
     - Heading row contains count.
     - Rank index is rendered for each card item.
   - **Steps**:
     1. Add failing e2e assertions for Step 4.3 behavior.
     2. Run targeted e2e test and confirm failure.
     3. Add failing i18n contract assertions only when new keys are introduced.

2. **Phase 2: Implement ranking order and rank positions**
   - **Objective**: Render score-desc ordering with deterministic tie-breaking and visible rank positions.
   - **Files/Functions to Modify/Create**:
     - `src/pages/sv/index.astro`
   - **Tests to Write**:
     - Re-run Step 4.3 e2e contract.
   - **Steps**:
     1. Sort mapped preschool data by `byOverallScoreDesc`.
     2. Add deterministic tie-breaker by preschool name.
     3. Render rank index for each list item.
     4. Re-run targeted e2e test and confirm green.

3. **Phase 3: Implement heading/count row and ranking explanation**
   - **Objective**: Add transparent ranking-method copy and heading/count row while keeping sort toggle non-interactive.
   - **Files/Functions to Modify/Create**:
     - `src/pages/sv/index.astro`
     - `src/i18n/sv.json`
     - `src/i18n/en.json`
     - `src/i18n/ar.json`
     - `tests/unit/i18n-swedish-copy-contract.test.ts`
   - **Tests to Write**:
     - i18n required-key assertions for new Step 4.3 keys.
     - Existing i18n parity test remains green.
     - Step 4.3 e2e assertions pass.
   - **Steps**:
     1. Add Step 4.3 key set with locale parity.
     2. Render heading row (title + count + static active sort label).
     3. Render ranking explanation text under heading row.
     4. Re-run unit/e2e tests and confirm green.

4. **Phase 4: Final quality gates and handoff**
   - **Objective**: Verify repository standards and finalize completion artifacts.
   - **Files/Functions to Modify/Create**:
     - No functional-file changes expected.
   - **Tests to Write**:
     - None.
   - **Steps**:
     1. Run `pnpm lint`.
     2. Run `pnpm lint:md`.
     3. Run `pnpm check`.
     4. Run `pnpm format`.
     5. Run `pnpm test`.
     6. Run targeted Step 4.3 e2e test.

## Open Questions

1. None for this execution pass. Scope and assumptions are fixed for Step 4.3 implementation.
