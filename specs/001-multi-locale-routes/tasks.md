# Tasks: Multi-Locale Page Routes

**Input**: Design documents from `/specs/001-multi-locale-routes/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are included — the spec explicitly requires post-build test updates (FR-010) and e2e verification (SC-004, SC-005, SC-006).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Confirm strategy and verify baseline

- [x] T001 Confirm page generation strategy — read research.md Decision 1 and verify explicit per-locale page files approach _(quickstart Step 0)_
- [x] T002 Verify baseline build succeeds with `pnpm build` — existing `dist/sv/` output is correct

**Checkpoint**: Baseline confirmed. No Astro config changes needed (research.md D-2). Ready for page creation.

---

## Phase 2: User Story 1 — English-Speaking Parent Browses the Site (Priority: P1) 🎯 MVP

**Goal**: Create all 4 English page routes so English-speaking parents can browse the full site in English.

**Independent Test**: Load `dist/en/index.html`, verify English headings appear, English detail/comparison/about pages exist, and HTML has `lang="en"` without `dir="rtl"`. _(spec.md US-1 acceptance scenarios 1–4; quickstart Step 1a)_

### Implementation for User Story 1

- [x] T003 [P] [US1] Create English directory page in `src/pages/en/index.astro` — copy from `src/pages/sv/index.astro`, set `locale = 'en'`, `listId="en-preschool-directory-list"`, `id="en-preschool-directory-list"` _(quickstart Step 1 file 1; research.md D-3)_
- [x] T004 [P] [US1] Create English detail page in `src/pages/en/forskola/[id].astro` — copy from `src/pages/sv/forskola/[id].astro`, set `locale = 'en'` _(quickstart Step 1 file 2)_
- [x] T005 [P] [US1] Create English comparison page in `src/pages/en/jamfor/index.astro` — copy from `src/pages/sv/jamfor/index.astro`, set `locale = 'en'` _(quickstart Step 1 file 3)_
- [x] T006 [P] [US1] Create English about page in `src/pages/en/om/index.astro` — copy from `src/pages/sv/om/index.astro`, set `locale = 'en'` _(quickstart Step 1 file 4)_
- [x] T007 [US1] Verify English build — run `pnpm build`, assert `dist/en/index.html` contains `<html lang="en">` and English headings, `dist/en/forskola/*/index.html` exists, no `dir="rtl"` _(quickstart Step 1a; SC-002, FR-002, FR-005)_

**Checkpoint**: English pages are live. An English-speaking parent can browse directory, detail, comparison, and about pages entirely in English. This is the MVP — deploy/demo if ready.

---

## Phase 3: User Story 2 — Arabic-Speaking Parent Browses in RTL (Priority: P2)

**Goal**: Create all 4 Arabic page routes with correct RTL attributes so Arabic-speaking parents can browse the site in Arabic.

**Independent Test**: Load `dist/ar/index.html`, verify Arabic text appears, HTML has `lang="ar"` and `dir="rtl"`, Arabic detail/comparison/about pages exist. _(spec.md US-2 acceptance scenarios 1–4; quickstart Step 2a)_

### Implementation for User Story 2

- [x] T008 [P] [US2] Create Arabic directory page in `src/pages/ar/index.astro` — copy from `src/pages/sv/index.astro`, set `locale = 'ar'`, `listId="ar-preschool-directory-list"`, `id="ar-preschool-directory-list"` _(quickstart Step 2 file 1; research.md D-3)_
- [x] T009 [P] [US2] Create Arabic detail page in `src/pages/ar/forskola/[id].astro` — copy from `src/pages/sv/forskola/[id].astro`, set `locale = 'ar'` _(quickstart Step 2 file 2)_
- [x] T010 [P] [US2] Create Arabic comparison page in `src/pages/ar/jamfor/index.astro` — copy from `src/pages/sv/jamfor/index.astro`, set `locale = 'ar'` _(quickstart Step 2 file 3)_
- [x] T011 [P] [US2] Create Arabic about page in `src/pages/ar/om/index.astro` — copy from `src/pages/sv/om/index.astro`, set `locale = 'ar'` _(quickstart Step 2 file 4)_
- [x] T012 [US2] Verify Arabic build — run `pnpm build`, assert `dist/ar/index.html` contains `<html lang="ar">` and `dir="rtl"` and Arabic text from `ar.json` _(quickstart Step 2a; SC-003, FR-003, FR-004)_

**Checkpoint**: Arabic pages are live with correct RTL attributes. Both English and Arabic locales are now browsable alongside Swedish.

---

## Phase 4: User Story 3 — Internal Navigation Stays Within Locale (Priority: P1)

**Goal**: Verify that every internal link in built English and Arabic pages stays within the active locale. No code changes expected — components already use `${base}/${locale}/` interpolation.

**Independent Test**: Inspect `dist/en/index.html` and `dist/ar/index.html` links — all `href` values must use the correct locale prefix. _(spec.md US-3 acceptance scenarios 1–4; quickstart Step 3)_

### Verification for User Story 3

- [x] T013 [US3] Verify internal links stay within locale in built HTML — grep `dist/en/index.html` and `dist/ar/index.html` for all `href` values, confirm Nav, PreschoolCard, CompareTray, ComparisonView, and Breadcrumb links all use `/${locale}/` prefix. If any link hardcodes `/sv/`, fix the component. _(quickstart Step 3 component checklist; FR-006)_

**Checkpoint**: All internal links confirmed locale-consistent. If any component needed fixing, it is done and build re-verified.

---

## Phase 5: User Story 5 — Build Output Verification for All Locales (Priority: P2)

**Goal**: Automate build output verification so three-locale parity is enforced by tests. Update existing post-build test with multi-locale assertions and budgets.

**Independent Test**: Run `pnpm test:post-build` — all assertions for `sv/`, `en/`, and `ar/` locale directories pass. _(spec.md US-5 acceptance scenarios 1–3; quickstart Step 5)_

### Implementation for User Story 5

- [x] T014 [US5] Update config constants in `tests/post-build/static-output-verification.test.ts` — change `MIN_HTML_FILE_COUNT` from `8` to `790`, change `TOTAL_SIZE_BUDGET_BYTES` from `7000 * 1024` to `21000 * 1024` _(quickstart Step 5 config table; research.md D-5)_
- [x] T015 [US5] Add multi-locale structural assertions in `tests/post-build/static-output-verification.test.ts` — add test cases for `dist/en/` and `dist/ar/` (directory, about, comparison, detail pages for every preschool ID), using a `['sv', 'en', 'ar']` locale loop to avoid triplicating test code _(quickstart Step 5 structural assertions; SC-001, FR-010)_
- [x] T016 [US5] Run `pnpm test:post-build` and verify all assertions pass _(SC-001, SC-007)_

**Checkpoint**: Automated build verification enforces three-locale parity. Any future locale drift will be caught by CI.

---

## Phase 6: User Story 4 — Default Language for First-Time Visitors (Priority: P3)

**Goal**: Verify the root URL still redirects to Swedish. No code changes — existing `astro.config.ts` redirect is preserved.

**Independent Test**: Inspect `dist/index.html` — it redirects to `/forskoleguiden/sv/`. _(spec.md US-4 acceptance scenario 1; quickstart Step 4)_

### Verification for User Story 4

- [x] T017 [US4] Verify root redirect to Swedish locale — inspect `dist/index.html`, assert it redirects to `/forskoleguiden/sv/` _(quickstart Step 4; research.md D-2; FR-007, SC-005)_

**Checkpoint**: Root redirect confirmed intact. Adding new locale pages did not break the default landing behavior.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: E2e test covering all user stories, full validation confirming zero regressions.

- [x] T018 Create e2e test in `tests/e2e/multi-locale-routes.spec.ts` — use self-contained URL constants (not shared helpers, per research.md D-4); cover: English directory loads with English headings (US-1 AS-1), English `lang="en"` no `dir="rtl"` (US-1 AS-4), English card click navigates to `/en/forskola/{id}/` (US-1 AS-2, US-3 AS-1, SC-004), Arabic directory loads with Arabic text (US-2 AS-1), Arabic `lang="ar"` and `dir="rtl"` (US-2 AS-2), Arabic card click navigates to `/ar/forskola/{id}/` (US-2 AS-3), root redirect to Swedish (US-4 AS-1, SC-005), breadcrumb/back links stay within locale (US-3 AS-2, AS-3, AS-4) _(quickstart Step 6 acceptance scenario table)_
- [x] T019 Run `pnpm validate` — full quality gate: lint, format, check, test, build, post-build, e2e, WebKit e2e, Lighthouse audit. All must pass. _(quickstart Step 7; FR-011, SC-006)_

**Checkpoint**: All quality gates pass. Zero regressions on Swedish tests. Feature is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US-1 English Pages (Phase 2)**: Depends on Setup — this is the MVP
- **US-2 Arabic Pages (Phase 3)**: Depends on Setup — can run in parallel with Phase 2 (different files), but sequential is recommended for incremental verification _(quickstart Steps 1a/2a)_
- **US-3 Link Verification (Phase 4)**: Depends on Phase 2 (needs English pages built to verify)
- **US-5 Post-Build Tests (Phase 5)**: Depends on Phase 2 + Phase 3 (needs all locales for parity check)
- **US-4 Redirect Verification (Phase 6)**: Can run after any build — no story dependencies
- **Polish (Phase 7)**: Depends on all previous phases complete

### User Story Dependencies

- **US-1 (P1)**: Independent — can start after Setup _(MVP)_
- **US-2 (P2)**: Independent — can start after Setup _(parallel with US-1 if desired)_
- **US-3 (P1)**: Depends on US-1 (at minimum) — verification only, no code
- **US-4 (P3)**: Independent — verification only, no code
- **US-5 (P2)**: Depends on US-1 + US-2 — needs all 3 locales built

### Within Each User Story

- Page files (T003–T006, T008–T011) are [P] parallelizable — different files, no dependencies
- Build verification (T007, T012) must follow all page files for that locale
- Post-build test config change (T014) before structural assertions (T015)

### Parallel Opportunities

- **Within US-1**: T003, T004, T005, T006 can all run in parallel (4 different files)
- **Within US-2**: T008, T009, T010, T011 can all run in parallel (4 different files)
- **US-1 + US-2**: Can run in parallel if incremental verification is not needed (different directories)
- **T014 + T015**: Can run sequentially within a single file edit session

---

## Parallel Example: User Story 1

```text
# Launch all 4 English page files together:
Task: T003 — Create English directory page in src/pages/en/index.astro
Task: T004 — Create English detail page in src/pages/en/forskola/[id].astro
Task: T005 — Create English comparison page in src/pages/en/jamfor/index.astro
Task: T006 — Create English about page in src/pages/en/om/index.astro

# Then verify (sequential):
Task: T007 — Verify English build output
```

## Parallel Example: User Story 2

```text
# Launch all 4 Arabic page files together:
Task: T008 — Create Arabic directory page in src/pages/ar/index.astro
Task: T009 — Create Arabic detail page in src/pages/ar/forskola/[id].astro
Task: T010 — Create Arabic comparison page in src/pages/ar/jamfor/index.astro
Task: T011 — Create Arabic about page in src/pages/ar/om/index.astro

# Then verify (sequential):
Task: T012 — Verify Arabic build output
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (confirm strategy)
2. Complete Phase 2: US-1 — English Pages (T003–T007)
3. **STOP and VALIDATE**: English pages build correctly, headings are English, `lang="en"` set
4. Deploy/demo English locale if ready

### Incremental Delivery

1. Setup → Strategy confirmed
2. US-1 English Pages → Verify English build → **MVP ready**
3. US-2 Arabic Pages → Verify Arabic build with RTL → Two additional locales live
4. US-3 Link Verification → Confirm locale-consistent navigation
5. US-5 Post-Build Tests → Automated three-locale parity enforcement
6. US-4 Redirect Verification → Confirm root still lands on Swedish
7. Polish → E2e test + full `pnpm validate` → **Feature complete**

### Key References

| Task area                  | Quickstart step | Research decision | Spec requirements                      |
| -------------------------- | --------------- | ----------------- | -------------------------------------- |
| Page generation approach   | Step 0          | D-1               | —                                      |
| English page files         | Step 1          | D-3               | FR-001, FR-002, FR-005, FR-008, FR-009 |
| English build verification | Step 1a         | —                 | SC-002                                 |
| Arabic page files          | Step 2          | D-3               | FR-001, FR-003, FR-004, FR-008, FR-009 |
| Arabic build verification  | Step 2a         | —                 | SC-003                                 |
| Internal link verification | Step 3          | —                 | FR-006                                 |
| Root redirect verification | Step 4          | D-2               | FR-007, SC-005                         |
| Post-build test updates    | Step 5          | D-5               | FR-010, SC-001, SC-007                 |
| E2e test creation          | Step 6          | D-4               | FR-006, SC-004, SC-005                 |
| Full validation            | Step 7          | —                 | FR-011, SC-006                         |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each phase checkpoint
- All page files follow the same pattern: copy Swedish counterpart, change only `locale` constant (and `listId`/`id` on directory pages)
- See quickstart.md "Key Patterns to Follow" for the exact locale constant, SortToggle list ID, and base path patterns
- See quickstart.md "What NOT to Change" to avoid scope creep
