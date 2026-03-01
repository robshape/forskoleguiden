# Plan: Step 1.3 Survey Seed Data

Implement Step 1.3 by first writing a failing unit test that codifies index-to-survey consistency and percentage integrity constraints, then adding Malmö 2025 per-preschool survey seed files to satisfy the test. This keeps the data layer deterministic, validates chart-safe percentage totals, and aligns with existing TypeScript contracts.

## Phases

1. **Phase 1: Add Step 1.3 Failing Contract Test**
   - **Objective**: Encode Step 1.3 acceptance criteria in a dedicated unit test that initially fails due to missing survey files.
   - **Files/Functions to Modify/Create**: `tests/unit/malmo-surveys.test.ts`
   - **Tests to Write**: `malmo-surveys.test.ts` cases for file existence per index ID, Helhetsbedömning group validation, percentage range checks, and 99–101 total checks.
   - **Steps**:
     1. Create `tests/unit/malmo-surveys.test.ts` using existing Vitest + fs/path conventions from current unit tests.
     2. Assert each preschool in `data/malmo/index.json` has a corresponding `data/malmo/2025/{id}.json` file.
     3. Assert each survey contains `Helhetsbedömning` with exactly two questions.
     4. Assert all five response percentages are numbers in the 0–100 range.
     5. Assert each question’s five percentage buckets sum to 99–101 inclusive.
     6. Run the targeted test to confirm red state.

2. **Phase 2: Add Malmö 2025 Survey Seed Files**
   - **Objective**: Add one valid survey JSON file per index ID with realistic, varied values that satisfy all Step 1.3 constraints.
   - **Files/Functions to Modify/Create**: `data/malmo/2025/almgardens-forskola.json`, `data/malmo/2025/augustenborgs-forskola.json`, `data/malmo/2025/bulltofta-forskola.json`, `data/malmo/2025/bellevuegardens-montessoriforskola.json`, `data/malmo/2025/bladins-internationella-forskola.json`
   - **Tests to Write**: Re-run `tests/unit/malmo-surveys.test.ts` as the green verification test after data implementation.
   - **Steps**:
     1. Create `data/malmo/2025` survey files matching each index `id`.
     2. Include canonical `PreschoolSurvey` shape including `id`, `preschoolName`, `address`, `surveyYear`, and `questionGroups`.
     3. Ensure `preschoolName` matches index `name` exactly and `id` matches filename/index ID.
     4. Provide one `Helhetsbedömning` group with exactly two questions and varied percentages.
     5. Keep each question’s five response percentages within 0–100 and totaling 99–101.
     6. Run targeted tests to confirm green state.

3. **Phase 3: Verify Quality Gates and Update Memory Bank**
   - **Objective**: Validate no regressions and persist task/memory context updates for Step 1.3 completion.
   - **Files/Functions to Modify/Create**: `docs/memory-bank/activeContext.md`, `docs/memory-bank/progress.md`, `docs/memory-bank/tasks/TASK005-implement-step-1-data-layer-foundations.md`, `docs/memory-bank/tasks/_index.md` (if status transitions)
   - **Tests to Write**: No new tests; run existing project quality gates.
   - **Steps**:
     1. Run `pnpm lint`.
     2. Run `pnpm lint:md`.
     3. Run `pnpm format`.
     4. Run `pnpm test`.
     5. Update memory-bank task progress and active context for Step 1.3 completion details.

## Open Questions

1. No open blockers; proceed with canonical `PreschoolSurvey.id` included in every Step 1.3 survey file.
