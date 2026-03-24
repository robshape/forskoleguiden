# Data Model: Arabic RTL Layout

**Branch**: `003-arabic-rtl-layout` | **Date**: 2026-03-24

## Overview

The Arabic RTL layout feature introduces no new persistent data entities, no new runtime state, and no changes to preschool survey or directory data. The feature is driven entirely by existing locale information and shared component props already present in the codebase.

The relevant “model” for this feature is a set of derived presentation contracts that determine how existing UI elements behave when the active locale is Arabic.

---

## Unchanged Product Data

The following existing data remains unchanged:

| Entity                | Status    | Notes                                                                      |
| --------------------- | --------- | -------------------------------------------------------------------------- |
| `PreschoolIndexEntry` | Unchanged | No new metadata fields for RTL                                             |
| `PreschoolSurvey`     | Unchanged | Survey content and percentages remain the same across locales              |
| `compareIds` store    | Unchanged | Arabic continues to use the same session-backed shortlist/compare IDs      |
| i18n string shape     | Unchanged | Arabic translations already exist; this feature does not add new copy keys |
| Route structure       | Unchanged | `/ar/`, `/ar/forskola/[id]/`, `/ar/jamfor/`, `/ar/om/` already exist       |

---

## Derived Presentation Contracts

### `DirectionContext` (derived, not persisted)

This feature relies on a presentation context derived from the active locale.

| Field                | Type                      | Source                                 | Arabic value     |
| -------------------- | ------------------------- | -------------------------------------- | ---------------- |
| `locale`             | `Locale`                  | Existing page/component prop           | `'ar'`           |
| `direction`          | `'ltr' \| 'rtl'`          | Derived from locale                    | `'rtl'`          |
| `numeralSystem`      | `'western'`               | Clarified feature rule                 | `'western'`      |
| `comparisonLayout`   | `'stacked'`               | Existing product shape + clarification | `'stacked'`      |
| `backCueOrientation` | `'ltr' \| 'rtl-mirrored'` | Derived from locale                    | `'rtl-mirrored'` |

This is not a new runtime object that must be created in code. It documents the invariants that implementation and tests must preserve.

---

### Component Behavior Matrix

| Component area       | Existing input                   | Derived RTL behavior                                                            |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| Global shell         | `locale`                         | Header/footer alignment and spacing follow RTL reading order                    |
| Directory card       | `locale`, preschool props        | Metadata, score block, and action area align for Arabic reading order           |
| Sort control         | `locale`, labels                 | Control remains readable and operable in Arabic without changing sort semantics |
| Compare button       | Existing labels and state        | Icon/label composition remains balanced in RTL                                  |
| Detail breadcrumb    | Existing href/label props        | Directional cue is mirrored in Arabic                                           |
| Detail question card | Existing question/locale props   | Text and footer alignment adapt to RTL while keeping the same values            |
| Comparison stack     | Existing surveys, locale, labels | Stacked layout preserved; alignment and text flow adapt to RTL                  |
| Compare tray         | Existing labels/links            | Tray copy and action grouping read naturally in Arabic                          |

---

## Invariants

These rules must remain true after implementation:

1. Arabic uses the same preschool IDs, score calculations, and compare selection model as Swedish and English.
2. Arabic percentages continue to render with Western numerals (`0-9`).
3. The comparison experience remains vertically stacked; RTL work does not change it into a horizontal table.
4. The Arabic back-navigation cue is mirrored, but the underlying navigation target logic does not change.
5. Accessibility fallbacks, including screen-reader tables and button semantics, remain structurally equivalent across locales.

---

## Interface Impact

No new public data interfaces are required.

Expected code-level impact:

| Interface                                          | Change       |
| -------------------------------------------------- | ------------ |
| Existing `locale` props on Astro/Preact components | Reused as-is |
| Preschool data loader interfaces                   | No change    |
| Nanostore state interfaces                         | No change    |
| i18n locale file structure                         | No change    |

The feature should be implementable through styling, layout, and markup-order adjustments inside existing components.
