# Phase 2 Complete: Rename unit test files to domain names

Renamed all unit test files from generic names to domain-and-contract-oriented names while preserving test behavior. Updated direct reference paths in high-signal docs and validated the full required quality-gate command set.

**Files created/changed**:

- tests/unit/data-loader-contract.test.ts
- tests/unit/infrastructure-gitignore-regression.test.ts
- tests/unit/i18n-locale-key-parity.test.ts
- tests/unit/i18n-swedish-copy-contract.test.ts
- tests/unit/i18n-utilities-behavior.test.ts
- tests/unit/malmo-directory-index-contract.test.ts
- tests/unit/malmo-survey-files-contract.test.ts
- tests/unit/scoring-overall-score-utilities.test.ts
- .github/copilot-instructions.md
- docs/memory-bank/systemPatterns.md
- docs/memory-bank/progress.md

**Functions created/changed**:

- none

**Tests created/changed**:

- tests/unit/data-loader-contract.test.ts
- tests/unit/infrastructure-gitignore-regression.test.ts
- tests/unit/i18n-locale-key-parity.test.ts
- tests/unit/i18n-swedish-copy-contract.test.ts
- tests/unit/i18n-utilities-behavior.test.ts
- tests/unit/malmo-directory-index-contract.test.ts
- tests/unit/malmo-survey-files-contract.test.ts
- tests/unit/scoring-overall-score-utilities.test.ts

**Review Status**: APPROVED

**Git Commit Message**: refactor: rename unit tests by domain

- Rename generic unit test files to domain-contract filenames
- Keep unit test logic unchanged and preserve coverage behavior
- Update high-signal docs and pass lint/lint:md/check/format/test
