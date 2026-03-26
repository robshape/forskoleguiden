# Implementation Plan: Accessibility Audit (Phase 2)

**Branch**: `008-accessibility-audit-phase2` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-accessibility-audit-phase2/spec.md`

## Summary

Extend the existing e2e accessibility test suite to achieve full coverage across all Phase 2 features and all three locales. This involves: (1) adding axe-core WCAG 2.0 Level A/AA scans for English directory, detail, and comparison pages — Arabic and Swedish are already covered; (2) adding keyboard navigation tests for the language switcher, share button, and queue registration links; (3) adding DOM attribute assertions for screen reader labeling — ARIA landmarks, `aria-current`, `lang` attributes, live regions, and descriptive link text. About pages (`/om/`) are excluded because the routes do not yet exist (see [research.md decision #2](research.md)).

## Technical Context

**Language/Version**: TypeScript (strict mode via `astro/tsconfigs/strict`)
**Primary Dependencies**: Astro 6.0.4, Preact 10.29.0, @playwright/test 1.58.2, @axe-core/playwright 4.11.1
**Storage**: N/A (static site, sessionStorage for client state)
**Testing**: Playwright e2e (tests/e2e/), Vitest unit (tests/unit/), Vitest post-build (tests/post-build/)
**Target Platform**: Static site (GitHub Pages), browsers: Chromium, Firefox, WebKit
**Project Type**: Static web application (Astro MPA with Preact islands)
**Performance Goals**: Lighthouse accessibility ≥ 0.95, Lighthouse performance ≥ 0.90
**Constraints**: Zero axe-core violations (wcag2a + wcag2aa) on every page/locale combination
**Scale/Scope**: 9 locale-page combinations (3 locales × 3 existing page types; about pages deferred), 3 new interactive element categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Assessment |
|-----------|--------|------------|
| I. Performance by Default | PASS | This feature adds only test files — no production JS, no new islands, no runtime changes. Zero impact on page weight or Lighthouse performance. |
| II. Accessibility First | PASS | This feature directly enforces the accessibility principle by expanding axe-core, keyboard, and screen reader test coverage to all Phase 2 pages. |
| III. Data Integrity | PASS | No data model changes. Tests read existing data via sessionStorage seeding only. |
| IV. Testing Standards | PASS | Follows Kent C. Dodds's testing trophy (fewer, longer e2e tests covering behavior). BDD-style naming. Extends existing test helpers. |
| V. Architecture Discipline | PASS | No new abstractions, no new islands. Test files only, organized alongside existing e2e tests. |
| VI. Internationalization | PASS | Tests validate all three locales have correct `lang`, `dir`, and `aria-label` attributes. No new i18n keys required (this feature tests existing attributes). |
| VII. Privacy by Design | PASS | No analytics, no tracking, no external requests added. Tests use sessionStorage seeding consistent with existing patterns. |

**Gate result**: All principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/008-accessibility-audit-phase2/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
tests/e2e/
├── accessibility-axe-core.spec.ts              # MODIFY: add English locale scans (directory, detail, comparison)
├── keyboard-navigation-focus-ring.spec.ts       # MODIFY: add language switcher, share button, queue link keyboard tests
├── accessibility-phase2-screen-reader.spec.ts   # NEW: ARIA landmark, live region, and labeling assertions
├── fixtures.ts                                  # EXISTING: shared test fixtures (getFocusRingContract)
└── helpers.ts                                   # EXISTING: URL constants, hydration guards (already has EN/AR URLs)
```

**Structure Decision**: All changes live within the existing `tests/e2e/` directory. Two existing test files are extended with new test cases. One new test file is added for screen reader labeling assertions (a distinct behavioral concern not covered by axe-core or keyboard tests). No production source code changes — this feature is purely additive test coverage. See [research.md decision #1](research.md) for the rationale.

---

## Core Implementation

This section defines the implementation sequence. Each step references the specific research decisions, data-model selectors, and spec requirements it satisfies. Steps are ordered by dependency: axe-core scans first (establishes baseline), then keyboard navigation (builds on page familiarity), then screen reader labeling (most granular assertions).

### Step 1: Extend axe-core scans for English locale pages

**File**: `tests/e2e/accessibility-axe-core.spec.ts` (MODIFY)
**Satisfies**: spec FR-001, FR-002, SC-001 · US1 scenarios 1–3

Add three new test cases inside the existing `describe` block, following the established pattern (Swedish and Arabic scans already exist in this file):

1. **English directory page** — Navigate to `DIRECTORY_URL_EN` (from `helpers.ts`). Wait for CompareButton hydration using the pattern in [quickstart.md § Hydration guard pattern](quickstart.md). Run axe-core scan with `withTags(['wcag2a', 'wcag2aa'])`. Assert `results.violations` is empty.
   - Use English locale-specific locators for hydration guards (e.g., button name `/Compare/` not `/Jämför/`) — see [research.md decision #7](research.md).

2. **English detail page** — Navigate to `DETAIL_URL_EN` (from `helpers.ts`). No hydration guard needed (detail page has no `client:only` islands — `DetailsBarChart` is static). Run axe-core scan. Assert zero violations.

3. **English comparison page** — Seed sessionStorage with 2+ preschool IDs using the pattern in [quickstart.md § SessionStorage seeding pattern](quickstart.md) (IDs: `['almgardens-forskola', 'augustenborgs-forskola']`). Navigate to `COMPARISON_URL_EN`. Wait for `[data-testid="comparison-scroll"]` visibility (hydration guard). Run axe-core scan. Assert zero violations.
   - This satisfies FR-002 (comparison page must be seeded with 2+ preschools).

**Verification**: Run `pnpm exec playwright test tests/e2e/accessibility-axe-core.spec.ts`. All existing Swedish/Arabic tests plus three new English tests pass with zero violations.

### Step 2: Add keyboard navigation tests for Phase 2 elements

**File**: `tests/e2e/keyboard-navigation-focus-ring.spec.ts` (MODIFY)
**Satisfies**: spec FR-003, FR-004, FR-014, SC-002, SC-003 · US2 scenarios 1–5

Add a new `describe` block for Phase 2 keyboard navigation. Three sub-tests:

1. **Language switcher keyboard flow** — Navigate to `DIRECTORY_URL` (Swedish). Tab until focus lands on the language toggle (`[data-testid="header-language-toggle"]` — see [data-model.md § Interactive Element table](data-model.md)). Assert a visible focus ring using `getFocusRingContract()` from `fixtures.ts` (see [quickstart.md § Focus ring assertion pattern](quickstart.md)). Press Enter or Space to open the `<details>` disclosure. Tab to the first locale link inside `[data-testid="header-language-options"]`. Assert focus ring is visible. Press Enter. Assert navigation occurred (URL changed to the target locale).
   - **Important**: The language switcher uses a `<details>`/`<summary>` disclosure pattern, NOT flat links. See [research.md decision #3](research.md). The test must open the dropdown before tabbing to locale links.

2. **Share button keyboard flow** — Seed sessionStorage with 2+ IDs. Navigate to comparison page. Tab until focus lands on the share button (`[data-testid="share-comparison-button"]`). Assert focus ring visible. Press Enter or Space. Assert the share feedback appears (confirmation message visible). Assert focus has NOT moved to the confirmation message (FR-014) — verify `document.activeElement` is still the share button or the next tabbable element, not the feedback element.
   - See [research.md decision #5](research.md) for auto-dismiss timing (2500ms). The test should assert the feedback is visible immediately after pressing Enter, not wait for dismiss.

3. **Queue link keyboard flow** — Navigate to a detail page for an independent preschool (one with a `queueUrl` in the index data). Tab until focus lands on the queue registration link (`a[target="_blank"]` in the detail content area — see [data-model.md § Interactive Element table](data-model.md)). Assert focus ring visible. Assert the link is operable (has `href`, `target="_blank"`, `rel="noopener noreferrer"`).

**Verification**: Run `pnpm exec playwright test tests/e2e/keyboard-navigation-focus-ring.spec.ts`. All existing Phase 1 tests plus three new Phase 2 tests pass.

### Step 3: Create screen reader labeling assertion tests

**File**: `tests/e2e/accessibility-phase2-screen-reader.spec.ts` (CREATE)
**Satisfies**: spec FR-005–FR-013, SC-004, SC-005 · US3 scenarios 1–7

Create a new test file with three `describe` blocks, one per element category. All tests assert DOM attributes — they do NOT require an actual screen reader.

1. **Language switcher labeling** (US3 scenarios 1–2, FR-005–FR-007, SC-005)
   - Navigate to each locale's directory page (`DIRECTORY_URL`, `DIRECTORY_URL_EN`, `DIRECTORY_URL_AR`).
   - Assert the language switcher is inside a `<nav>` with a non-empty `aria-label` (FR-005). See [data-model.md § Interactive Element table](data-model.md) for the selector.
   - Assert the active locale element has `aria-current="page"` (FR-006).
   - Assert each locale link/button inside `[data-testid="header-language-options"]` has a `lang` attribute matching its target locale (FR-007). E.g., the English link has `lang="en"`, the Arabic link has `lang="ar"`.

2. **Share feedback live regions** (US3 scenarios 3–6, FR-008–FR-011, FR-013, SC-004)
   - **Share button label** (FR-008): Seed 2+ preschools. Navigate to comparison page. Assert the share button has accessible text (visible text or `aria-label`).
   - **Copied confirmation** (FR-009, FR-013): Click the share button. Assert `[data-testid="share-feedback-copied"]` appears with `role="status"` (or ancestor has `aria-live="polite"`). Assert it remains visible for at least 2 seconds (FR-013, [research.md decision #5](research.md): actual timeout is 2500ms).
   - **Warning message** (FR-010): Navigate to comparison page with a share URL containing mixed valid/invalid IDs. Assert `[data-testid="share-feedback-warning"]` appears with `role="status"` (or `aria-live="polite"`).
   - **Error message** (FR-011): Navigate to `?s=INVALID_GARBAGE`. Assert `[data-testid="share-feedback-error"]` appears with `role="alert"`.

3. **Queue link labeling** (US3 scenario 7, FR-012)
   - Navigate to a detail page for an independent preschool.
   - Assert the queue link has descriptive text (not "Click here" or empty). Assert `target="_blank"` is present. Verify the link indicates it opens in a new window (either via visible text, `aria-label`, or an adjacent screen-reader-only span).

**Verification**: Run `pnpm exec playwright test tests/e2e/accessibility-phase2-screen-reader.spec.ts`. All assertions pass.

---

## Refinement

After the core implementation, handle these edge cases and validation steps:

### R1: RTL false positive review

After Step 1, if any axe-core violations are reported on Arabic pages that appear to be false positives related to RTL text direction heuristics, review each violation individually. Document justified exclusions in a code comment with the axe rule ID and rationale — do NOT suppress entire rule categories. See spec Edge Cases §1.

### R2: Verify no LTR regression

After all three steps, run the full existing e2e suite (`pnpm test:e2e`). Confirm all Phase 1 tests still pass. Specifically verify `user-flow-phase1.spec.ts` passes on `/sv/` — this catches any accidental breakage from new test helpers or shared state. This is a safety gate, not a new test.

### R3: CI integration verification

Run `pnpm validate` to confirm the new test file is picked up by the existing Playwright config and passes in the full quality gate pipeline. No `playwright.config.ts` changes should be needed — the `testDir: 'tests/e2e'` glob already includes new files. This satisfies SC-006.

### R4: About page coverage tracking

When about page routes (`/sv/om/`, `/en/om/`, `/ar/om/`) are implemented in a future feature, add axe-core scans and labeling assertions for them. The 9-combination matrix will then expand to 12. No action needed now — this is a reminder for the implementer of the about page feature.

---

## Traceability Matrix

| Spec Requirement | Implementation Step | Test File | Research Reference |
|-----------------|--------------------|-----------|-----------------------|
| FR-001 (axe-core all locales) | Step 1 | `accessibility-axe-core.spec.ts` | Decision #2 (about exclusion), #6 (hydration) |
| FR-002 (seed comparison) | Step 1.3 | `accessibility-axe-core.spec.ts` | — |
| FR-003 (keyboard reachable) | Step 2 | `keyboard-navigation-focus-ring.spec.ts` | Decision #3 (details pattern) |
| FR-004 (focus indicator) | Step 2 | `keyboard-navigation-focus-ring.spec.ts` | — |
| FR-005 (switcher landmark) | Step 3.1 | `accessibility-phase2-screen-reader.spec.ts` | — |
| FR-006 (aria-current) | Step 3.1 | `accessibility-phase2-screen-reader.spec.ts` | — |
| FR-007 (lang attribute) | Step 3.1 | `accessibility-phase2-screen-reader.spec.ts` | — |
| FR-008 (share button label) | Step 3.2 | `accessibility-phase2-screen-reader.spec.ts` | — |
| FR-009 (copied live region) | Step 3.2 | `accessibility-phase2-screen-reader.spec.ts` | Decision #5 (auto-dismiss) |
| FR-010 (warning live region) | Step 3.2 | `accessibility-phase2-screen-reader.spec.ts` | — |
| FR-011 (error alert) | Step 3.2 | `accessibility-phase2-screen-reader.spec.ts` | — |
| FR-012 (queue link text) | Step 3.3 | `accessibility-phase2-screen-reader.spec.ts` | Decision #4 (new window) |
| FR-013 (auto-dismiss ≥2s) | Step 3.2 | `accessibility-phase2-screen-reader.spec.ts` | Decision #5 (2500ms) |
| FR-014 (no focus trap) | Step 2.2 | `keyboard-navigation-focus-ring.spec.ts` | — |
| SC-001 (zero violations ×9) | Step 1 + R1 | `accessibility-axe-core.spec.ts` | Decision #2 (9 not 12) |
| SC-002 (keyboard 100%) | Step 2 | `keyboard-navigation-focus-ring.spec.ts` | Decision #3 |
| SC-003 (focus ring) | Step 2 | `keyboard-navigation-focus-ring.spec.ts` | — |
| SC-004 (live regions) | Step 3.2 | `accessibility-phase2-screen-reader.spec.ts` | Decision #5 |
| SC-005 (switcher attrs) | Step 3.1 | `accessibility-phase2-screen-reader.spec.ts` | — |
| SC-006 (CI passes) | R3 | — | — |
