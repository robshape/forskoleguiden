# Step 0.7 — Phase 1 Validation (Revision)

- **Date**: 2026-02-26
- **Scope**: Phase 1 only (baseline script gap check)
- **Workspace**: `/Users/shapelessab/Developer/shapeless-gh/forskoleguiden`

## `package.json` before-state scripts (from file content)

Observed in `package.json` before this revision run:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro",
  "lint:md": "markdownlint-cli2 './**/*.md'"
}
```

## Required red-check commands and exact results

### 1) `pnpm run check`

- **Exit code**: 1

```text
ERR_PNPM_NO_SCRIPT Missing script: check

Command "check" not found.
```

### 2) `pnpm run test`

- **Exit code**: 1

```text
ERR_PNPM_NO_SCRIPT Missing script: test

Command "test" not found.
```

### 3) `pnpm run test:watch`

- **Exit code**: 1

```text
ERR_PNPM_NO_SCRIPT Missing script: test:watch

Command "test:watch" not found.
```

### 4) `pnpm run test:e2e`

- **Exit code**: 1

```text
ERR_PNPM_NO_SCRIPT Missing script: test:e2e

Command "test:e2e" not found.
```

### 5) `pnpm run lint`

- **Exit code**: 1

```text
ERR_PNPM_NO_SCRIPT Missing script: lint

Command "lint" not found. Did you mean "pnpm run lint:md"?
```

### 6) `pnpm run format`

- **Exit code**: 1

```text
ERR_PNPM_NO_SCRIPT Missing script: format

Command "format" not found.
```

## Phase 1 objective result

- **PASS**: Concrete red-check evidence captured for all required commands, each showing missing script failures consistent with baseline script gaps.

## Files modified in this revision

- Added `docs/plans/step-0-7-package-scripts-phase-1-validation.md`.
- No source-code files were edited.
