# Tasks: Response Rate Display

**Input**: Design documents from `/specs/014-response-rate-display/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not requested in the feature specification. Existing e2e tests (axe-core accessibility, page contracts) and the i18n key parity unit test cover this feature's acceptance criteria. No new test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Foundational (i18n Keys)

**Purpose**: Add the shared `detail.responseRate` translation key to all three locale files. This is the foundation for both US1 and US2 — no UI work can begin until these keys exist.

**Refs**: [quickstart.md Step 1](quickstart.md#step-1-add-i18n-keys-all-three-locale-files), [research.md Decision 3](research.md#decision-3-i18n-key-naming), [data-model.md i18n Keys](data-model.md#i18n-keys-new)

- [x] T001 [P] Add `detail.responseRate` key with value `"Svarsfrekvens"` to the `detail` section in `src/i18n/sv.json`
- [x] T002 [P] Add `detail.responseRate` key with value `"Response rate"` to the `detail` section in `src/i18n/en.json`
- [x] T003 [P] Add `detail.responseRate` key with value `"معدل الاستجابة"` to the `detail` section in `src/i18n/ar.json`
- [x] T004 Verify i18n key parity: `pnpm test -- --run tests/unit/i18n-locale-key-parity.test.ts`

**Checkpoint**: All three locale files have the new key. Parity test passes. UI work can now begin.

---

## Phase 2: User Story 1 — View Response Rate on Detail Page (Priority: P1) 🎯 MVP

**Goal**: Display the survey response rate (`totalRespondentsPercent`) in the preschool detail page hero metadata row, alongside address and operator type.

**Independent Test**: Visit any preschool detail page (e.g., `/forskoleguiden/sv/forskola/arrie-forskola/`) and confirm the response rate appears in the hero metadata row with a translated label and percentage value.

**Refs**: [quickstart.md Step 2](quickstart.md#step-2-detail-page--hero-metadata-row), [research.md Decision 1](research.md#decision-1-display-strategy--pure-static-vs-island) (pure Astro, zero JS), [research.md Decision 2](research.md#decision-2-visual-presentation--plain-text-in-metadata-row) (icon + label + percentage, no tier coloring)

### Implementation for User Story 1

- [x] T005 [P] [US1] Add response rate item to hero metadata row in `src/components/astro/page-shells/DetailPage.astro` — insert a bullet separator and a new `<div class="flex items-center gap-1.5">` with an SVG icon (`aria-hidden="true"`), the translated label via `t('detail.responseRate', locale)`, and `survey.totalRespondentsPercent` as a percentage, following the existing address/operator-type pattern (~line 62)

**Checkpoint**: Detail page shows response rate in the hero. Screen readers announce the label and value. US1 acceptance scenarios pass.

---

## Phase 3: User Story 2 — Response Rate in Comparison View (Priority: P1)

**Goal**: Display each preschool's response rate in the ComparisonCard name/info area on the comparison page.

**Independent Test**: Select 2–3 preschools for comparison, open `/forskoleguiden/sv/jamfor/`, and confirm each card shows the response rate below the preschool name.

**Refs**: [quickstart.md Step 3a–3c](quickstart.md#step-3-comparison-page--label-plumbing-astro-shell--preact-orchestrator), [research.md Decision 1](research.md#decision-1-display-strategy--pure-static-vs-island) (existing Preact island, no new islands)

### Implementation for User Story 2

Tasks follow the top-down component chain: Astro shell → Preact orchestrator → Preact card.

- [x] T006 [P] [US2] Add `responseRate: t('detail.responseRate', locale)` to the `labels={{...}}` object in `src/components/astro/page-shells/ComparisonPage.astro` (~line 46)
- [x] T007 [US2] Add `responseRate: string` to `ComparisonViewLabels` interface (~line 30) and pass `responseRateLabel={labels.responseRate}` to `<ComparisonCard>` (~line 246) in `src/components/preact/ComparisonView.tsx`
- [x] T008 [US2] Add `responseRateLabel: string` to `Props` interface (~line 12), destructure it, and render `{responseRateLabel}: {survey.totalRespondentsPercent}%` as a `<span class="text-xs text-gray-500">` after the preschool name link in the `preschoolInfo` block (~line 59) in `src/components/preact/ComparisonCard.tsx`

**Checkpoint**: Comparison page shows response rate per card. Screen readers announce the label and value. US2 acceptance scenarios pass.

---

## Phase 4: User Story 3 — Translation Verification (Priority: P2)

**Goal**: Verify the response rate label renders correctly in all three locales, including RTL layout for Arabic.

**Independent Test**: Switch to English (`/forskoleguiden/en/`) and Arabic (`/forskoleguiden/ar/`), visit both a detail page and the comparison page, and confirm the label is translated and Arabic renders RTL.

**Note**: No code changes in this phase — US3 is satisfied by the i18n keys added in Phase 1 and the UI rendering from Phases 2–3. This phase is purely verification.

- [x] T009 [US3] Verify response rate label renders correctly in English on both detail and comparison pages
- [x] T010 [US3] Verify response rate label renders correctly in Arabic with RTL layout on both detail and comparison pages

**Checkpoint**: All three locales display the correct translated label. Arabic layout is right-to-left. US3 acceptance scenarios pass.

---

## Phase 5: Polish & Validation

**Purpose**: Full quality gate validation across all user stories.

**Refs**: [quickstart.md Step 4](quickstart.md#step-4-full-validation)

- [x] T011 Run full validation: `pnpm validate` (lint → lint:md → format → astro check → unit tests → build → e2e → Lighthouse)

**Checkpoint**: All quality gates pass. Feature is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS all UI work.
- **US1 (Phase 2)**: Depends on Phase 1 completion.
- **US2 (Phase 3)**: Depends on Phase 1 completion. Independent of US1.
- **US3 (Phase 4)**: Depends on Phases 2 and 3 completion (verification only).
- **Polish (Phase 5)**: Depends on all above.

### User Story Dependencies

- **US1 (P1)**: Requires i18n keys (Phase 1). Touches only `DetailPage.astro`. No dependency on US2.
- **US2 (P1)**: Requires i18n keys (Phase 1). Touches `ComparisonPage.astro`, `ComparisonView.tsx`, `ComparisonCard.tsx`. No dependency on US1.
- **US3 (P2)**: Verification only — depends on US1 and US2 being implemented.

### Within User Story 2

- T006 (ComparisonPage.astro) → T007 (ComparisonView.tsx) → T008 (ComparisonCard.tsx)
- Strict sequential order: Astro shell → Preact orchestrator → Preact card

### Parallel Opportunities

- T001, T002, T003 can all run in parallel (different locale files, no dependencies)
- T005 (US1) and T006 (US2) can run in parallel after Phase 1 completes (different component files)
- T009, T010 can run in parallel (independent locale verifications)

---

## Parallel Example: After Phase 1 Completes

```text
# US1 and US2 can start simultaneously:
Stream A: T005 [US1] DetailPage.astro (single task, done)
Stream B: T006 [US2] ComparisonPage.astro → T007 ComparisonView.tsx → T008 ComparisonCard.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: i18n keys (T001–T004)
2. Complete Phase 2: Detail page (T005)
3. **STOP and VALIDATE**: Visit a detail page → response rate visible in hero
4. This alone delivers value — parents see the metric on the most important page

### Incremental Delivery

1. Add i18n keys → Foundation ready
2. Add US1 (detail page) → Test independently → MVP!
3. Add US2 (comparison page) → Test independently → Full P1 delivery
4. Verify US3 (translations) → All locales confirmed
5. Run `pnpm validate` → Ship

### Key Design Decisions (from research.md)

- **Decision 1**: Pure Astro rendering for detail page (zero JS). Existing Preact island for comparison card (no new islands).
- **Decision 2**: Plain text presentation — icon + label + percentage. No tier coloring or visual weight differentiation.
- **Decision 3**: Single `detail.responseRate` i18n key reused in both detail and comparison contexts.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- No new files created — all changes are additions to existing files
- No new JS islands — detail page is pure Astro, comparison uses existing Preact island
- Placeholder surveys (`totalRespondentsPercent: -1`) are already filtered by `isPlaceholderSurvey()` — no edge case handling needed
- Commit after each phase or logical group
