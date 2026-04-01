# Tasks: Survey PDF Link on Detail Pages

**Input**: Design documents from `/specs/013-survey-pdf-link/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Type definition, i18n keys, and contract test updates that MUST be complete before any user story implementation can begin. These are shared infrastructure — both US1 and US2 depend on them.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 [P] Add optional `surveyPdfUrl?: string` field to `PreschoolSurvey` type in `src/lib/types.ts` — see [data-model.md § PreschoolSurvey](data-model.md#preschoolsurvey-modified) for the full type definition
- [x] T002 [P] Add `detail.surveyPdfLink` key to `src/i18n/sv.json` with value `Visa enkätresultat (PDF)` — see [data-model.md § i18n Keys](data-model.md#i18n-keys-new) for namespace placement (under existing `detail` key, alongside `detail.queueLink`)
- [x] T003 [P] Add `detail.surveyPdfLink` key to `src/i18n/en.json` with value `View survey results (PDF)` — see [data-model.md § i18n Keys](data-model.md#i18n-keys-new)
- [x] T004 [P] Add `detail.surveyPdfLink` key to `src/i18n/ar.json` with value `عرض نتائج الاستبيان (PDF)` — see [data-model.md § i18n Keys](data-model.md#i18n-keys-new)
- [x] T005 Add `surveyPdfUrl` validation assertions to `tests/unit/malmo-survey-files-contract.test.ts` — validate HTTPS URL, `forskoleenkatresultat.malmo.se` domain, and `.pdf` extension when field is present. See [data-model.md § Contract Test Assertions](data-model.md#contract-test-assertions) for the exact assertion code and follow the `queueUrl` validation pattern in `tests/unit/malmo-directory-index-contract.test.ts`

**Checkpoint**: `pnpm check` passes (T001). `pnpm test` passes — i18n key parity test confirms all three locale files match (T002–T004). Contract test ready for data population (T005).

---

## Phase 2: User Story 1 — Parent Views the Original Survey Data (Priority: P1) 🎯 MVP

**Goal**: Display a working link to the official survey PDF on each preschool detail page. The link opens in a new tab, uses the correct localized label, and is gracefully omitted when no URL is available.

**Independent Test**: Build the site, open any preschool detail page with a `surveyPdfUrl` in its data, and verify the link is present, labeled in the correct locale, opens the PDF in a new tab, and points to `forskoleenkatresultat.malmo.se`.

**Satisfies**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-009, FR-010, FR-011 | SC-001, SC-002, SC-003, SC-004

### Implementation for User Story 1

- [x] T006 [US1] Add PDF link to `src/components/astro/page-shells/DetailPage.astro` — place after the queue link block in the actions `<div>`, using the same conditional rendering pattern (`survey.surveyPdfUrl && /^https?:\/\//.test(survey.surveyPdfUrl)`), same CSS classes as queue link (outlined secondary button), `rel="noopener noreferrer"`, `target="_blank"`, inline document SVG icon, label via `t('detail.surveyPdfLink', locale)`. See [quickstart.md § Implementation Pattern](quickstart.md#implementation-pattern) for the code template and [research.md § Decision 3](research.md#3-implementation-pattern) for why this pattern was chosen. Key difference from queue link: reads from `survey.surveyPdfUrl` (not `preschool.queueUrl`) and has NO operator-type check (applies to both municipal and independent)
- [x] T007 [US1] Populate `surveyPdfUrl` in `data/malmo/2025/*.json` files — extract all PDF URLs from the Malmö stad results page (`https://malmo.se/Bo-och-leva/Utbildning-och-forskola/Forskola/Utveckling-av-forskolorna-i-Malmo/Delaktighet-och-paverkan-i-forskolan/Forskoleenkaten/Resultat-fran-forskoleenkaten-2025.html`), match each to a preschool ID via fuzzy name comparison against `data/malmo/index.json`, and add the `surveyPdfUrl` field after `totalRespondentsPercent` in each JSON file. See [research.md § Decision 4](research.md#4-data-population-strategy) for the matching strategy and [data-model.md § Survey JSON File Format](data-model.md#survey-json-file-format-after-change) for the exact JSON structure. Skip placeholder surveys (`totalRespondentsPercent: -1`). Omit the field entirely for preschools with no matching PDF
- [x] T008 [US1] Create e2e test file `tests/e2e/survey-pdf-link.spec.ts` — test that (1) PDF link is present with correct `href`, `target="_blank"`, and `rel="noopener noreferrer"` on a preschool with `surveyPdfUrl`, (2) PDF link is absent on a preschool without `surveyPdfUrl`, (3) link label matches locale text for sv/en/ar, (4) href domain is `forskoleenkatresultat.malmo.se`. Follow the pattern in `tests/e2e/preschool-detail-page-contract.spec.ts` (queue link tests). Use URL constants from `tests/e2e/helpers.ts` (`DETAIL_URL`, `DETAIL_URL_EN`, `DETAIL_URL_AR`). Use the same skip-guard pattern as the queue link test for preschools without `surveyPdfUrl`

**Checkpoint**: `pnpm validate` passes. PDF link visible on detail pages with `surveyPdfUrl`. Link absent on pages without it. All three locales render correctly.

---

## Phase 3: User Story 2 — Parent Understands the Data Source Attribution (Priority: P2)

**Goal**: The PDF link label and its surrounding context communicate that the data originates from an official municipal survey, reinforcing trust without requiring the parent to click through.

**Independent Test**: Load a detail page and verify that the PDF link label text conveys the official data source clearly enough that a first-time visitor understands the numbers come from an official survey.

**Satisfies**: FR-008 (attribution text) | Acceptance scenarios from US2

**Note**: US2 is largely satisfied by the label text chosen in US1 (`Visa enkätresultat (PDF)` / `View survey results (PDF)` / `عرض نتائج الاستبيان (PDF)`), which explicitly references "survey results." The existing footer attribution (`attribution.text` key) already states the data comes from Malmö stad. Additional attribution context is only needed if manual verification (T009) reveals the current label is insufficient.

### Implementation for User Story 2

- [x] T009 [US2] Manual verification of attribution clarity — open detail pages in all three locales and assess whether the PDF link label, combined with the existing footer attribution text, adequately communicates the official data source to a first-time visitor. If the label alone is insufficient, add a brief attribution text near the link (e.g., a `<span>` with lighter text) and corresponding i18n keys. Document the outcome in the PR description

**Checkpoint**: A first-time visitor can understand the data source from the link label and page context without clicking the PDF.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all stories, viewport testing, and accessibility checks

- [x] T010 Run `pnpm validate` to confirm full quality gate passes (lint, format, type check, unit tests, build, e2e, Lighthouse) — see [quickstart.md § Validation Checklist](quickstart.md#validation-checklist) and [spec.md § Success Criteria](spec.md#measurable-outcomes) (SC-001 through SC-004)
- [x] T011 Manual cross-locale and viewport verification — follow the steps in [plan.md § Step 8](plan.md#step-8-manual-verification): (1) open sv/en/ar detail pages and confirm localized labels, (2) verify RTL rendering in Arabic, (3) test on 320 px viewport width for overflow, (4) keyboard-navigate to PDF link and confirm focus ring, (5) open a preschool without `surveyPdfUrl` and confirm no broken link

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion (type, i18n keys, contract test)
- **User Story 2 (Phase 3)**: Depends on Phase 2 completion (needs the rendered link to evaluate attribution)
- **Polish (Phase 4)**: Depends on Phase 2 completion (Phase 3 is lightweight and can overlap)

### Within Phase 1

- T001, T002, T003, T004 are all independent file changes — can run in parallel
- T005 depends on T001 (contract test references the `surveyPdfUrl` field from the updated type)

### Within Phase 2 (User Story 1)

- T006 depends on T001–T004 (component uses the type and i18n key)
- T007 is independent of T006 (data population doesn't depend on component changes)
- T008 depends on T006 and T007 (e2e tests need both the rendered link and populated data)

### Parallel Opportunities

```text
T001 ─┐
T002 ─┤
T003 ─┼─→ T005 ─→ T006 ─┐
T004 ─┘              │   ├─→ T008 ─→ T009 ─→ T010 ─→ T011
                      │   │
                  T007 ───┘
```

- **Batch 1** (parallel): T001 + T002 + T003 + T004
- **Batch 2**: T005
- **Batch 3** (parallel): T006 + T007
- **Batch 4**: T008
- **Batch 5**: T009
- **Batch 6**: T010 + T011

---

## Implementation Strategy

### MVP Scope

**User Story 1 (Phase 2)** is the MVP. It delivers the complete PDF link functionality: type definition, i18n, data population, component rendering, and e2e tests. A shippable increment after Phase 1 + Phase 2.

### Incremental Delivery

1. **Phase 1** → Foundation ready, `pnpm check` and `pnpm test` pass
2. **Phase 2** → MVP complete, PDF links render on detail pages, `pnpm validate` passes
3. **Phase 3** → Attribution verified, minor refinement if needed
4. **Phase 4** → Final polish, cross-cutting validation, ready to merge
