# Tasks: Independent Preschool Queue Links

**Input**: Design documents from `specs/004-preschool-queue-links/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are included — the spec explicitly requires unit contract test extension (FR-013), e2e queue link and indicator assertions (SC-001–SC-005), and i18n key-parity verification (SC-006).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Failing tests are written before any implementation code (constitution IV rule).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Every task includes exact file paths

---

## Phase 1: Setup

**Purpose**: Confirm strategy and verify the unchanged baseline.

- [ ] T001 Confirm final requirements and clarifications in `specs/004-preschool-queue-links/spec.md` — note operator type semantics and graceful-omission edge cases
- [ ] T002 [P] Review implementation decisions in `specs/004-preschool-queue-links/research.md` (D-1 through D-7) and data contracts in `specs/004-preschool-queue-links/data-model.md`
- [ ] T003 Verify baseline build passes — run `pnpm build`, confirm existing `dist/` output is unchanged _(quickstart Step 1 pre-condition)_

**Checkpoint**: Strategy confirmed. No Astro config changes needed. Baseline green. Proceed to type extension.

---

## Phase 2: TypeScript Foundation (Blocking Prerequisite)

**Purpose**: Extend the TypeScript type first so strict-mode type-checking remains valid for all subsequent work.

**CRITICAL**: No test or implementation code should touch `queueUrl` before this phase is complete.

- [ ] T004 Add `queueUrl?: string` to `PreschoolIndexEntry` in `src/lib/types.ts` _(quickstart Step 1; data-model.md → PreschoolIndexEntry)_
- [ ] T005 Run `pnpm check` — TypeScript strict mode passes with the new optional field _(quickstart Step 1 → Verify)_

**Checkpoint**: `PreschoolIndexEntry` carries the new optional field. Type-checking is green. Failing tests can now be written.

---

## Phase 3: Failing Tests — Write Before Implementation

**Purpose**: Write all test assertions that will initially fail. Per the constitution, production code changes come after the failing test harness is in place.

- [ ] T006 Add failing unit test block `'should have queueUrl on every independent preschool and no queueUrl on any municipal preschool'` inside the existing `describe` in `tests/unit/malmo-directory-index-contract.test.ts` — run `pnpm test`, confirm this test fails _(quickstart Step 2a; data-model.md → Test Contract Extensions; research.md D-6)_
- [ ] T007 [P] Add failing e2e test `'detail page renders queue link for an independent preschool'` at the end of the `test.describe` block in `tests/e2e/preschool-detail-page-contract.spec.ts` — asserts visible link, `target="_blank"`, `rel="noopener noreferrer"`, and non-empty `href` _(quickstart Step 2b; data-model.md → Test Contract Extensions; research.md D-7)_
- [ ] T008 [P] Add failing e2e test `'detail page does not render queue link for a municipal preschool'` in `tests/e2e/preschool-detail-page-contract.spec.ts`, navigating to the canonical `TEST_URL` (`almgardens-forskola`) _(quickstart Step 2b; spec.md FR-004)_
- [ ] T009 [P] Add failing e2e test `'independent preschool cards display queue indicator'` at the end of the `test.describe` block in `tests/e2e/directory-data-rendering.spec.ts` — uses `getDirectoryCard(page, 'Al-Salamah språkförskola')` from `./helpers`; asserts `'Har egen kö'` is visible _(quickstart Step 2c; data-model.md → Test Contract Extensions; research.md D-6, D-7)_
- [ ] T010 [P] Add failing e2e test `'municipal preschool cards do not display queue indicator'` in `tests/e2e/directory-data-rendering.spec.ts` — uses `getDirectoryCard(page, 'Almgårdens förskola')`; asserts `'Har egen kö'` is NOT visible _(quickstart Step 2c; spec.md FR-009)_

**Checkpoint**: Five failing tests are in place — 1 unit, 4 e2e. No production file has been touched. The red baseline is confirmed.

---

## Phase 4: Data Layer — i18n Keys and Index Entries

**Purpose**: Add the text content and data that make the failing tests go green incrementally.

- [ ] T011 Add `"detail.queueLink"` and `"detail.queueIndicator"` keys under the existing `"detail"` namespace in `src/i18n/sv.json`, `src/i18n/en.json`, and `src/i18n/ar.json` — values per `data-model.md → i18n Keys` table _(quickstart Step 3; spec.md FR-003, FR-011; data-model.md → i18n Keys)_
- [ ] T012 Add `"queueUrl": "https://example.com/queue/{id}"` placeholder to all 71 `"operatorType": "independent"` entries in `data/malmo/index.json`; update `data/README.md` to document the placeholder policy _(quickstart Step 4; spec.md FR-013; data-model.md → index.json entries)_
- [ ] T013 Run `pnpm test` — unit contract test (T006) now **passes**; i18n key-parity test passes _(quickstart Step 4 → Verify)_

**Checkpoint**: Data layer complete — both i18n keys and `queueUrl` values are in place. The unit test is green. The e2e tests remain red (markup not yet rendered). Proceed to component work.

---

## Phase 5: User Story 1 — Detail Page Queue Link (Priority: P1) 🎯 MVP

**Goal**: An independent preschool's detail page shows a clearly labeled queue registration link in the Actions section.

**Independent Test**: Open `/sv/forskola/al-salamah-sprakforskola/` — "Anmäl dig till kö" link is visible, opens in a new tab, and the municipal page `/sv/forskola/almgardens-forskola/` shows no queue link. _(spec.md US-1 acceptance scenarios 1–6; SC-001, SC-002, SC-003)_

### Tests for User Story 1

Tests written in Phase 3 (T007, T008) — no new tests needed here.

### Implementation for User Story 1

- [ ] T014 [US1] Render conditional queue link `<a>` in the `<!-- Actions -->` `<div>` of `src/components/astro/pages/DetailPage.astro`, after the `CompareButton` island — guard: `preschool.operatorType === 'independent' && preschool.queueUrl`; attributes: `href`, `target="_blank"`, `rel="noopener noreferrer"`, Tailwind classes; inline SVG icon `aria-hidden="true"`; label via `t('detail.queueLink', locale)` _(quickstart Step 5; spec.md FR-001, FR-002, FR-005, FR-006, FR-007; research.md D-1, D-4; data-model.md → Data Flow)_
- [ ] T015 [US1] Verify US1: run `pnpm build && pnpm test:e2e` — T007 and T008 pass _(SC-001, SC-002, SC-003; quickstart Step 5 → Verify)_

**Checkpoint**: US1 is independently functional. An independent preschool's detail page shows the queue link; a municipal page does not. This is the MVP — the primary conversion action for independent preschool parents is live.

---

## Phase 6: User Story 2 — Directory Card Queue Indicator (Priority: P2)

**Goal**: Independent preschool cards in the directory show a passive icon + text indicator signalling the preschool has its own queue.

**Independent Test**: Load `/sv/` — the Al-Salamah card shows "Har egen kö"; the Almgårdens card does not. _(spec.md US-2 acceptance scenarios 1–3; SC-005)_

### Tests for User Story 2

Tests written in Phase 3 (T009, T010) — no new tests needed here.

### Implementation for User Story 2

- [ ] T016 [US2] Add `queueUrl?: string` to the `interface Props` destructure in `src/components/astro/PreschoolCard.astro`; render conditional `<span>` indicator (small inline SVG `aria-hidden="true"` + `t('detail.queueIndicator', locale)` text) inside the card's lower row, guarded by `operatorType === 'independent' && queueUrl` _(quickstart Step 6; spec.md FR-008, FR-009, FR-010; research.md D-3, D-4; data-model.md → Component Props)_
- [ ] T017 [US2] Pass `queueUrl={preschool.queueUrl}` from the `<PreschoolCard ... />` call in `src/components/astro/pages/DirectoryPage.astro` _(quickstart Step 6; research.md D-2; data-model.md → DirectoryPage.astro)_
- [ ] T018 [US2] Verify US2: run `pnpm build && pnpm test:e2e` — T009 and T010 pass _(SC-005; quickstart Step 6 → Verify)_

**Checkpoint**: US2 independently functional. Queue indicator appears on independent preschool cards; municipal cards are unaffected.

---

## Phase 7: User Story 3 — Cross-Locale Correctness (Priority: P2)

**Goal**: Queue link labels and indicators render in the correct language and without RTL layout breakage across all three locales.

**Independent Test**: Build the site and spot-check the three locale paths for the independent preschool detail page and directory. _(spec.md US-3 acceptance scenarios 1–4; SC-004, SC-006)_

### Verification for User Story 3

No new test files are added — coverage comes from the i18n key-parity unit test (SC-006) and the locale-specific spot-checks below.

- [ ] T019 [P] [US3] Verify English detail page — open `/en/forskola/al-salamah-sprakforskola/` in the built output; assert link text is `"Register for queue"`, not Swedish _(spec.md FR-003; quickstart Step 7 verification checklist)_
- [ ] T020 [P] [US3] Verify Arabic detail page — open `/ar/forskola/al-salamah-sprakforskola/` (or run `pnpm build` and inspect `dist/ar/.../index.html`); assert Arabic link text renders, no horizontal overflow at 375 px (iPhone 13 mini) _(spec.md FR-012, US-3 AC-3; quickstart Step 7 verification checklist)_
- [ ] T021 [P] [US3] Verify Arabic directory page — open `/ar/` in the built output; assert queue indicator on independent cards shows Arabic `"لها قائمة انتظار خاصة"` text, positioned correctly for RTL _(spec.md US-3 AC-4; quickstart Step 7 verification checklist)_

**Checkpoint**: All three locales are consistent — correct language labels, no RTL overflow, no locale text leaking into another locale's pages.

---

## Phase 8: Quality Gate

**Purpose**: Run the full CI quality gate and perform the manual spot-check from `quickstart.md`.

- [ ] T022 Run full quality gate — `pnpm validate` (lint → lint:md → format → check → unit tests → build → e2e → post-build budget → Lighthouse); all steps must pass _(quickstart Step 7; spec.md SC-001–SC-008)_
- [ ] T023 Manual spot-check per `specs/004-preschool-queue-links/quickstart.md` verification checklist — six items covering sv/en/ar detail and directory pages; confirm independent preschool opens in new tab, municipal page shows nothing _(quickstart → Verification Checklist)_

**Checkpoint**: `pnpm validate` is green. Manual spot-check confirms correct behavior across all three locales. Feature is shippable.
