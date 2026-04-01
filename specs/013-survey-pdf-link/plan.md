# Implementation Plan: Survey PDF Link on Detail Pages

**Branch**: `013-survey-pdf-link` | **Date**: 2026-03-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/013-survey-pdf-link/spec.md`

## Summary

Add a link to the original survey results PDF (hosted on `forskoleenkatresultat.malmo.se`) for each preschool on its detail page. The PDF URL is stored as an optional field (`surveyPdfUrl`) in each preschool's per-year survey JSON file. The link renders as a styled anchor with an icon and localized label text, placed after the existing compare button and queue link in the action area. When the URL is absent, the link is gracefully omitted. Fully static — no runtime fetching or URL validation.

## Technical Context

**Language/Version**: TypeScript (strict), Astro 5.x
**Primary Dependencies**: Astro, Preact, Tailwind CSS v4 (`@tailwindcss/vite`), nanostores
**Storage**: Static JSON files in `data/malmo/2025/` (build-time only, `readFileSync`)
**Testing**: Vitest (unit), Playwright + axe-core (e2e), post-build page-weight tests
**Target Platform**: Static site (GitHub Pages), mobile-first (320–430 px), 3 locales (sv, en, ar with RTL)
**Project Type**: Static web application (Astro MPA with Preact islands)
**Performance Goals**: Lighthouse performance ≥ 0.90, accessibility ≥ 0.95, page weight ≤ 100 KB uncompressed
**Constraints**: Zero runtime JS for this feature (pure Astro component — no Preact island needed), no external runtime APIs
**Scale/Scope**: ~260 preschool detail pages across 3 locales (~780 static pages affected)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Performance by Default | PASS | Pure Astro component — zero JS added. No new Preact island. Link is a static `<a>` tag rendered at build time. No impact on page-weight budget. |
| II | Accessibility First | PASS | Semantic `<a>` element with descriptive text. `rel="noopener noreferrer"` + `target="_blank"` for security. Follows existing queue link pattern (keyboard navigable, visible focus ring via existing Tailwind classes). RTL layout handled by existing `rtl:` variants. |
| III | Data Integrity | PASS | PDF URL stored in per-preschool survey JSON (build-time static data). Optional field — missing URL gracefully omits the link. URL validated with `^https?://` regex before rendering (same pattern as queue link). Contract tests will enforce field shape. |
| IV | Testing Standards | PASS | Unit tests for data contract (new field in survey JSON). E2e tests for link presence, correct href, new-tab behavior, and graceful omission. i18n key parity test already enforces all three locale files have matching keys. |
| V | Architecture Discipline | PASS | No new island, no new utility files, no new abstractions. Modification to existing `DetailPage.astro` following the established queue link pattern. i18n keys added to existing locale files. Data field added to existing type. |
| VI | Internationalization | PASS | Link label text defined in all three locale files (sv, en, ar) with identical key structure. Arabic RTL rendering follows existing patterns. Key parity enforced by existing unit test. |
| VII | Privacy by Design | PASS | No runtime requests. Link is a static href to a public government PDF. No tracking, no analytics, no cookies. The external URL is baked into HTML at build time. |

**Gate result: ALL PASS** — no violations, no complexity justification needed.

## Project Structure

### Documentation (this feature)

```text
specs/013-survey-pdf-link/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── types.ts                          # Add optional surveyPdfUrl to PreschoolSurvey
├── i18n/
│   ├── sv.json                           # Add detail.surveyPdfLink key
│   ├── en.json                           # Add detail.surveyPdfLink key
│   └── ar.json                           # Add detail.surveyPdfLink key
├── components/
│   └── astro/
│       └── page-shells/
│           └── DetailPage.astro          # Add PDF link after queue link in actions area
└── pages/
    ├── sv/forskola/[id].astro            # No changes (delegates to DetailPage)
    ├── en/forskola/[id].astro            # No changes
    └── ar/forskola/[id].astro            # No changes

data/
└── malmo/
    └── 2025/
        └── *.json                        # Add surveyPdfUrl field to each preschool survey file

tests/
├── unit/
│   └── malmo-survey-files-contract.test.ts  # Update contract to accept optional surveyPdfUrl
└── e2e/
    └── survey-pdf-link.spec.ts              # New: link presence, href, new-tab, omission
```

**Structure Decision**: This feature modifies existing files only (type, component, i18n, data, contract test). The one new file is an e2e test. No new utilities, libraries, or abstractions. Follows the existing queue link implementation pattern in `DetailPage.astro`.

## Complexity Tracking

No constitution violations. No complexity justification needed.

## Implementation Steps

Ordered sequence for implementing this feature. Each step references the detail document where the implementer can find exact specifications.

### Step 1: Type Definition

Modify `PreschoolSurvey` in `src/lib/types.ts` to add the optional `surveyPdfUrl` field.

- **What to add**: `surveyPdfUrl?: string` — see [data-model.md § PreschoolSurvey](data-model.md#preschoolsurvey-modified) for the full type definition and field table.
- **Why optional**: Not all preschools may have a matching PDF. The field is omitted (not `null` or empty string) when unavailable — see [data-model.md § Survey JSON File Format](data-model.md#survey-json-file-format-after-change) for both cases.
- **Verify**: `pnpm check` passes (TypeScript compilation).

### Step 2: i18n Keys

Add `detail.surveyPdfLink` to all three locale files (`src/i18n/sv.json`, `en.json`, `ar.json`).

- **Exact key and values per locale**: see [data-model.md § i18n Keys](data-model.md#i18n-keys-new) for the key name, namespace placement, and translated strings.
- **Placement**: Under the existing `detail` namespace, alongside `detail.queueLink` and `detail.metaDescription`.
- **Verify**: `pnpm test` passes (i18n key parity unit test enforces all three files have matching keys).

### Step 3: Contract Test Update

Update `tests/unit/malmo-survey-files-contract.test.ts` to accept and validate the new optional `surveyPdfUrl` field.

- **What to add**: A new assertion block within the existing survey file iteration that validates `surveyPdfUrl` format and domain when the field is present — see [data-model.md § Validation Rules](data-model.md#validation-rules) for the rules.
- **Existing pattern to follow**: The existing queue link contract test in `tests/unit/malmo-directory-index-contract.test.ts` validates `queueUrl` format with `expect(entry.queueUrl).toMatch(/^https?:\/\//)` — apply the same approach for `surveyPdfUrl`, with an additional domain check for `forskoleenkatresultat.malmo.se`.
- **Verify**: `pnpm test` passes with the new assertions (will fail until Step 5 populates data).

### Step 4: Component Update

Add the PDF link to `src/components/astro/page-shells/DetailPage.astro`, placed after the queue link in the actions area.

- **Implementation pattern**: Follow the existing queue link conditional rendering — see [quickstart.md § Implementation Pattern](quickstart.md#implementation-pattern) for the code template and [research.md § Decision 3](research.md#3-implementation-pattern) for why this pattern was chosen.
- **Data source**: The field comes from `survey.surveyPdfUrl` (the `survey` prop is `PreschoolSurvey`), NOT from `preschool.queueUrl` — see [research.md § Decision 1](research.md#1-pdf-url-storage-location) for the rationale.
- **Placement**: After the `{preschool.operatorType === 'independent' && ...}` queue link block — see [research.md § Decision 2](research.md#2-link-placement-in-actions-area) for the action hierarchy reasoning.
- **Guard condition**: `survey.surveyPdfUrl && /^https?:\/\//.test(survey.surveyPdfUrl)` — mirrors the queue link's guard.
- **Attributes**: `rel="noopener noreferrer"`, `target="_blank"`, localized label via `t('detail.surveyPdfLink', locale)`.
- **Visual weight**: Use the same outlined secondary button CSS classes as the queue link (white background, ring border, primary-700 text). See the existing queue link `<a>` in `DetailPage.astro` for the full class list.
- **Icon**: Use a document/external-link SVG icon. Keep it inline (not a shared component) — only two link instances in the project don't justify extraction.
- **Verify**: `pnpm dev` and visually inspect a detail page. `pnpm build` succeeds.

### Step 5: Data Population

Add `surveyPdfUrl` to each preschool's survey JSON file in `data/malmo/2025/`.

- **Source of PDF URLs**: The official Malmö stad results page at `https://malmo.se/Bo-och-leva/Utbildning-och-forskola/Forskola/Utveckling-av-forskolorna-i-Malmo/Delaktighet-och-paverkan-i-forskolan/Forskoleenkaten/Resultat-fran-forskoleenkaten-2025.html` lists all PDF links. See [research.md § Decision 4](research.md#4-data-population-strategy) for the strategy.
- **JSON placement**: Add the field after `totalRespondentsPercent` and before `questionGroups` — see [data-model.md § Survey JSON File Format](data-model.md#survey-json-file-format-after-change) for the exact format.
- **Practical approach**: (1) Scrape/extract all PDF URLs from the Malmö page. (2) Match each URL to a preschool by comparing the PDF filename to the preschool names in `data/malmo/index.json`. (3) For unambiguous matches, add `surveyPdfUrl` to the JSON file. (4) For ambiguous/non-matching names, manually verify. (5) Preschools with no matching PDF simply omit the field.
- **Scale**: ~260 files. Placeholder surveys (those with `totalRespondentsPercent: -1`) likely won't have PDFs either, so the effective count is lower.
- **Verify**: `pnpm test` passes (contract test from Step 3 validates all populated URLs).

### Step 6: E2e Tests

Create `tests/e2e/survey-pdf-link.spec.ts` to verify the link's runtime behavior across locales.

- **Existing test to follow**: `tests/e2e/preschool-detail-page-contract.spec.ts` — uses the same canonical test subject (`almgardens-forskola`), same URL constants from `tests/e2e/helpers.ts`, and same pattern for testing conditional link rendering (see the queue link tests at the bottom of that file).
- **Test cases**: (1) PDF link is present with correct href, `target="_blank"`, and `rel="noopener noreferrer"` on a preschool with `surveyPdfUrl`. (2) PDF link is absent on a preschool without `surveyPdfUrl`. (3) PDF link label matches locale (sv, en, ar). (4) Href points to `forskoleenkatresultat.malmo.se` domain.
- **Test fixture**: Use `almgardens-forskola` if it has a `surveyPdfUrl` populated in Step 5; otherwise pick the first non-placeholder preschool with a URL (same skip pattern as the queue link test).
- **Helpers**: Reuse URL constants from `tests/e2e/helpers.ts` (`DETAIL_URL`, `DETAIL_URL_EN`, `DETAIL_URL_AR`).
- **Verify**: `pnpm test:e2e` passes.

### Step 7: Validation

Run the full quality gate to confirm nothing is broken.

- **Command**: `pnpm validate` — runs lint, format, type check, unit tests, build, e2e, and Lighthouse.
- **Checklist**: see [quickstart.md § Validation Checklist](quickstart.md#validation-checklist) for the manual verification steps.
- **Success criteria**: see [spec.md § Success Criteria](spec.md#measurable-outcomes) (SC-001 through SC-004).

### Step 8: Manual Verification

Visually verify the feature across locales and viewports.

- **Steps**:
  1. Run `pnpm dev`.
  2. Open a Swedish detail page (e.g., `/forskoleguiden/sv/forskola/almgardens-forskola/`) — confirm PDF link is visible, correctly labeled, opens in new tab.
  3. Open the same page in English (`/en/`) and Arabic (`/ar/`) — confirm localized label and RTL rendering.
  4. Open a preschool without `surveyPdfUrl` — confirm no broken/empty link renders.
  5. Resize to 320 px width — confirm no horizontal overflow.
  6. Keyboard-navigate to the PDF link — confirm focus ring is visible.
