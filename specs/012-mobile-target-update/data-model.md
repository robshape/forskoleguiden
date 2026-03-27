# Data Model: Mobile Target Update — iPhone 17

**Feature**: 012-mobile-target-update
**Date**: 2026-03-27

## Overview

This feature does not introduce new data entities or modify existing data models. The preschool data pipeline (`data/malmo/`), TypeScript interfaces (`src/lib/types.ts`), and scoring logic (`src/lib/scoring.ts`) are entirely unaffected.

The only "data" relevant to this feature is the **Device Viewport Reference Table** defined in the spec, which serves as a canonical reference for documentation and test configuration — not as a runtime data structure.

## Device Viewport Reference

This table is embedded in documentation only. It is not a code-level data model.

| Device | CSS Width | CSS Height | Role |
|--------|-----------|------------|------|
| iPhone 17 | 393 | 852 | Primary target |
| iPhone 17 Pro | 393 | 852 | Same as primary |
| iPhone 17 Pro Max | 430 | 932 | Upper mobile bound |
| Google Pixel 10 | 412 | 915 | Mid-range Android reference |
| Samsung Galaxy S26 Ultra | 412 | 915 | Mid-range Android reference |
| Samsung Galaxy S26+ | 384 | 824 | Mid-range Android reference |
| Samsung Galaxy S26 | 360 | 780 | Lower Android bound |
| iPhone 13 mini | 375 | 812 | Lower Apple bound (former primary) |
| Minimum supported | 320 | — | Absolute minimum width |

## Impact on Existing Data Model

- **No changes** to `PreschoolSurvey`, `PreschoolIndex`, `SurveyResponse`, or `OperatorType` interfaces.
- **No changes** to JSON data files in `data/malmo/`.
- **No changes** to i18n translation keys or locale JSON files.
- **No changes** to state management atoms (`compareIds`) or actions.
