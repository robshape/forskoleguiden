# Active Context

Step 3.1 Phase 3 migration is now complete: `src/pages/sv/index.astro` uses `src/layouts/BaseLayout.astro` with `locale="sv"` and `title="Förskoleguiden"`, while preserving current visible text in slot content.

Current state:

- Step 3.1 shell composition is complete and test-covered by `tests/unit/sv-index-layout.test.ts` (fail-first then pass).
- `BaseLayout` now exposes named `header` and `footer` slots to keep page-shell text placement clean during migration.
- `/sv/` still passes shell semantics checks (`html[lang=sv]`, `header`, `main`, `footer`) via `tests/e2e/layout-shell.spec.ts`.
- Step 2 i18n foundation remains complete (`src/i18n/sv.json`, `src/i18n/en.json`, `src/i18n/ar.json`, `src/i18n/utils.ts`).
- Step 1 data/scoring foundation remains green (`src/lib/types.ts`, `src/lib/data.ts`, `src/lib/scoring.ts`).

Pending tracked tasks:

- `TASK001` (in progress): complete Step 3.2/3.3 by introducing Nav/Footer components and wiring them into `BaseLayout`.
- `TASK002` (pending): implement root redirect `/` -> `/sv/` in Step 3.4.

Recently completed tasks:

- `TASK006`: Step 2 i18n foundation complete.
- `TASK005`: Step 1 data layer foundations complete.

Next implementation focus: finish Step 3.2/3.3 under `TASK001`, then execute Step 3.4 redirect work under `TASK002`.
