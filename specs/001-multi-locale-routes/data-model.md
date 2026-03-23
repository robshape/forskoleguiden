# Data Model: Multi-Locale Page Routes

**Branch**: `001-multi-locale-routes` | **Date**: 2026-03-23

## Overview

This feature introduces **no new data entities**. It reuses existing types and data loaders to generate English and Arabic page routes that mirror the Swedish pages. All three locales share the same underlying preschool data.

## Existing Entities Used

### Locale

- **Source**: `src/i18n/utils.ts`
- **Type**: `'sv' | 'en' | 'ar'`
- **Role in this feature**: Each page file sets a `locale` constant that determines the URL prefix, translation language, and text direction (RTL for Arabic).
- **No changes needed**: The type already includes all three locales.

### PreschoolIndex

- **Source**: `src/lib/types.ts`
- **Fields**: `city: string`, `year: number`, `preschools: PreschoolIndexEntry[]`
- **Role in this feature**: Loaded at build time by `getPreschoolIndex()` to enumerate all preschools for directory and detail page generation. Used identically across all three locales.
- **No changes needed**.

### PreschoolIndexEntry

- **Source**: `src/lib/types.ts`
- **Fields**: `id: string`, `name: string`, `address: string`, `operatorType: OperatorType`
- **Role in this feature**: Provides preschool metadata displayed on directory cards and detail pages. The same entry is used for all locales — only the surrounding UI text changes via `t()`.
- **No changes needed**.

### PreschoolSurvey

- **Source**: `src/lib/types.ts`
- **Fields**: `id: string`, `preschoolName: string`, `totalRespondentsPercent: number`, `questionGroups: QuestionGroup[]`
- **Role in this feature**: Loaded per-preschool for detail pages and comparison views. Shared across all locales.
- **No changes needed**.

## Data Flow

```text
data/malmo/index.json ──→ getPreschoolIndex() ──→ All 3 locale directory pages
data/malmo/2025/*.json ──→ getPreschoolSurveyByYear() ──→ All 3 locale detail pages
                        ──→ getAllPreschoolSurveys() ──→ All 3 locale comparison pages
src/i18n/{sv,en,ar}.json ──→ t(key, locale) ──→ Locale-specific UI text on each page
```

All data loaders are locale-agnostic — they return the same data regardless of which locale page calls them. The translation function `t()` is the only locale-sensitive operation.

## Validation

- **Type safety**: TypeScript strict mode enforces that `locale` variables are of type `Locale`. Passing an unsupported locale string to `t()` is a compile-time error.
- **Key parity**: The existing `i18n-locale-key-parity.test.ts` unit test ensures all three locale files have identical key structures.
- **Data contracts**: Existing contract tests (`malmo-survey-files-contract.test.ts`, `malmo-directory-index-contract.test.ts`) validate data shape. These are locale-independent and require no changes.
