# Data Model: CI Pipeline Updates

**Feature**: 009-ci-pipeline-updates
**Date**: 2026-03-26

## Overview

This feature modifies CI configuration and test infrastructure only. No application data model changes are required.

## Entities

No new entities are introduced. The feature operates on two existing configuration artifacts:

### Lighthouse CI Configuration (`.lighthouserc.json`)

- **url** (array of strings): URLs to audit. Extended from 1 entry to 3 entries (sv, en, ar).
- **assertions** (object): Score thresholds applied uniformly to all collected URLs. Unchanged.

### Page Weight Budget Test (`tests/post-build/page-weight-budget.test.ts`)

- **LOCALES** (array of strings): The set of locales to evaluate. New constant replacing the hardcoded `sv`-only path. Values: `['sv', 'en', 'ar']`.
- **PAGE_WEIGHT_BUDGET_BYTES** (number): Budget threshold in bytes. Unchanged (600 KB).

## Relationships

- The `LOCALES` array in the page weight test should align with the `LOCALES` constant already defined in `static-output-verification.test.ts` to maintain consistency. See [plan.md Phase 2, step 2a](plan.md#phase-2-page-weight-budget-parameterization-fr-003-fr-004).
- The Lighthouse CI URL array must correspond to the same locale set. See [plan.md Phase 3, step 3a](plan.md#phase-3-lighthouse-ci-multi-locale-audit-fr-005-fr-006).

## Validation Rules

- Each locale in the `LOCALES` array must have a corresponding `dist/{locale}/index.html` after build.
- Each Lighthouse URL must be reachable via the preview server (`http://localhost:4321/forskoleguiden/{locale}/`).

## State Transitions

N/A — configuration is static; no runtime state changes.
