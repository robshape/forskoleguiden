# Phase 3 Complete: Implement heading/count row and ranking explanation

Phase 3 added the Step 4.3 directory heading row with total preschool count, a static active sort label, and the ranking-method explanation copy on `/sv/`, while preserving Phase 2 ranking-order and rank-index behavior. Locale key parity was maintained across Swedish, English, and Arabic translation files, and review approved the phase.

**Files created/changed**:

- src/pages/sv/index.astro
- src/i18n/sv.json
- src/i18n/en.json
- src/i18n/ar.json
- tests/unit/i18n-swedish-copy-contract.test.ts

**Functions created/changed**:

- `/sv/` route translations for `directory.heading`, `directory.rankingExplanation`, and `directory.sort.ranking`
- Heading row rendering with dynamic count (`${directoryHeading} (${preschoolDirectory.length})`)
- Static active sort label rendering (`rankingSortLabel`)
- Ranking explanation paragraph rendering (`rankingExplanation`)

**Tests created/changed**:

- tests/unit/i18n-swedish-copy-contract.test.ts (new required-path + approved-copy assertion for `directory.rankingExplanation`)

**Review Status**: APPROVED

**Git Commit Message**: feat: add directory heading and ranking explanation

- Render Swedish directory heading row with preschool count
- Add static active ranking label and explanation text for Step 4.3
- Add locale-parity translation key and Swedish copy contract coverage
