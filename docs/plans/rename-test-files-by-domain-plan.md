# Plan: Rename test files by domain

Rename test files so each name clearly communicates domain and test intent, then update all direct path references in docs/history to keep commands and project memory accurate.

## Phases

1. **Phase 1: Rename e2e test files to domain names**
   - **Objective**: Replace step-number/generic e2e names with clear domain-based names.
   - **Files/Functions to Modify/Create**: test files under `tests/e2e/`.
   - **Tests to Write**: none.
   - **Steps**:
     1. Ensure directory rendering coverage uses `directory-data-rendering.spec.ts`.
     2. Ensure preschool card acceptance coverage uses `preschool-card-contract.spec.ts`.
     3. Ensure routing smoke coverage uses `homepage-routing-smoke.spec.ts`.
     4. Ensure layout shell accessibility coverage uses `layout-shell-accessibility.spec.ts`.

2. **Phase 2: Rename unit test files to domain names**
   - **Objective**: Replace generic/ambiguous unit test names with explicit domain-and-behavior names.
   - **Files/Functions to Modify/Create**: test files under `tests/unit/`.
   - **Tests to Write**: none.
   - **Steps**:
     1. Rename loader/data contract tests to explicit data-loader naming.
     2. Rename i18n tests to indicate parity/copy/utilities behavior.
     3. Rename Malmö dataset contract tests to explicit index/survey naming.
     4. Rename scoring test to indicate overall-score utility behavior.

3. **Phase 3: Update references, memory bank, and validate**
   - **Objective**: Ensure all explicit test file references and project memory match renamed files.
   - **Files/Functions to Modify/Create**: docs under `docs/`, `.github/copilot-instructions.md`, memory-bank files.
   - **Tests to Write**: none.
   - **Steps**:
     1. Update markdown command snippets and file references to renamed paths.
     2. Update memory-bank context/progress/tasks references for continuity.
     3. Run required quality gates: `pnpm lint`, `pnpm lint:md`, `pnpm check`, `pnpm format`, `pnpm test`.

## Open Questions

1. Update historical memory-bank/task logs to renamed test filenames for copy/paste reliability? **Resolved: Yes**
