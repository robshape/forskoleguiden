# Implementation Plan: Translation Quality Verification

**Branch**: `007-translation-quality-verification` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-translation-quality-verification/spec.md`

## Summary

Extend the existing i18n test suite to verify that all Phase 2 translation keys are complete, consistent, and correct across all three locales (Swedish, English, Arabic). This involves two new unit test files: one for cross-locale interpolation placeholder parity, and one for Arabic translation content quality (script verification, non-empty resolution, no raw key fallbacks). Additionally, extend the existing post-build static output verification test to assert Arabic pages contain Arabic text and no raw dot-path key strings.

No new production code is needed. All deliverables are test files that run within the existing Vitest and post-build test infrastructure.

## Technical Context

**Language/Version**: TypeScript (strict), Astro static site
**Primary Dependencies**: Vitest (unit + post-build tests), existing `tests/unit/helpers/i18n.ts` shared helpers
**Storage**: Static JSON locale files on disk (`src/i18n/sv.json`, `en.json`, `ar.json`)
**Testing**: Vitest (node environment) via `pnpm test` (unit) and `pnpm test:post-build` (post-build)
**Target Platform**: CI pipeline (`pnpm validate`)
**Project Type**: Static web application — this feature adds verification tests only
**Performance Goals**: N/A (test-only feature)
**Constraints**: Tests must run in the existing Vitest node environment; no browser/DOM required
**Scale/Scope**: 3 locale files, ~60 leaf keys each, ~15 keys with interpolation placeholders

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| **IV. Testing Standards** | PASS | New tests follow BDD-style naming, test behavior not implementation, use shared helpers from `tests/unit/helpers/i18n.ts`. Fewer, longer tests per file. |
| **VI. Internationalization** | PASS | Tests enforce key parity (already exists) and extend to placeholder parity and Arabic content quality — directly supports constitution requirement. |
| **I. Performance by Default** | N/A | No production code changes; no impact on page weight or JS budget. |
| **II. Accessibility First** | N/A | No UI changes. |
| **III. Data Integrity** | PASS | Tests validate data integrity of locale files (contract-style verification). |
| **V. Architecture Discipline** | PASS | Tests organized in existing `tests/unit/` and `tests/post-build/` directories. No new abstractions. |
| **VII. Privacy by Design** | N/A | No user data involved. |

## Project Structure

### Documentation (this feature)

```text
specs/007-translation-quality-verification/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
tests/
├── unit/
│   ├── helpers/
│   │   └── i18n.ts                                          # Existing — add extractPlaceholders helper
│   ├── i18n-locale-key-parity.test.ts                       # Existing — already covers FR-001/FR-002
│   ├── i18n-placeholder-parity.test.ts                      # NEW — cross-locale placeholder verification (FR-004)
│   └── i18n-arabic-translation-quality.test.ts              # NEW — Arabic content quality checks (FR-003/FR-005)
└── post-build/
    └── static-output-verification.test.ts                   # Existing — extend with Arabic content assertions (FR-006)
```

**Structure Decision**: No new directories needed. New test files placed in the existing `tests/unit/` directory following the established BDD-style naming convention. A small helper function is added to the existing `tests/unit/helpers/i18n.ts` module. The post-build test file is extended in-place with new assertions for Arabic page content.

## Core Implementation Steps

The steps below must be executed in order — each step depends on the output of the one before it. Cross-references point to the research decision or data-model section that provides the detailed specification for each step.

### Step 1: Add `extractPlaceholders` helper to `tests/unit/helpers/i18n.ts`

**Depends on**: Nothing (first step)
**Produces**: Shared utility consumed by Step 2
**Detail**: [data-model.md § New Helper](data-model.md#new-helper-addition-to-existing-module) — function signature, input/output, regex
**Research**: [research.md § R1](research.md#r1-placeholder-extraction-strategy) — why this regex, why sorted sets not counts

Add an `extractPlaceholders(value: string): string[]` function to the existing `tests/unit/helpers/i18n.ts` module. The function uses regex `/\{([a-zA-Z0-9_]+)\}/g` (same as production `interpolateTemplate` in `src/i18n/utils.ts`) to extract placeholder token names, deduplicates them, and returns a sorted array.

**Verify**: Import the function in a scratch test or the REPL. Confirm `extractPlaceholders('Hello {name}, you have {count} items')` returns `['count', 'name']`. Confirm `extractPlaceholders('No placeholders here')` returns `[]`.

### Step 2: Create `tests/unit/i18n-placeholder-parity.test.ts`

**Depends on**: Step 1 (`extractPlaceholders` helper)
**Covers**: FR-004, SC-003, User Story 3
**Detail**: [data-model.md § Interpolation Placeholder](data-model.md#interpolation-placeholder) — pattern, comparison unit, constraint
**Research**: [research.md § R1](research.md#r1-placeholder-extraction-strategy) — set-based comparison rationale

Create a new unit test file that:
1. Loads all three locale files via `loadLocaleFromDisk()`.
2. Extracts all leaf key paths via `collectKeyPaths()`.
3. For each leaf key, reads the string value from all three locales via `getByPath()`.
4. Calls `extractPlaceholders()` on each value.
5. Asserts the placeholder token sets are identical across sv, en, and ar for every key.

Follow the "fewer, longer tests" convention — a single `it` block that iterates all keys and collects failures, rather than one `it` per key.

**Verify**: `pnpm test -- tests/unit/i18n-placeholder-parity.test.ts` passes.

### Step 3: Create `tests/unit/i18n-arabic-translation-quality.test.ts`

**Depends on**: Nothing (independent of Steps 1–2, but logically sequenced after)
**Covers**: FR-003, FR-005, SC-002, SC-004, User Stories 1 & 2
**Detail**: [data-model.md § Arabic Script Allowlist](data-model.md#arabic-script-allowlist) — which keys are exempt and why
**Research**: [research.md § R2](research.md#r2-arabic-script-detection-approach) — Unicode ranges for Arabic detection; [research.md § R3](research.md#r3-exception-handling-for-latin-content-in-arabic-values) — allowlist rationale

Create a new unit test file with two test cases:

**Test case 1 — Non-empty resolution**: Load Arabic locale via `loadLocaleFromDisk('ar')`. For every leaf key path, call `t(key, 'ar')` from `src/i18n/utils.ts`. Assert each result is a non-empty string and does not equal the raw key path (which would indicate the fallback was triggered).

**Test case 2 — Arabic script presence**: Load Arabic locale. For every leaf key, read the raw string value. Skip keys in the allowlist (`locale.sv`, `locale.en`). Assert the value matches the Arabic Unicode regex `/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/` (contains at least one Arabic character).

**Verify**: `pnpm test -- tests/unit/i18n-arabic-translation-quality.test.ts` passes.

### Step 4: Extend `tests/post-build/static-output-verification.test.ts`

**Depends on**: Nothing (independent of Steps 1–3, but requires `pnpm build` to have run)
**Covers**: FR-006, SC-005, User Story 4
**Detail**: [data-model.md § Post-Build Verification Targets](data-model.md#post-build-verification-targets) — file targets, assertions, raw key patterns to scan
**Research**: [research.md § R4](research.md#r4-post-build-arabic-page-verification-strategy) — why directory page only, why string search not DOM parsing

Add two new test cases to the existing `describe('static output verification')` block:

**Test case 1 — Arabic content presence**: Read `dist/ar/index.html`. Assert it contains at least one Arabic script character (same Unicode regex as Step 3).

**Test case 2 — No raw key fallbacks**: Read `dist/ar/index.html`. Assert that none of these literal dot-path strings appear in the HTML: `directory.heading`, `compare.heading`, `site.title`, `site.tagline`, `nav.directory`, `compareTray.selectedCount`.

**Verify**: `pnpm build && pnpm test:post-build` passes.

### Step 5: Run full quality gate

**Depends on**: Steps 1–4
**Covers**: All FRs and SCs — integration verification

Run `pnpm validate` to confirm all existing tests still pass alongside the new ones. This is the final verification that nothing was broken and all new tests integrate cleanly with the CI pipeline.

## Refinement Notes

- **FR-001 / FR-002 / SC-001** (key parity): Already fully covered by the existing `i18n-locale-key-parity.test.ts`. No new work needed — confirmed during [research.md § R5](research.md#r5-test-file-organization).
- **Edge case — empty string values**: The key parity test treats empty strings as present keys (passes). The Arabic quality test (Step 3, test case 2) will catch empty Arabic values because an empty string contains zero Arabic characters and is not in the allowlist.
- **Edge case — repeated placeholders**: The `extractPlaceholders` helper returns unique token names (Step 1), so `{name} said hi to {name}` produces `['name']` — duplicate occurrences are intentionally collapsed per [research.md § R1](research.md#r1-placeholder-extraction-strategy).
- **Edge case — extra keys in non-Swedish locales**: Already caught by the existing key parity test which asserts bidirectional equality (sv↔en, sv↔ar).
- **Edge case — Latin proper nouns in Arabic values**: Values like `attribution.text` ("بيانات الاستبيان ({year}) من Malmö stad.") contain both Arabic and Latin text. The "at least one Arabic character" check passes naturally; no allowlist entry needed. See [research.md § R3](research.md#r3-exception-handling-for-latin-content-in-arabic-values).
