# Implementation Plan: CI Pipeline Updates

**Branch**: `009-ci-pipeline-updates` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-ci-pipeline-updates/spec.md`

## Summary

Extend the CI quality pipeline to cover all Phase 2 locales (Swedish, English, Arabic). Three changes: (1) verify Playwright e2e tests auto-discover Phase 2 test files (no workflow changes needed), (2) extend the post-build page-weight budget test to check all three locale directory index pages, (3) add English and Arabic URLs to the Lighthouse CI configuration.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22.14.0
**Primary Dependencies**: Vitest (post-build tests), Playwright (e2e), Lighthouse CI (`@lhci/cli`), GitHub Actions
**Storage**: N/A (static site — config files and test files only)
**Testing**: Vitest for post-build assertions, Playwright for e2e, Lighthouse CI for accessibility/performance scoring
**Target Platform**: GitHub Actions CI (ubuntu-latest); local dev on macOS
**Project Type**: Static web application (Astro) — this feature touches CI config and test infrastructure only
**Performance Goals**: Lighthouse accessibility ≥ 0.95 (error), performance ≥ 0.90 (warn) for all locale index pages
**Constraints**: Page weight budget ≤ 600 KB uncompressed per locale index page; `pnpm validate` must exit 0
**Scale/Scope**: 3 locales × 4 page types = 12 total routes; ~261 preschools per locale

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Performance by Default | **Pass** | Extends page-weight budget to all locales; extends Lighthouse perf audit to en/ar. No new JS added. |
| II. Accessibility First | **Pass** | Extends Lighthouse a11y ≥ 0.95 enforcement to en/ar pages. Existing axe-core e2e tests already cover new locales via Playwright glob. |
| III. Data Integrity | **Pass** | No data model changes. Static output verification already validates all 3 locales. |
| IV. Testing Standards | **Pass** | Extends existing test coverage. No new test layers. Follows BDD naming. |
| V. Architecture Discipline | **Pass** | Config-only changes. No new components, islands, or abstractions. |
| VI. Internationalization | **Pass** | Ensures all 3 locales are CI-audited equally. No i18n code changes. |
| VII. Privacy by Design | **Pass** | No external services, tracking, or runtime dependencies added. |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/009-ci-pipeline-updates/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Files modified by this feature (no new files created):
.lighthouserc.json                              # Add /en/ and /ar/ URLs
tests/post-build/page-weight-budget.test.ts     # Parameterize across 3 locales

# Files verified but NOT modified:
.github/workflows/quality-gates.yml             # Already picks up new e2e tests via glob
playwright.config.ts                            # testDir: 'tests/e2e' (glob covers new files)
playwright.webkit.config.ts                     # testMatch scoped to specific file (unchanged)
tests/post-build/static-output-verification.test.ts  # Already validates all 3 locales
```

**Structure Decision**: No new files or directories. Two existing files are modified: `.lighthouserc.json` (add URLs) and `tests/post-build/page-weight-budget.test.ts` (parameterize locale loop). The quality-gates workflow and Playwright configs require no changes because their glob patterns already cover new test files.

## Implementation Phases

Phases are sequential. Phase 1 is a verification-only step (no code changes). Phases 2 and 3 are independent of each other and can be done in either order. Phase 4 ties everything together.

```text
Phase 1 (Verify e2e auto-discovery — FR-001, FR-002)
  └─► Phase 2 (Page weight budget — FR-003, FR-004)  ──┐
  └─► Phase 3 (Lighthouse config — FR-005, FR-006)   ──┤
                                                        └─► Phase 4 (Full validation — FR-007)
```

### Phase 1: Verify e2e auto-discovery (no code changes)

Confirm the existing Playwright config and quality-gates workflow already pick up Phase 2 e2e tests. This phase produces no file changes — it validates an assumption.

| Step | File | What | References |
|------|------|------|------------|
| 1a | `playwright.config.ts` | Verify `testDir: 'tests/e2e'` with no `testMatch` restriction — confirms all `*.spec.ts` files under `tests/e2e/` are auto-discovered | [research.md R1](research.md#r1-do-phase-2-e2e-tests-auto-discover-in-ci); spec FR-001 |
| 1b | `playwright.webkit.config.ts` | Verify `testMatch` pattern — note that WebKit scope is narrow (`comparison-page-mobile-webkit.spec.ts` only). If Phase 2 adds WebKit-specific tests, this config may need updating separately | [research.md R1 verification note](research.md#r1-do-phase-2-e2e-tests-auto-discover-in-ci); spec FR-002 |
| 1c | `.github/workflows/quality-gates.yml` | Verify workflow runs `pnpm test:e2e` and `pnpm test:e2e:webkit` — confirm no test-file lists are hardcoded | spec FR-001, FR-002 |

**Exit criteria**: Implementer confirms all three files use glob/directory patterns that auto-discover new test files. No code changes in this phase.

### Phase 2: Page weight budget parameterization (FR-003, FR-004)

Refactor the existing page weight budget test from a single-locale hardcoded test to a locale-parameterized test using `describe.each()`.

| Step | File | What | References |
|------|------|------|------------|
| 2a | `tests/post-build/page-weight-budget.test.ts` | Add `const LOCALES = ['sv', 'en', 'ar'] as const` at the top of the config section. Remove the hardcoded `SV_INDEX_PATH` constant | [research.md R3](research.md#r3-page-weight-budget-parameterization) (refactoring strategy); [data-model.md → Page Weight Budget Test](data-model.md#page-weight-budget-test-testspost-buildpage-weight-budgettestts) |
| 2b | `tests/post-build/page-weight-budget.test.ts` | Replace the `describe('/sv/ page-weight budget', ...)` block with `describe.each(LOCALES)('/%s/ page-weight budget', (locale) => { ... })`. Inside, construct `INDEX_PATH` dynamically: `join(DIST_ROOT, locale, 'index.html')`. The existing `ASTRO_ASSETS_DIR` is shared across locales (Astro emits all assets to `dist/_astro/`) | [research.md R3](research.md#r3-page-weight-budget-parameterization) (pattern precedent in `static-output-verification.test.ts`); spec FR-003 |
| 2c | `tests/post-build/page-weight-budget.test.ts` | Update diagnostic messages in `expect()` assertions to include the locale identifier — e.g., `"/${locale}/ page payload is ${kb} KB"` — so a failure clearly identifies which locale breached the budget | spec FR-004 |
| 2d | — | Run `pnpm build && pnpm test:post-build` — all 3 locale assertions pass | spec SC-002 |

**Key detail**: The helper functions (`resolveDistAsset`, `extractLinkedAssetBytes`, `collectIslandAssetPaths`, `extractIslandAssetBytes`, `extractInlineScriptBytes`) remain unchanged — they operate on HTML content and the shared `_astro/` directory. Only the test describe block and index path construction change.

### Phase 3: Lighthouse CI multi-locale audit (FR-005, FR-006)

Add English and Arabic URLs to the Lighthouse CI configuration.

| Step | File | What | References |
|------|------|------|------------|
| 3a | `.lighthouserc.json` | Add `"http://localhost:4321/forskoleguiden/en/"` and `"http://localhost:4321/forskoleguiden/ar/"` to the `ci.collect.url` array | [research.md R2](research.md#r2-lighthouse-ci-multi-url-support) (multi-URL support confirmation); [data-model.md → Lighthouse CI Configuration](data-model.md#lighthouse-ci-configuration-lighthousercjson); [quickstart.md §1](quickstart.md#1-lighthousercjson--add-locale-urls) (exact JSON) |
| 3b | `.lighthouserc.json` | Verify `ci.assert.assertions` block — confirm thresholds apply to all URLs equally (no per-URL overrides needed). No changes to this section | [research.md R2](research.md#r2-lighthouse-ci-multi-url-support); spec FR-006 |
| 3c | — | Run `pnpm audit:lighthouse` — all 3 locale pages are audited and pass a11y ≥ 0.95, perf ≥ 0.9 | spec SC-003 |

**Key detail**: Lighthouse CI's `startServerCommand` is `pnpm build && pnpm preview` — it already builds and serves all 3 locales. The `numberOfRuns: 1` setting applies per URL, so the audit runs 3 times total (once per locale). The `assert` block's assertion thresholds apply globally across all collected URLs.

### Phase 4: Full validation (FR-007)

| Step | File | What | References |
|------|------|------|------------|
| 4a | — | Run `pnpm validate` — full quality gate: lint, format, check, test, build, post-build, e2e, Lighthouse. All steps must pass with zero errors | spec FR-007, SC-004; [quickstart.md → Verification](quickstart.md#verification) |

**Exit criteria**: `pnpm validate` exits with code 0. All Phase 2 e2e tests appear in the Playwright output. Post-build tests show 3 locale assertions passing. Lighthouse results show 3 URLs audited.

## Requirements Traceability

| FR | Implementation | Phase | Design Reference |
|----|----------------|-------|------------------|
| FR-001 | Verified — `playwright.config.ts` `testDir: 'tests/e2e'` auto-discovers all `*.spec.ts` files | 1 | research.md R1 |
| FR-002 | Verified — `playwright.webkit.config.ts` scoped to specific file; main config covers rest | 1 | research.md R1 |
| FR-003 | `page-weight-budget.test.ts` — `describe.each(LOCALES)` runs budget check for sv, en, ar | 2 | research.md R3; data-model.md → LOCALES |
| FR-004 | `page-weight-budget.test.ts` — locale identifier in diagnostic `expect()` messages | 2 | spec acceptance scenario 2.2 |
| FR-005 | `.lighthouserc.json` — 3 URLs in `ci.collect.url` array | 3 | research.md R2; quickstart.md §1 |
| FR-006 | `.lighthouserc.json` — `ci.assert.assertions` applies globally (no change needed) | 3 | research.md R2 |
| FR-007 | `pnpm validate` full pipeline pass | 4 | — |
