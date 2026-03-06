# Phase 2 Complete: Restore type-check green state

Resolved the remaining `pnpm check` failure by correcting the Vite dependency graph rather than suppressing the Astro config type error. Pinning the workspace to the same Vite line Astro uses removed the conflicting Vite 7 plugin types and returned `pnpm check` to green.

**Files created/changed**:

- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`

**Functions created/changed**:

- None

**Tests created/changed**:

- None

**Review Status**: APPROVED

**Git Commit Message**: fix: align vite deps for astro check

- pin vite to Astro's 6.4.1 toolchain
- keep workspace overrides aligned with install policy
- remove the remaining astro config type mismatch
