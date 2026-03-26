# Data Model: Translation Quality Verification

**Feature**: 007-translation-quality-verification
**Date**: 2026-03-26
**Plan**: [plan.md](plan.md) — see "Core Implementation Steps" for how these entities are consumed

## Overview

This feature is test-only — no new production data entities are introduced. The data model describes the structures the tests operate on, all of which already exist in the codebase.

## Entities (existing, read-only)

### Locale File

- **Source**: `src/i18n/{locale}.json` where locale ∈ `{sv, en, ar}`
- **Format**: Nested JSON object with string leaf values
- **Loaded by tests via**: `loadLocaleFromDisk(locale)` from `tests/unit/helpers/i18n.ts`
- **Key structure**: Flat dot-path convention (e.g., `compare.share.button`)
- **Constraint**: All three files must have identical recursive key structures (enforced by `i18n-locale-key-parity.test.ts`)

### Translation Key (leaf path)

- **Type**: `string` — dot-path like `directory.heading` or `compare.share.warningTemplate`
- **Extracted via**: `collectKeyPaths(obj)` from `tests/unit/helpers/i18n.ts`
- **Resolved via**: `t(key, locale)` from `src/i18n/utils.ts`
- **Fallback behavior**: Returns the raw key string if the key is missing or resolves to a non-string

### Interpolation Placeholder

- **Pattern**: `{tokenName}` where tokenName matches `[a-zA-Z0-9_]+`
- **Extraction regex**: `/\{([a-zA-Z0-9_]+)\}/g` (matches production `interpolateTemplate`)
- **Comparison unit**: Sorted set of unique token names per key per locale
- **Constraint**: For each key, the placeholder token set must be identical across all three locales
- **Design rationale**: [research.md § R1](research.md#r1-placeholder-extraction-strategy) — why sorted sets, why this regex
- **Consumed by**: [plan.md § Step 2](plan.md#step-2-create-testsuniti18n-placeholder-paritytest-ts)

## New Helper (addition to existing module)

### `extractPlaceholders(value: string): string[]`

- **Location**: `tests/unit/helpers/i18n.ts`
- **Input**: A translation string value
- **Output**: Sorted array of unique placeholder token names (e.g., `['count', 'name']`)
- **Regex**: `/\{([a-zA-Z0-9_]+)\}/g`
- **Design rationale**: [research.md § R1](research.md#r1-placeholder-extraction-strategy)
- **Implemented in**: [plan.md § Step 1](plan.md#step-1-add-extractplaceholders-helper-to-testsunithelpersits)
- **Consumed by**: [plan.md § Step 2](plan.md#step-2-create-testsuniti18n-placeholder-paritytest-ts)

## Arabic Script Allowlist

Keys whose Arabic locale values are permitted to contain zero Arabic script characters:

| Key | Reason |
|-----|--------|
| `locale.sv` | Native-script label: "Svenska" (Latin) |
| `locale.en` | Native-script label: "English" (Latin) |

All other leaf keys must contain at least one character in the Arabic Unicode ranges (`\u0600-\u06FF`, `\u0750-\u077F`, `\u08A0-\u08FF`, `\uFB50-\uFDFF`, `\uFE70-\uFEFF`).

- **Design rationale**: [research.md § R2](research.md#r2-arabic-script-detection-approach) — Unicode range selection; [research.md § R3](research.md#r3-exception-handling-for-latin-content-in-arabic-values) — why an allowlist, why these two keys
- **Consumed by**: [plan.md § Step 3](plan.md#step-3-create-testsuniti18n-arabic-translation-qualitytest-ts)

## Post-Build Verification Targets

| File | Assertion |
|------|-----------|
| `dist/ar/index.html` | Contains at least one Arabic script character |
| `dist/ar/index.html` | Does not contain raw dot-path key strings as literal text |

### Raw Key Patterns to Scan For

A representative sample of dot-path keys that, if found literally in the HTML, indicate a broken translation:

- `directory.heading`
- `compare.heading`
- `site.title`
- `site.tagline`
- `nav.directory`
- `compareTray.selectedCount`

- **Design rationale**: [research.md § R4](research.md#r4-post-build-arabic-page-verification-strategy) — why directory page only, why string search not DOM parsing
- **Consumed by**: [plan.md § Step 4](plan.md#step-4-extend-testspost-buildstatic-output-verificationtest-ts)
