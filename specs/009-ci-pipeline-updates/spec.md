# Feature Specification: CI Pipeline Updates

**Feature Branch**: `009-ci-pipeline-updates`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "Extend the CI pipeline to cover new Phase 2 pages and features: (9.1) Verify the quality-gates workflow picks up all Phase 2 e2e tests automatically, (9.2) Update the post-build page weight budget test to check all three locale index pages (sv, en, ar), (9.3) Extend the Lighthouse CI config to audit English and Arabic index pages alongside the existing Swedish page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Multi-locale e2e test coverage in CI (Priority: P1)

A contributor pushes a change that breaks the English or Arabic version of the site (e.g., a missing translation key, a broken locale-aware link, or an RTL layout regression). The CI pipeline must catch this breakage automatically — without requiring the contributor to remember to run locale-specific tests manually — before the change merges to main.

**Why this priority**: If CI does not exercise the new Phase 2 e2e tests that cover English and Arabic pages, regressions in those locales ship undetected. Since the quality-gates workflow is the single gate before deployment, gaps here directly affect production quality.

**Independent Test**: Run `pnpm validate` (or trigger the quality-gates workflow). Confirm that all Phase 2 e2e test files (multi-locale routing, language switcher, RTL layout, share flow, accessibility) execute and their results appear in the test output.

**Acceptance Scenarios**:

1. **Given** the CI pipeline runs the quality-gates workflow, **When** Phase 2 e2e test files exist under `tests/e2e/`, **Then** every Phase 2 e2e test file is picked up and executed by the existing Playwright configuration without additional workflow changes.
2. **Given** a Phase 2 e2e test fails (e.g., an Arabic RTL assertion), **When** the quality-gates workflow completes, **Then** the pipeline reports a failure and blocks the deployment.
3. **Given** the WebKit regression suite runs as a separate step, **When** Phase 2 tests include WebKit-specific scenarios, **Then** those tests also execute without additional workflow changes.

---

### User Story 2 — Page weight budget enforcement for all locales (Priority: P2)

The project enforces a page-weight budget via a post-build test. After Phase 2, the site produces directory index pages for three locales (Swedish, English, Arabic). The budget must apply equally to all three locale index pages so that no single locale silently exceeds the performance threshold.

**Why this priority**: A budget that only checks the Swedish index could miss situations where English or Arabic pages are unexpectedly heavier (e.g., larger translation strings, additional RTL CSS). Extending the budget check is straightforward and prevents silent performance regressions across locales.

**Independent Test**: Run `pnpm build && pnpm test:post-build`. Confirm that the page-weight budget test evaluates `dist/sv/index.html`, `dist/en/index.html`, and `dist/ar/index.html` — and all three pass.

**Acceptance Scenarios**:

1. **Given** the site has been built, **When** the post-build page weight test runs, **Then** it checks the total payload (HTML + linked CSS + linked JS + island JS) for the Swedish, English, and Arabic directory index pages independently.
2. **Given** one locale's index page exceeds the budget, **When** the post-build test runs, **Then** only that locale's assertion fails and the diagnostic message identifies which locale breached the budget.
3. **Given** all three locale index pages are under the budget, **When** the post-build test runs, **Then** all assertions pass.

---

### User Story 3 — Lighthouse accessibility and performance auditing for all locales (Priority: P2)

The project runs a Lighthouse CI audit on the Swedish directory page to enforce accessibility (≥ 0.95, error) and performance (≥ 0.9, warn) thresholds. After Phase 2, English and Arabic directory pages must also be audited to ensure they meet the same quality bar — especially the Arabic page, which introduces RTL layout and may surface unique accessibility or performance issues.

**Why this priority**: Lighthouse catches issues that unit tests and e2e assertions miss (e.g., missing ARIA landmarks, poor contrast, slow rendering). Auditing only the Swedish page leaves English and Arabic pages unverified against these standards.

**Independent Test**: Run `pnpm audit:lighthouse`. Confirm the Lighthouse audit collects results for `/sv/`, `/en/`, and `/ar/` index pages and applies the same assertion thresholds to all three.

**Acceptance Scenarios**:

1. **Given** the Lighthouse CI configuration lists all three locale index page URLs, **When** the audit runs, **Then** it collects results for each URL independently.
2. **Given** one locale's index page scores below 0.95 on accessibility, **When** the audit completes, **Then** the audit reports an error for that locale.
3. **Given** all three locale pages meet all thresholds, **When** the audit runs, **Then** the audit passes with no errors or warnings.

---

### Edge Cases

- What happens if Lighthouse's `startServerCommand` produces a build that is missing one locale's output? The audit should fail because the URL returns a 404, which Lighthouse treats as a failing page.
- What happens if a new locale (e.g., Farsi) is added later? The Lighthouse config and page-weight test must be updated to include the new locale URL. The e2e tests will be picked up automatically by the Playwright glob pattern.
- What happens if Arabic pages are significantly heavier due to web fonts or longer translated strings? The same budget applies; the team must optimize or adjust the budget explicitly rather than silently exempting a locale.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The CI quality-gates workflow MUST execute all Playwright e2e test files matching the existing glob pattern (`tests/e2e/**/*.spec.ts`) without requiring any workflow file changes for Phase 2 test additions.
- **FR-002**: The CI quality-gates workflow MUST execute the WebKit regression suite and pick up any Phase 2 WebKit-specific tests automatically.
- **FR-003**: The post-build page weight test MUST evaluate the directory index page for every supported locale (Swedish, English, Arabic) against the same uncompressed byte budget.
- **FR-004**: The post-build page weight test MUST report which specific locale breached the budget when a failure occurs.
- **FR-005**: The Lighthouse CI configuration MUST include the index page URL for every supported locale (Swedish, English, Arabic).
- **FR-006**: The Lighthouse CI audit MUST apply the same assertion thresholds (accessibility ≥ 0.95 error, performance ≥ 0.9 warn) to all audited locale pages.
- **FR-007**: The full validation command (`pnpm validate`) MUST pass with zero errors after all CI pipeline updates are applied.

### Key Entities

- **Quality-gates workflow**: The reusable CI workflow that runs lint, test, build, post-build, e2e, WebKit e2e, and Lighthouse steps sequentially. Consumed by the deploy workflow and Dependabot workflow.
- **Page weight budget test**: A post-build verification test that measures the total uncompressed payload (HTML + linked CSS + linked JS + island JS) of a directory index page and asserts it stays under a defined threshold.
- **Lighthouse CI configuration**: A configuration file that specifies which URLs to audit, how to start the preview server, and what score thresholds to enforce.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All Phase 2 e2e tests execute automatically in CI without any changes to the quality-gates workflow file.
- **SC-002**: The post-build page weight test checks 3 locale index pages (up from 1) and all pass under the defined budget.
- **SC-003**: The Lighthouse audit covers 3 locale index pages (up from 1) with accessibility scores ≥ 0.95 for all three.
- **SC-004**: `pnpm validate` exits with code 0 after all changes, confirming no regressions across lint, format, type check, unit tests, build, post-build, e2e, and Lighthouse.

## Assumptions

- The Playwright configuration's test file glob pattern (`tests/e2e/**/*.spec.ts`) already covers any new test files added under `tests/e2e/` — no config changes needed for FR-001/FR-002.
- The existing page weight budget threshold (600 KB uncompressed) is appropriate for English and Arabic index pages. If Arabic pages are heavier due to RTL CSS or font differences, the budget can be revisited.
- The Lighthouse CI `startServerCommand` (`pnpm build && pnpm preview`) already builds and serves all three locales — no server configuration changes needed.
- Phase 2 Steps 0–8 are complete and all three locale pages exist in `dist/` before these CI updates are applied.
