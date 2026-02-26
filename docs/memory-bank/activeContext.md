# Active Context

Step 0.7 (package scripts) is complete across phases 1–3.

Current state:

- `package.json` now includes required Step 0.7 scripts: `check`, `test`, `test:watch`, `test:e2e`, `lint`, and `format`.
- Post-Step 0.7 hardening applied: `format` now runs `prettier --ignore-path .gitignore --write .` and a dedicated `format:check` script exists (`prettier --ignore-path .gitignore --check .`).
- Existing scripts were preserved as requested: `dev`, `build`, `preview`, `astro`, and `lint:md`.
- Step 0.7 acceptance validation passed with `pnpm build` and `pnpm check` (both exit code 0).
- Root placeholder remains temporary Swedish state in `src/pages/index.astro` (no `/` -> `/sv/` redirect yet).

Pending tracked tasks:

- `TASK001`: implement Steps 3.1-3.3 (BaseLayout, Nav, Footer) and move global CSS import into BaseLayout.
- `TASK002`: implement root redirect `/` -> `/sv/` in Step 3.4.

Next implementation focus: Step 0.8 ESLint/Prettier configuration.
