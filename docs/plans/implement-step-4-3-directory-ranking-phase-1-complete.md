# Phase 1 Complete: Add failing Step 4.3 contracts

Phase 1 delivered a fail-first e2e contract suite for Step 4.3 on `/sv/`. The tests now assert ranking order, heading+count, ranking explanation, and rank-index rendering, and the targeted run is red as expected before production implementation.

**Files created/changed**:

- tests/e2e/directory-data-rendering.spec.ts

**Functions created/changed**:

- test.describe('Swedish directory Step 4.3 contracts')
- test('renders directory cards in default score-desc ranking order')
- test('renders a visible heading row with total preschool count')
- test('renders visible ranking-method explanation copy')
- test('renders rank index text 1..N for each card row')

**Tests created/changed**:

- tests/e2e/directory-data-rendering.spec.ts

**Review Status**: APPROVED

**Git Commit Message**: test: add step 4.3 directory contracts

- Replace /sv smoke test with Step 4.3 behavior contracts
- Assert default score ranking, heading count, and ranking explanation
- Add rank-index row assertions and keep run red before implementation
