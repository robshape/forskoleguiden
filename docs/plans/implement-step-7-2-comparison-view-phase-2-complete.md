# Phase 2 Complete: Wire Comparison Data and Single-Selection State

Phase 2 threaded the build-time survey payload into the comparison route and added the missing single-selection state to the client island. The new locale copy is present in all three locale files, the one-selected-preschool prompt now renders, and the three-preschool table contract remains the only expected failing behavior.

**Files created/changed**:

- src/pages/sv/jamfor/index.astro
- src/components/preact/ComparisonView.tsx
- src/i18n/sv.json
- src/i18n/en.json
- src/i18n/ar.json

**Functions created/changed**:

- ComparisonView props and single-selection branch
- /sv/jamfor/ build-time survey loading

**Tests created/changed**:

- one-preschool state shows a single-selection prompt and no comparison table
- i18n locale key parity coverage for compare.singleSelectionPrompt

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: feat: add single-selection comparison state

- load all surveys into the comparison route shell
- add localized single-selection comparison prompt
- keep comparison island strings sourced from Astro props
