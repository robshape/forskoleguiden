# Active Context

Step 0.9 (Vitest configuration) is complete across phases 1–3.

Current state:

- `vitest.config.ts` now exists at project root and uses the typed helper from `vitest/config`.
- Vitest test discovery is explicitly scoped to `tests/unit/**/*.test.ts`.
- Vitest environment is explicitly declared as `node` to prevent accidental environment drift.
- Alias resolution is configured in Vitest for `@` -> `./src` and `@data` -> `./data`, aligned with `tsconfig.json` paths.
- `tests/unit/smoke.test.ts` now exists with a passing infrastructure-intent smoke assertion.
- Step 0.9 acceptance validation passed with `pnpm test` (exit code 0), with evidence captured in phase validation artifacts.
- Root placeholder remains temporary Swedish state in `src/pages/index.astro` (no `/` -> `/sv/` redirect yet).

Pending tracked tasks:

- `TASK001`: implement Steps 3.1-3.3 (BaseLayout, Nav, Footer) and move global CSS import into BaseLayout.
- `TASK002`: implement root redirect `/` -> `/sv/` in Step 3.4.

Next implementation focus: Step 0.10 Playwright configuration.
