# Implementation Plan: Phase 2 Final Verification

**Branch**: `010-final-verification` | **Date**: 2026-03-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-final-verification/spec.md`

## Summary

Verify the complete Phase 2 implementation through three complementary validation layers: (1) a post-build static output check confirming all three locale directories exist with correct page counts and content attributes, (2) a comprehensive end-to-end test exercising the full Phase 2 user flow — language switching, preschool selection, queue links, comparison, share/restore, and RTL layout — as a single integrated journey, and (3) a full `pnpm validate` pipeline pass confirming zero regressions across all quality gates.

This is a **testing-only** feature — no new application logic, no data model changes, no new components. All deliverables are test files and the verification that existing tests pass.

## Technical Context

**Language/Version**: TypeScript (strict), Astro 5.x
**Primary Dependencies**: Vitest (unit/post-build), Playwright + @axe-core/playwright (e2e), lz-string (share encoding in test helpers)
**Storage**: N/A (static site, no runtime storage)
**Testing**: Vitest (node environment) for post-build; Playwright (Chromium) for e2e
**Target Platform**: Static site served via `pnpm preview` (localhost:4321)
**Project Type**: Static web application (Astro)
**Performance Goals**: Lighthouse performance ≥ 0.90, accessibility ≥ 0.95 per locale
**Constraints**: Page weight ≤ 600 KB uncompressed per page; total dist ≤ 21 MB (excl. images); share URLs ≤ ~2,000 chars
**Scale/Scope**: 3 locales × ~14 pages each = ~43 HTML files minimum; 1 new e2e test file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Performance by Default | **Pass** | No new JS, no new islands. Test-only changes. Existing page-weight budget (600 KB) and Lighthouse perf (≥ 0.90) assertions cover this. |
| II. Accessibility First | **Pass** | Existing Lighthouse a11y (≥ 0.95) and axe-core e2e tests already scan all three locales. The new e2e test verifies RTL layout and screen-reader attributes as part of the journey. |
| III. Data Integrity | **Pass** | No data model changes. The e2e test uses real preschool data from the Malmö data set. |
| IV. Testing Standards | **Pass** | New test follows BDD naming, tests behavior not implementation, uses shared helpers from `tests/e2e/helpers.ts`. Single longer test covering the complete Phase 2 journey (Kent C. Dodds "fewer, longer tests"). |
| V. Architecture Discipline | **Pass** | No new components, no new abstractions. Test file lives in `tests/e2e/` following existing conventions. |
| VI. Internationalization | **Pass** | The e2e test exercises all three locales, verifying i18n key usage, language switching, and RTL directionality. |
| VII. Privacy by Design | **Pass** | No external requests, no tracking. Share URL encoding uses client-side-only lz-string compression. |

**Gate result**: All principles pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/010-final-verification/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
tests/
├── e2e/
│   ├── helpers.ts                          # Existing — shared URL constants, locators, hydration guards, encodeSharePayload()
│   ├── user-flow-phase1.spec.ts            # Existing — Phase 1 user journey (unchanged, must still pass)
│   └── user-flow-phase2.spec.ts            # NEW — comprehensive Phase 2 user journey
└── post-build/
    ├── page-weight-budget.test.ts          # Existing — per-locale page weight assertions (already covers 3 locales)
    └── static-output-verification.test.ts  # Existing — multi-locale page counts and content (already covers 3 locales)
```

**Structure Decision**: This feature adds exactly one new file (`tests/e2e/user-flow-phase2.spec.ts`). All post-build assertions are already covered by existing tests from earlier Phase 2 steps. The `pnpm validate` pipeline already chains all quality checks — no pipeline changes needed.

## Core Implementation

### Task 1: Write `tests/e2e/user-flow-phase2.spec.ts`

> **Covers**: [spec.md — User Story 2](spec.md) (all 12 acceptance scenarios), FR-005 through FR-007
> **Research**: [R1](research.md#r1-e2e-test-structure--single-long-test-vs-multiple-short-tests) (single long test), [R2](research.md#r2-share-url-round-trip-testing-strategy) (share strategy), [R4](research.md#r4-rtl-layout-verification-in-e2e) (RTL verification), [R5](research.md#r5-clipboard-fallback-strategy-in-ci) (clipboard fallback)
> **Pattern**: Follow `tests/e2e/user-flow-phase1.spec.ts` — single `test()` block, sequential numbered steps with `// ── Step N:` comments, hydration guards before interactions

**File structure**:
- Import from `./fixtures` (custom `expect`, `test`) and `./helpers` (URL constants, locators, share helpers)
- Define preschool name constants at module level (use real names from the data set)
- One preschool must be independent (has `queueUrl`) for [step 5](#step-5-queue-link-on-independent-preschool-detail-page)
- Single `test('full Phase 2 user journey: …', async ({ page, browser }) => { … })` block
- `browser` fixture is needed for [step 9](#step-9-share-url-restoration-in-new-context) (new context)

**Step-by-step breakdown** (maps 1:1 to spec US2 acceptance scenarios):

#### Step 1: Language switcher visible on Swedish directory
Load `DIRECTORY_URL` (`/forskoleguiden/sv/`). Assert the language switcher `<nav>` is visible. Assert "Svenska" has `aria-current="page"`. Assert links to `/en/` and `/ar/` exist.
- **Locators**: `page.locator('nav[aria-label]')` for the language nav, `getByRole('link', { name: 'English' })`, `getByRole('link', { name: 'العربية' })`
- **Spec**: US2 scenario 1

#### Step 2: Switch to English
Click the English language switcher link. Assert navigation to `DIRECTORY_URL_EN` (`/forskoleguiden/en/`). Assert the page heading uses the English translation (e.g., "Preschools in Malmö").
- **Helpers**: `DIRECTORY_URL_EN` from `tests/e2e/helpers.ts`
- **Spec**: US2 scenario 2

#### Step 3: Add 3 preschools to compare on English directory
Wait for compare button hydration using `waitForCompareButtonReady()`. Click 3 compare buttons. Assert each button shows `aria-pressed="true"`. Assert the compare tray shows "3" with English text.
- **Helpers**: `waitForCompareButtonReady()`, `getCompareButton()`, `waitForCompareButtonSelected()` from `tests/e2e/helpers.ts`
- **Spec**: US2 scenario 3

#### Step 4: View preschool detail page in English
Click a preschool card link. Assert URL matches the English detail path (`/forskoleguiden/en/forskola/…/`). Assert `<html lang="en">`. Assert the preschool name heading is visible.
- **Helpers**: `getDirectoryCard()` from `tests/e2e/helpers.ts`
- **Spec**: US2 scenario 4

#### Step 5: Queue link on independent preschool detail page
Navigate to an independent preschool's detail page (one with `queueUrl` in the data). Assert a queue registration link is visible. Assert it has `target="_blank"` and `rel="noopener noreferrer"`. Assert the `href` starts with `https://`.
- **Data dependency**: Use the preschool referenced by `QUEUE_DETAIL_URL` from `tests/e2e/helpers.ts`, but navigate to its English equivalent (`/forskoleguiden/en/forskola/bellevuegardens-montessoriforskola/`)
- **Spec**: US2 scenario 5

#### Step 6: Compare state persists after returning to directory
Navigate back to `DIRECTORY_URL_EN`. Assert the compare tray is visible with "3" selected. Assert compare buttons for all 3 preschools show `aria-pressed="true"`.
- **Helpers**: `waitForCompareButtonSelected()` from `tests/e2e/helpers.ts`
- **Spec**: US2 scenario 6

#### Step 7: Comparison view shows 3 preschools in English
Navigate to `COMPARISON_URL_EN` (`/forskoleguiden/en/jamfor/`). Wait for `comparison-scroll` test ID to be visible (ComparisonView hydration). Assert all 3 preschool names appear as links.
- **Helpers**: `COMPARISON_URL_EN` from `tests/e2e/helpers.ts`
- **Spec**: US2 scenario 7

#### Step 8: Share button shows confirmation
Click the Share button. Assert a confirmation/status message appears (e.g., text matching "copied" or the locale equivalent). Do NOT assert clipboard contents — see [R5](research.md#r5-clipboard-fallback-strategy-in-ci).
- **Locator**: `page.getByRole('button', { name: /share|dela|مشاركة/i })` or test ID
- **Spec**: US2 scenario 8

#### Step 9: Share URL restoration in new context
Construct a share URL programmatically using `encodeSharePayload([id1, id2, id3])` with the 3 selected preschool IDs. Create a new browser context via `browser.newContext()`. Navigate to `COMPARISON_URL_EN + '?s=' + encoded`. Assert the comparison view shows all 3 preschools. Close the new context.
- **Helpers**: `encodeSharePayload()` from `tests/e2e/helpers.ts`
- **Research**: [R2](research.md#r2-share-url-round-trip-testing-strategy) — uses programmatic encoding, not clipboard, for CI reliability
- **Spec**: US2 scenario 9, FR-007

#### Step 10: Switch to Arabic on comparison page
Back in the original page context, click the Arabic language switcher link on the comparison page. Assert navigation to `COMPARISON_URL_AR` (`/forskoleguiden/ar/jamfor/`). Assert `<html dir="rtl">` and `<html lang="ar">`.
- **Helpers**: `COMPARISON_URL_AR` from `tests/e2e/helpers.ts`
- **Research**: [R4](research.md#r4-rtl-layout-verification-in-e2e) — check `dir` attribute and Arabic text presence, not pixel layout
- **Spec**: US2 scenario 10

#### Step 11: Arabic text and RTL layout verification
Assert the comparison view contains Arabic Unicode characters (regex `/[\u0600-\u06FF]/`). Assert the document direction is RTL.
- **Spec**: US2 scenario 11

#### Step 12: Arabic directory with persisted state
Navigate to `DIRECTORY_URL_AR` (`/forskoleguiden/ar/`). Assert the page has `dir="rtl"`. Assert the compare tray is visible. Assert the tray contains "3".
- **Helpers**: `DIRECTORY_URL_AR` from `tests/e2e/helpers.ts`
- **Spec**: US2 scenario 12, FR-006

---

### Task 2: Confirm existing post-build tests cover User Story 1

> **Covers**: [spec.md — User Story 1](spec.md) (all 5 acceptance scenarios), FR-001 through FR-004
> **Research**: [R3](research.md#r3-post-build-verification-scope--new-tests-vs-existing-coverage) (no new post-build tests needed)

No new code is written in this task. This is a verification that existing tests already cover the spec requirements:

| US1 Scenario | Existing Test | File | Assertion |
|--------------|---------------|------|-----------|
| 1 — Locale directories with complete pages | `static-output-verification.test.ts` | `tests/post-build/static-output-verification.test.ts` | Asserts `sv/`, `en/`, `ar/` directories exist with directory, comparison, about, and detail pages |
| 2 — HTML file count ≈ 3× Phase 1 | `static-output-verification.test.ts` | `tests/post-build/static-output-verification.test.ts` | `MIN_HTML_FILE_COUNT = 40` (3 locales × ~14 pages) |
| 3 — English `lang` attribute, no RTL | `static-output-verification.test.ts` | `tests/post-build/static-output-verification.test.ts` | Checked per locale directory |
| 4 — Arabic `lang`, `dir="rtl"`, Arabic script | `static-output-verification.test.ts` | `tests/post-build/static-output-verification.test.ts` | Arabic content contains Arabic script characters (no raw dot-path key fallbacks) |
| 5 — Output size budget | `static-output-verification.test.ts` | `tests/post-build/static-output-verification.test.ts` | Total dist ≤ 21 MB (excl. images) |

**Action**: Read through `tests/post-build/static-output-verification.test.ts` and `tests/post-build/page-weight-budget.test.ts` to confirm coverage. If any gap is found, add the missing assertion. Based on [R3](research.md#r3-post-build-verification-scope--new-tests-vs-existing-coverage), no gaps are expected.

---

### Task 3: Run `pnpm validate` — full pipeline pass

> **Covers**: [spec.md — User Story 3](spec.md) (all 9 acceptance scenarios), FR-008 through FR-010
> **Quickstart**: See [quickstart.md](quickstart.md) for the exact command and expected output

Run the full quality gate pipeline. Each pipeline step maps to a spec acceptance scenario:

| Pipeline Step | Command | US3 Scenario | Pass Criteria |
|---------------|---------|--------------|---------------|
| Lint | `pnpm lint` | US3-1 | Zero ESLint errors (max-warnings 0) |
| Markdown lint | `pnpm lint:md` | US3-1 (extended) | Zero markdownlint errors |
| Format | `pnpm format` | US3-2 | Zero Prettier issues |
| Type check | `pnpm check` | US3-3 | Zero Astro/TypeScript errors |
| Unit tests | `pnpm test` | US3-4 | All pass, including Phase 2 tests (share encoding, locale utils, queue link contracts) |
| Build | `pnpm build` | (prerequisite) | Static output generated in `dist/` |
| Post-build | `pnpm test:post-build` | US3-5 | All assertions pass for sv, en, ar (page counts, weight, content) |
| E2e (Chromium) | `pnpm test:e2e` | US3-6 | All pass, including new `user-flow-phase2.spec.ts` and existing Phase 1 tests |
| E2e (WebKit) | `pnpm test:e2e:webkit` | US3-6 (extended) | WebKit mobile regression pass |
| Lighthouse | `pnpm audit:lighthouse` | US3-7, US3-8 | Accessibility ≥ 0.95, performance ≥ 0.9 for `/sv/`, `/en/`, `/ar/` |

**Pipeline command**: `pnpm validate` (runs all steps sequentially, exits non-zero on first failure)

**Success criteria**: Exit code 0. Maps to SC-003, SC-004, SC-005.

## Refinement: Edge Case Coverage

The [spec edge cases](spec.md) are covered by the following test infrastructure. No additional edge case tests are needed beyond the Phase 2 user flow test:

| Spec Edge Case | How It's Covered | Test Layer |
|----------------|-----------------|------------|
| Zero-byte HTML files for a locale | `static-output-verification.test.ts` reads and checks file content — an empty file would fail content assertions | Post-build |
| Feature works in one locale but fails in another | `user-flow-phase2.spec.ts` exercises features across sv → en → ar in a single journey | E2e |
| New preschool added but detail page missing for a locale | `static-output-verification.test.ts` iterates all non-placeholder preschool IDs and asserts detail pages exist for every locale | Post-build |
| Share URL uses test-only preschool IDs | `user-flow-phase2.spec.ts` step 9 uses real IDs from the live data set via `encodeSharePayload()` | E2e |
| Lighthouse scores degrade from 3× locale pages | `.lighthouserc.json` scans all 3 locale index pages; performance is warn-level (≥ 0.9), accessibility is error-level (≥ 0.95) | Lighthouse CI |
| Phase 2 e2e passes but Phase 1 regresses | `pnpm validate` runs all e2e tests together — `user-flow-phase1.spec.ts` must still pass | Pipeline |

## Implementation Sequence

```
1. Write user-flow-phase2.spec.ts          [Task 1 — the only new code]
   └── 12 sequential steps matching spec US2 scenarios
   └── Uses existing helpers, no new dependencies

2. Audit post-build test coverage          [Task 2 — read-only verification]
   └── Confirm static-output-verification.test.ts covers spec US1
   └── If gap found, add missing assertion

3. Run pnpm validate                       [Task 3 — execution, no code changes]
   └── All 10 pipeline steps must pass
   └── Exit code 0 = Phase 2 ships
```

Tasks 1 and 2 can be done in parallel. Task 3 depends on Task 1 (the new test must exist before the pipeline can run it).
