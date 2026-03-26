# Quickstart: Translation Quality Verification

**Feature**: 007-translation-quality-verification
**Date**: 2026-03-26
**Plan**: [plan.md](plan.md) — see "Core Implementation Steps" for the sequenced walkthrough

## What This Feature Does

Adds automated verification tests to ensure all i18n translation keys are complete, consistent, and correctly rendered across Swedish, English, and Arabic locales. No production code changes — all deliverables are test files.

## Prerequisites

- Node.js and pnpm installed (project already set up)
- Existing tests pass: `pnpm test`
- For post-build tests: `pnpm build` has been run

## Files to Create / Modify

Implementation order matters — follow the step sequence in [plan.md § Core Implementation Steps](plan.md#core-implementation-steps).

### Step 1: Modified — `tests/unit/helpers/i18n.ts`

- Add `extractPlaceholders(value: string): string[]` helper function
- Regex and signature: [data-model.md § New Helper](data-model.md#new-helper-addition-to-existing-module)
- Design rationale: [research.md § R1](research.md#r1-placeholder-extraction-strategy)

### Step 2: New — `tests/unit/i18n-placeholder-parity.test.ts`

- Verifies interpolation placeholders (`{count}`, `{name}`, etc.) are identical across all three locales for every translation key
- Consumes the `extractPlaceholders()` helper from Step 1
- Covers: FR-004, SC-003, User Story 3

### Step 3: New — `tests/unit/i18n-arabic-translation-quality.test.ts`

- Verifies every Arabic translation key resolves to a non-empty string (not a raw key fallback)
- Verifies Arabic values contain Arabic script characters (with allowlisted exceptions)
- Allowlist: [data-model.md § Arabic Script Allowlist](data-model.md#arabic-script-allowlist)
- Unicode ranges: [research.md § R2](research.md#r2-arabic-script-detection-approach)
- Covers: FR-003, FR-005, SC-002, SC-004, User Stories 1 & 2

### Step 4: Modified — `tests/post-build/static-output-verification.test.ts`

- Add assertions that the Arabic directory page contains Arabic text
- Add assertions that no raw dot-path key strings appear in the Arabic HTML output
- Target file and key patterns: [data-model.md § Post-Build Verification Targets](data-model.md#post-build-verification-targets)
- Strategy rationale: [research.md § R4](research.md#r4-post-build-arabic-page-verification-strategy)
- Covers: FR-006, SC-005, User Story 4

## How to Run

```bash
# Run all unit tests (includes new i18n tests)
pnpm test

# Run only the new placeholder parity test
pnpm test -- tests/unit/i18n-placeholder-parity.test.ts

# Run only the new Arabic quality test
pnpm test -- tests/unit/i18n-arabic-translation-quality.test.ts

# Run post-build tests (requires pnpm build first)
pnpm build && pnpm test:post-build
```

## Verification

All tests should pass with the current locale files. If any test fails, it indicates a real translation quality issue that needs to be fixed in the locale JSON files.

```bash
# Full quality gate (Step 5 in the plan)
pnpm validate
```
