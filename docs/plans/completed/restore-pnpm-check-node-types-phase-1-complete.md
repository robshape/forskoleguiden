# Phase 1 Complete: Pin Node type dependency

Pinned the missing Node.js type dependency at the repo root so Astro and TypeScript can resolve Node built-ins and `process` across config, source, and test files again. The fix stayed focused on the dependency graph and restored `pnpm check` to green without touching application code.

**Files created/changed**:

- `package.json`
- `pnpm-lock.yaml`

**Functions created/changed**:

- None

**Tests created/changed**:

- None

**Review Status**: APPROVED with minor recommendations

**Git Commit Message**: fix: restore Node typings for astro check

- pin `@types/node` for the Node 22 toolchain
- override `undici-types` to satisfy install trust policy
- refresh lockfile and restore green `pnpm check`
