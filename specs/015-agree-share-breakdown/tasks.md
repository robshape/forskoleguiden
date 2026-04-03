# Tasks: Agree-Share Breakdown on Comparison Page

**Input**: Design documents from `/specs/015-agree-share-breakdown/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Included — constitution principle IV requires unit and e2e verification.

**Organization**: All three user stories are P1 and tightly coupled — the inline agree-share bar satisfies US1 (bar), US2 (legend), and US3 (aria-hidden + sr-only table preservation) simultaneously. Tasks are grouped into a single implementation phase with per-story traceability labels.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in descriptions

---

## Phase 1: Implementation (All User Stories — Priority: P1) 🎯 MVP

**Goal**: Add horizontal stacked breakdown bar charts to each comparison card, with legend and accessible fallback.

**Independent Test**: Select 2+ preschools → navigate to comparison page → each card under each question displays a bar chart with pattern-filled segments and a text legend; screen-reader table remains intact.

### Tests (write FIRST, ensure they FAIL before implementation) ⚠️

- [x] T001 [P] [US1] Unit test for chart index uniqueness formula in `tests/unit/comparison-card-chart-index.test.ts` — verify `questionIndex * surveyCount + surveyIndex + 1000` produces unique values for all combinations up to 5 surveys × N questions. See [data-model.md § Validation Rules](data-model.md#validation-rules). Satisfies SC-001.

- [x] T002 [P] [US1/US2/US3] E2e test for bar chart presence in `tests/e2e/comparison-page-breakdown-bar.spec.ts` — select 2+ preschools, navigate to comparison page, assert each card contains an SVG element (bar chart) with pattern fills, a legend with category labels and percentages, and that the SVG is `aria-hidden="true"`. Also assert no bar chart appears for cards with no data. Use e2e helpers from `tests/e2e/helpers.ts`. See [plan.md § Step 6](plan.md#step-6-write-e2e-test-for-bar-chart-presence). Satisfies SC-001, SC-002, SC-005.

### Implementation

- [x] T003 [US1/US2/US3] Add `chartIndex: number` to the `Props` interface in `src/components/preact/ComparisonCard.tsx` (~line 12). See [plan.md § Step 1](plan.md#step-1-add-chartindex-prop-to-comparisoncard) and [research.md § R2](research.md#r2-svg-pattern-id-uniqueness-strategy). Satisfies FR-002.

- [x] T004 [US1/US2/US3] Compute `chartIndex` in `src/components/preact/ComparisonView.tsx` (~line 248, inside `questions.map()` → `selectedSurveys.map()`) as `questionIdx * selectedSurveys.length + surveyIdx + 1000` and pass it as a prop to `<ComparisonCard>`. Add index params to both `.map()` callbacks. See [plan.md § Step 2](plan.md#step-2-compute-and-pass-chartindex-from-comparisonview) and [data-model.md § Chart Index](data-model.md#chart-index). Satisfies FR-001, FR-002.

- [x] T005 [US1/US2/US3] Render inline agree-share bar in `src/components/preact/ComparisonCard.tsx`: (a) add `import { renderPatternContent, RESPONSE_SERIES, TILE_SIZE } from '@/lib/chart-patterns'`, (b) in the "has data" return branch, render an inline SVG bar with only the two agree categories (completely agree + partly agree) using `RESPONSE_SERIES.slice(0, 2)` for pattern definitions, wrapped in `<div aria-hidden="true">`, after the main clickable `<div>` and before the sr-only `<div class="sr-only">`, (c) render a 2-item legend below the bar with self-contained swatch SVGs (each swatch owns its own `<defs>` to avoid cross-SVG paint server issues in WebKit), (d) do NOT render in the "no data" early return. See [plan.md § Step 3](plan.md#step-3-render-inline-agree-share-bar-in-comparisoncard) and [research.md § R3](research.md#r3-layout-integration--where-does-the-bar-chart-appear-within-the-card). Satisfies FR-001, FR-002, FR-003, FR-004, FR-006, FR-007.

- [x] T006 [US3] Verify the existing sr-only `<table>` in `src/components/preact/ComparisonCard.tsx` (~line 170) is untouched — no lines added or removed from the `<div class="sr-only">` block. See [plan.md § Step 4](plan.md#step-4-verify-sr-only-table-is-unchanged). Satisfies FR-005, SC-004.

**Checkpoint**: All tests (T001, T002) should now PASS. Bar charts visible on comparison page. Sr-only table intact.

---

## Phase 2: Validation & Polish

**Purpose**: Full quality gate and manual verification.

- [x] T007 Run `pnpm validate` — full quality gate (lint, format, check, test, build, e2e, Lighthouse). Confirms FR-008 (i18n), FR-009 (bundle budget), SC-003 (axe-core), SC-006 (page weight ≤ 100 KB). See [quickstart.md § Validation](quickstart.md#validation).

- [x] T008 Manual verification per [plan.md § Step 8](plan.md#step-8-manual-verification): (1) `pnpm dev` → `/forskoleguiden/sv/` → select 2+ preschools → comparison page → bar charts with legend visible, (2) highlight toggle dims/highlights bar chart with card, (3) `/forskoleguiden/ar/` → RTL layout correct, (4) DevTools at 320 px → no overflow. Satisfies SC-002, SC-005, SC-007.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Tests (T001, T002)**: No dependencies — write first, must fail
- **Phase 1 Implementation (T003–T006)**: T003 before T004 (prop must exist before it's passed); T003 before T005 (prop + import needed); T004 can be parallel with T005 only if T003 is done
- **Phase 2 (T007, T008)**: Depends on all Phase 1 tasks complete

### Within Phase 1

```text
T001 ─┐
      ├── (parallel, write tests first)
T002 ─┘
      │
      ▼
    T003 (add chartIndex prop)
      │
      ├──► T004 (compute chartIndex in ComparisonView)
      │
      └──► T005 (render DetailsBarChart in ComparisonCard)
             │
             ▼
           T006 (verify sr-only table unchanged)
```

### Parallel Opportunities

- T001 and T002 can be written in parallel (different files)
- T004 and T005 can be done in parallel after T003 (different files: ComparisonView.tsx vs ComparisonCard.tsx)
- T007 and T008 are sequential (validate before manual check)

---

## Story ↔ Task Traceability

| Story | Tasks | Acceptance |
|-------|-------|------------|
| US1 — Bar chart per card | T001, T003, T004, T005 | Bar chart with proportional segments visible |
| US2 — Legend labels | T002, T005 | Legend below bar with 5 categories + percentages |
| US3 — Screen-reader access | T002, T005, T006 | SVG `aria-hidden`, sr-only table intact |

## FR ↔ Task Traceability

| Requirement | Tasks |
|-------------|-------|
| FR-001 (bar chart display) | T004, T005 |
| FR-002 (pattern fills) | T003, T004, T005 |
| FR-003 (legend) | T005 |
| FR-004 (aria-hidden) | T005 |
| FR-005 (sr-only table intact) | T006 |
| FR-006 (no data = no chart) | T005 |
| FR-007 (responsive) | T005 |
| FR-008 (i18n/RTL) | T007, T008 |
| FR-009 (bundle budget) | T007 |
