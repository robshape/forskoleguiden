# Research: CI Pipeline Updates

**Feature**: 009-ci-pipeline-updates
**Date**: 2026-03-26

## Research Tasks

### R1: Do Phase 2 e2e tests auto-discover in CI?

**Decision**: Yes — no workflow or Playwright config changes needed.

**Used by**: [plan.md Phase 1](plan.md#phase-1-verify-e2e-auto-discovery-no-code-changes) (steps 1a–1c) | Spec FR-001, FR-002

**Rationale**: The main Playwright config (`playwright.config.ts`) sets `testDir: 'tests/e2e'` with no `testMatch` restriction. Playwright's default behavior scans all `*.spec.ts` files recursively under that directory. Any new Phase 2 test files placed in `tests/e2e/` are automatically picked up. The quality-gates workflow simply runs `pnpm test:e2e`, which invokes this config.

**Alternatives considered**:
- Explicit test file listing in Playwright config — rejected because it creates maintenance burden and risks missing new tests.
- Separate CI step for Phase 2 tests — rejected because it adds complexity with no benefit since the glob already covers them.

**Verification**: The WebKit config (`playwright.webkit.config.ts`) uses `testMatch: '**/comparison-page-mobile-webkit.spec.ts'` to scope narrowly. If Phase 2 WebKit tests are needed, they require either adding to this match pattern or creating a new WebKit config. For now, the main Playwright config (Chromium) covers all Phase 2 e2e tests automatically.

### R2: Lighthouse CI multi-URL support

**Decision**: Add English and Arabic URLs to the existing `url` array in `.lighthouserc.json`.

**Used by**: [plan.md Phase 3](plan.md#phase-3-lighthouse-ci-multi-locale-audit-fr-005-fr-006) (steps 3a–3b) | Spec FR-005, FR-006

**Rationale**: Lighthouse CI's `collect.url` field accepts an array of URLs. Each URL is audited independently with its own report. The `assert.assertions` block applies the same thresholds to all collected URLs — no per-URL assertion configuration is needed. Adding `http://localhost:4321/forskoleguiden/en/` and `http://localhost:4321/forskoleguiden/ar/` to the array is the complete solution.

**Alternatives considered**:
- Separate Lighthouse configs per locale — rejected because it triples config maintenance and CI steps.
- Matrix strategy in GitHub Actions — rejected because Lighthouse CI handles multi-URL natively and runs faster in a single process (shared browser instance).

**Verification**: Lighthouse CI docs confirm `url` is an array and assertions apply globally. `numberOfRuns: 1` applies per URL.

### R3: Page weight budget parameterization

**Decision**: Refactor the existing test to use Vitest's `describe.each()` over the three locales (`sv`, `en`, `ar`).

**Used by**: [plan.md Phase 2](plan.md#phase-2-page-weight-budget-parameterization-fr-003-fr-004) (steps 2a–2c) | Spec FR-003, FR-004

**Rationale**: The current test hardcodes `SV_INDEX_PATH` and the `/sv/` describe block. The refactoring strategy:
1. Define a `LOCALES` array (`['sv', 'en', 'ar']`).
2. Use `describe.each(LOCALES)` or `it.each(LOCALES)` to run the existing payload assertion for each locale.
3. Each iteration constructs the locale-specific index path (`dist/{locale}/index.html`).
4. The budget threshold (600 KB) remains the same for all locales.
5. The diagnostic message already includes a breakdown — add locale identification to it.

**Alternatives considered**:
- Separate test files per locale — rejected because it duplicates ~100 lines of identical logic.
- Shared helper + per-locale test files — rejected because `it.each()` achieves the same result with zero new files.

**Verification**: The existing `static-output-verification.test.ts` already uses `it.each(LOCALES)` for locale-parameterized assertions, confirming this pattern is established in the codebase.

## Summary

No NEEDS CLARIFICATION items existed in the Technical Context. All three research questions confirmed the assumptions from the spec:

1. **E2e auto-discovery**: Confirmed — Playwright glob covers new files automatically.
2. **Lighthouse multi-URL**: Confirmed — `url` array with shared assertions is the built-in approach.
3. **Page weight parameterization**: Confirmed — `it.each(LOCALES)` matches existing codebase patterns.

No blocking unknowns. Proceed to Phase 1.
