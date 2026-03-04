# Plan Complete: Rename test files by domain

Completed a full test-suite naming cleanup by replacing generic and step-numbered filenames with clear domain-and-contract names across both `tests/e2e` and `tests/unit`. Synchronized documentation and memory-bank references to the new names so command snippets remain copy-safe. Validation gates are green on the final repository state.

**Phases Completed**: 3 of 3

1. ✅ Phase 1: Rename e2e test files to domain names
2. ✅ Phase 2: Rename unit test files to domain names
3. ✅ Phase 3: Update references, memory bank, and validate

**All Files Created/Modified**:

- tests/e2e/directory-data-rendering.spec.ts
- tests/e2e/homepage-routing-smoke.spec.ts
- tests/e2e/layout-shell-accessibility.spec.ts
- tests/e2e/preschool-card-contract.spec.ts
- tests/unit/data-loader-contract.test.ts
- tests/unit/infrastructure-gitignore-regression.test.ts
- tests/unit/i18n-locale-key-parity.test.ts
- tests/unit/i18n-swedish-copy-contract.test.ts
- tests/unit/i18n-utilities-behavior.test.ts
- tests/unit/malmo-directory-index-contract.test.ts
- tests/unit/malmo-survey-files-contract.test.ts
- tests/unit/scoring-overall-score-utilities.test.ts
- .github/copilot-instructions.md
- docs/implementation-plan.md
- docs/memory-bank/activeContext.md
- docs/memory-bank/progress.md
- docs/memory-bank/systemPatterns.md
- docs/memory-bank/tasks/TASK001-wire-global-css-base-layout.md
- docs/memory-bank/tasks/TASK002-implement-root-redirect-step-3-4.md
- docs/memory-bank/tasks/TASK005-implement-step-1-data-layer-foundations.md
- docs/memory-bank/tasks/TASK006-implement-step-2-i18n-foundation.md
- docs/memory-bank/tasks/TASK007-implement-phase-a-ui-styling.md
- docs/memory-bank/tasks/TASK008-phase-a-hardening-patch.md
- docs/plans/implement-step-4-1-directory-data-wiring-plan.md
- docs/plans/implement-step-4-1-directory-data-wiring-phase-1-complete.md
- docs/plans/implement-step-4-2-preschool-card-phase-1-complete.md
- docs/plans/implement-step-4-2-preschool-card-phase-3-complete.md
- docs/plans/implement-step-4-2-preschool-card-complete.md
- docs/plans/preschool-card-style-fix.md
- docs/plans/rename-test-files-by-domain-plan.md
- docs/plans/rename-test-files-by-domain-phase-1-complete.md
- docs/plans/rename-test-files-by-domain-phase-2-complete.md
- docs/plans/rename-test-files-by-domain-phase-3-complete.md

**Key Functions/Classes Added**:

- none (file rename and documentation synchronization task)

**Test Coverage**:

- Total tests written: 0
- All tests passing: ✅

**Recommendations for Next Steps**:

- Keep domain-first naming for all newly added test files.
- Consider adding one short naming guideline section in `README.md` for contributors.
