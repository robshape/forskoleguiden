# Active Context

Step 2 i18n foundation (Steps 2.1-2.3) is complete with green quality gates, and next implementation focus has moved to Step 3.1-3.3 layout shell work (`TASK001`).

Current state:

- Step 2.1 Swedish i18n contract is implemented via `src/i18n/sv.json` and key-contract coverage in `tests/unit/i18n-sv.test.ts`.
- Step 2.1 followed a test-first workflow: key assertions were defined first, then translation keys were implemented to satisfy the contract.
- Step 2.2 placeholder locales are implemented via `src/i18n/en.json` and `src/i18n/ar.json`, with parity validation in `tests/unit/i18n-locales.test.ts`.
- Step 2.3 locale utilities are implemented in `src/i18n/utils.ts` (`Locale`, `getLocaleFromURL()`, `t()`) with behavior coverage in `tests/unit/i18n-utils.test.ts`.
- Required Phase 3 commands were run and pass: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Step 1 data-layer and scoring integrity remains green (`tests/unit/malmo-index.test.ts`, `tests/unit/malmo-surveys.test.ts`, `tests/unit/data.test.ts`, `tests/unit/scoring.test.ts`).

Pending tracked tasks:

- `TASK001` (pending, unblocked, next focus): implement Steps 3.1-3.3 layout shell (BaseLayout, Nav, Footer, global stylesheet wiring).
- `TASK002` (pending): implement root redirect `/` -> `/sv/` in Step 3.4.

Recently completed task:

- `TASK006`: complete Step 2 i18n foundation (Steps 2.1-2.3), including locale utility behavior tests and required Phase 3 validation.
- `TASK005`: complete Step 1 data-layer foundations (Steps 1.1-1.5), including Step 1.5 Phase 3 validation.
- `TASK004`: complete Step 0.11 `.gitignore` verification and documentation updates.
- `TASK003`: complete Step 0.10 Playwright configuration validation and memory-bank/task documentation updates.

Next implementation focus: execute Step 3.1-3.3 within `TASK001`. Step 3.4 redirect remains independently implementable and tracked as deferred in `TASK002`.
