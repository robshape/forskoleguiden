# [TASK001] - Implement Step 3.1-3.3 layout shell

**Status**: Completed
**Added**: 2026-02-26
**Updated**: 2026-03-02

## Original Request

Track unfinished work for implementation plan Steps 3.1-3.3: create BaseLayout, Nav, and Footer; move Tailwind v4 global stylesheet wiring from the temporary root placeholder into BaseLayout.

## Thought Process

Global Tailwind CSS is temporarily imported in `src/pages/index.astro` to ensure CSS enters the module graph immediately. Steps 3.1-3.3 are the intended integration point for persistent structure: BaseLayout should import global CSS, and Nav/Footer should be composed in that layout for all locale pages.

## Implementation Plan

- Implement Step 3.1: create BaseLayout for localized pages and move global CSS import into the layout.
- Implement Step 3.2: add Nav component and include it in BaseLayout header.
- Implement Step 3.3: add Footer component with attribution and include it in BaseLayout footer.
- Confirm all routed pages receive expected Tailwind styles and remove redundant per-page global CSS imports.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                                         | Status   | Updated    | Notes                                                                     |
| --- | --------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------- |
| 1.0 | Add e2e shell test for semantic landmarks (Phase 1) | Complete | 2026-03-02 | Added `tests/e2e/layout-shell.spec.ts` with `html/header/main/footer`     |
| 1.1 | Create BaseLayout for locale pages (Step 3.1)       | Complete | 2026-03-02 | Added `src/layouts/BaseLayout.astro` with locale-aware document shell     |
| 1.2 | Move global stylesheet import into BaseLayout       | Complete | 2026-03-02 | `/sv/` now uses BaseLayout; stylesheet wiring is single-source in layout  |
| 1.3 | Create and wire Nav in BaseLayout (Step 3.2)        | Complete | 2026-03-02 | Added `Nav.astro` later hardened a11y semantics and localized placeholder |
| 1.4 | Create and wire Footer in BaseLayout (Step 3.3)     | Complete | 2026-03-02 | Footer attribution and source-link runtime contract validated on `/sv/`   |
| 1.5 | Apply minimal semantic shell update on `/sv/`       | Complete | 2026-03-02 | Added missing semantic landmarks on current page shell                    |
| 1.6 | Validate shell via targeted e2e commands            | Complete | 2026-03-02 | Fail-first run + passing rerun recorded in progress log                   |

## Progress Log

### 2026-02-26

- Created task from review feedback to track Step 3.1-3.3 layout shell work and CSS integration.
- Confirmed current temporary state: stylesheet is imported in `src/pages/index.astro` until BaseLayout/Nav/Footer are introduced.

### 2026-03-02

- Created new targeted e2e test `tests/e2e/layout-shell.spec.ts` for Phase 1 shell criteria.
- Performed fail-first run with `pnpm test:e2e tests/e2e/layout-shell.spec.ts`; first run failed because `/sv/` was missing a `<header>` landmark.
- Applied a minimal semantic shell update on `src/pages/sv/index.astro` (added `header`, `main`, `footer`) without starting Step 3.2/3.3 component extraction.
- Re-ran with `pnpm test:e2e tests/e2e/layout-shell.spec.ts` and confirmed pass.
- Re-ran with `pnpm build && pnpm test:e2e tests/e2e/layout-shell.spec.ts` and confirmed pass.
- Completed Phase 2 by creating `src/layouts/BaseLayout.astro` with `title`/`locale` props, full document structure, `lang`, conditional RTL `dir`, meta tags, and semantic `header/main/footer`.
- Added `src/styles/global.css` import in `BaseLayout` to establish layout-level stylesheet wiring ahead of Phase 3 page migration.
- Phase 3 complete: migrated `src/pages/sv/index.astro` to `BaseLayout` with `locale="sv"` and `title="Förskoleguiden"`.
- Preserved visible shell text via layout slots (`header`, `main`, `footer`) without implementing Step 3.2/3.3 components.
- Added fail-first unit coverage in `tests/unit/sv-index-layout.test.ts` to assert BaseLayout composition contract for `/sv/`.
- Addressed review feedback for Step 3.1 hardening: restored favicon link in `BaseLayout` and switched stylesheet import to `@/styles/global.css` alias.
- Refined `tests/unit/sv-index-layout.test.ts` to avoid brittle source-format coupling and removed step-number wording from test descriptions.
- Removed redundant dead-code null guard from `tests/e2e/layout-shell.spec.ts`.
- Verified fixes with fail-first then green validation: `pnpm test`, `pnpm lint`, `pnpm lint:md`, `pnpm format`, and `pnpm build && pnpm test:e2e tests/e2e/layout-shell.spec.ts`.

### 2026-03-02 (later)

- Completed Step 3.2 via dedicated implementation plan (`docs/plans/implement-step-3-2-navigation-shell-plan.md`) with all three phases closed.
- Added fail-first nav contracts in `tests/unit/sv-index-layout.test.ts` and `tests/e2e/layout-shell.spec.ts`.
- Implemented `src/components/astro/Nav.astro` with locale home link, Malmö active indicator, disabled Stockholm/Göteborg semantics (`aria-disabled="true"`), static year `2025`, and visible language placeholder text.
- Wired `Nav` into `src/layouts/BaseLayout.astro` and removed duplicate page-level header slot content from `src/pages/sv/index.astro`.
- Completed Phase 3 validation with green gates: `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`, and `pnpm build && CI=1 pnpm test:e2e tests/e2e/layout-shell.spec.ts`.
- Remaining scope in TASK001: Step 3.3 footer component extraction and attribution wiring.

### 2026-03-02 (review hardening follow-up)

- Applied review-driven accessibility and maintainability patch for Step 3.2.
- Replaced invalid `aria-disabled` on non-interactive spans with disabled `<button>` controls for Stockholm and Göteborg in `src/components/astro/Nav.astro`.
- Switched city indicator markup to `<ul>/<li>` semantics for machine-readable nav structure.
- Localized language placeholder via `t('nav.languagePlaceholder', locale)` and added matching keys to `src/i18n/sv.json`, `src/i18n/en.json`, and `src/i18n/ar.json`.
- Localized nav landmark labeling by switching `Nav.astro` `aria-label` to `t('nav.ariaLabel', locale)` and adding `nav.ariaLabel` keys to all locale files.
- Relaxed brittle header composition assertion in `tests/unit/sv-index-layout.test.ts` to assert Nav presence inside `<header>` without requiring sole-child structure.
- Consolidated duplicated e2e shell checks into one longer scenario in `tests/e2e/layout-shell.spec.ts` (single `page.goto('/sv/')`).
- Verified fail-first then green with: `pnpm test tests/unit/sv-index-layout.test.ts` (fail then pass), `CI=1 pnpm test:e2e tests/e2e/layout-shell.spec.ts` (fail then pass), plus required gates `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`.
- Recorded explicit red-run evidence for Step 3.3 pre-implementation state: command `pnpm test tests/unit/sv-index-layout.test.ts` failed on Footer contract test `imports Footer and composes it with locale prop in BaseLayout footer`; `BaseLayout` still used `<slot name="footer" />`.
- Ran `pnpm test tests/unit/sv-index-layout.test.ts`; targeted file passed (1/1) with Footer contract test `imports Footer and composes it with locale prop in BaseLayout footer` green, confirming Phase 2 is green for layout footer wiring.

### 2026-03-02 (Phase 3 completion)

- Extended `tests/e2e/layout-shell.spec.ts` with Step 3.3 footer runtime assertions for visible attribution text and Malmö source link `href` on `/sv/`.
- Ran targeted red validation: `CI=1 pnpm test:e2e tests/e2e/layout-shell.spec.ts` (failed while `playwright` preview served stale build output).
- Rebuilt and re-ran targeted validation: `pnpm build && CI=1 pnpm test:e2e tests/e2e/layout-shell.spec.ts` (passed).
- Finalized memory-bank/task records to close Step 3.3 and complete `TASK001`.
