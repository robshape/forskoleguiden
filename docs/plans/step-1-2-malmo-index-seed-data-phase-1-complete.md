# Phase 1 Complete: Add Step 1.2 contract test and data

Implemented Step 1.2 with strict red-green TDD by adding a unit contract test for the Malmö index and creating the seed data file. The data now contains five official-name preschools from the Malmö 2025 results list with `address: "Malmö"` and a municipal/independent operator mix.

**Files created/changed**:

- tests/unit/malmo-index.test.ts
- data/malmo/index.json

**Functions created/changed**:

- None

**Tests created/changed**:

- Step 1.2 Malmö index seed data contract (`tests/unit/malmo-index.test.ts`)

**Review Status**: APPROVED

**Git Commit Message**: test: add malmo index seed contract

- add unit test for malmo index shape and operator values
- add malmo 2025 index seed file with five selected schools
- include municipal and independent entries with Malmö addresses
