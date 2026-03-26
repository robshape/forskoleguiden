# Quickstart: CI Pipeline Updates

**Feature**: 009-ci-pipeline-updates
**Date**: 2026-03-26

## Prerequisites

- Phase 2 Steps 0–8 complete (all three locale pages build and pass existing tests)
- Node.js 22.14.0, pnpm installed
- Repository checked out on `009-ci-pipeline-updates` branch

## Changes Overview

Two files are modified. No new files are created. One phase is verification-only.
For the full phased implementation sequence, see [plan.md → Implementation Phases](plan.md#implementation-phases).

### 1. Verify e2e auto-discovery — no changes ([Plan Phase 1](plan.md#phase-1-verify-e2e-auto-discovery-no-code-changes))

Confirm (do not modify) that the existing configs auto-discover Phase 2 tests:

- `playwright.config.ts` — `testDir: 'tests/e2e'` with no `testMatch` (all `*.spec.ts` auto-discovered)
- `playwright.webkit.config.ts` — narrowly scoped to `comparison-page-mobile-webkit.spec.ts`
- `.github/workflows/quality-gates.yml` — runs `pnpm test:e2e` and `pnpm test:e2e:webkit`

See [research.md R1](research.md#r1-do-phase-2-e2e-tests-auto-discover-in-ci) for rationale. Satisfies spec FR-001, FR-002.

### 2. `.lighthouserc.json` — Add locale URLs ([Plan Phase 3](plan.md#phase-3-lighthouse-ci-multi-locale-audit-fr-005-fr-006))

Add English and Arabic index page URLs to the `collect.url` array:

```json
"url": [
  "http://localhost:4321/forskoleguiden/sv/",
  "http://localhost:4321/forskoleguiden/en/",
  "http://localhost:4321/forskoleguiden/ar/"
]
```

The existing `assert.assertions` block applies the same thresholds (accessibility ≥ 0.95, performance ≥ 0.9) to all URLs — no assertion changes needed. See [research.md R2](research.md#r2-lighthouse-ci-multi-url-support) for multi-URL support confirmation. Satisfies spec FR-005, FR-006.

### 3. `tests/post-build/page-weight-budget.test.ts` — Parameterize by locale ([Plan Phase 2](plan.md#phase-2-page-weight-budget-parameterization-fr-003-fr-004))

Replace the hardcoded `/sv/` path with a locale-parameterized loop:

- Define `const LOCALES = ['sv', 'en', 'ar'] as const`
- Use `describe.each(LOCALES)` to run the page weight assertion for each locale
- Construct `INDEX_PATH` dynamically: `join(DIST_ROOT, locale, 'index.html')`
- Include the locale identifier in diagnostic messages

Helper functions (`resolveDistAsset`, `extractLinkedAssetBytes`, `collectIslandAssetPaths`, etc.) remain unchanged — they operate on HTML content and the shared `_astro/` directory.

See [research.md R3](research.md#r3-page-weight-budget-parameterization) for refactoring strategy and codebase precedent. Satisfies spec FR-003, FR-004.

## Verification ([Plan Phase 4](plan.md#phase-4-full-validation-fr-007))

```bash
# Build the site (all 3 locales)
pnpm build

# Run post-build tests (page weight + static output)
pnpm test:post-build

# Run Lighthouse audit (all 3 locale URLs)
pnpm audit:lighthouse

# Run full validation pipeline
pnpm validate
```

All commands must exit with code 0. Satisfies spec FR-007, SC-004.

## Contracts

No external interfaces are added or modified. This feature is entirely internal CI infrastructure — no contracts directory is needed.
