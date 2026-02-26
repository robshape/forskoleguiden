# Active Context

Step 0.6 (TypeScript path aliases) is complete across phases 1–3.

Current state:

- `tsconfig.json` alias mapping is confirmed and unchanged: `@/*` -> `./src/*`, `@data/*` -> `./data/*`.
- Step 0.6 temporary probe artifacts were removed (`src/alias-probe.temp.ts`, `src/pages/alias-probe.astro`).
- Final Step 0.6 sanity check passed with `pnpm astro check` (0 errors, 0 warnings, 0 hints).
- Root placeholder remains temporary Swedish state in `src/pages/index.astro` (no `/` -> `/sv/` redirect yet).

Pending tracked tasks:

- `TASK001`: implement Steps 3.1-3.3 (BaseLayout, Nav, Footer) and move global CSS import into BaseLayout.
- `TASK002`: implement root redirect `/` -> `/sv/` in Step 3.4.

Next implementation focus: Step 0.7 package scripts.
