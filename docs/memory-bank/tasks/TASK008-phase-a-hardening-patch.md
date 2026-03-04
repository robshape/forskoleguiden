# [TASK008] - Apply Phase A hardening patch

**Status**: Completed
**Added**: 2026-03-02
**Updated**: 2026-03-02

## Original Request

Apply review-feedback hardening updates after Phase A completion:

- Align nav container width with shell container width.
- Remove global anchor-hover underline side effects.
- Make focus-visible e2e assertions robust to future tab-order changes.
- Use logical utilities for Nav alignment.
- Update language placeholder element semantics.
- Expand primary color token scale for upcoming UI states.
- Split oversized layout/nav/footer contracts into modular test files.
- Move reusable test helpers to shared helper module and reduce repeated file reads.
- Document color-token coupling in e2e focus assertion.

## Thought Process

This patch is a focused quality hardening pass, not a feature expansion. The goal is to remove latent maintenance and UX risks before Step 4 grows page interactivity and visual complexity, while keeping scope limited to shell styling and test architecture.

## Implementation Plan

- Update `Nav.astro` container/alignment/placeholder semantics and keep behavior unchanged.
- Update `global.css` token scale and remove global anchor hover rule.
- Harden `layout-shell-accessibility.spec.ts` focus behavior and annotate color coupling.
- Split `sv-index-layout.test.ts` into `base-layout`, `nav`, and `footer` suites.
- Add reusable helper module for Astro source parsing and class-token assertions.
- Re-run required repository quality gates.

## Progress Tracking

**Overall Status**: Completed - 100%

### Subtasks

| ID  | Description                      | Status   | Updated    | Notes                                                                           |
| --- | -------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------- |
| 8.1 | Update Nav shell hardening       | Complete | 2026-03-02 | `max-w-content`, `text-start`, `ms-auto`, `<span>` placeholder                  |
| 8.2 | Update global style tokens/rules | Complete | 2026-03-02 | Added `primary-50` and `primary-700`; removed global `a:hover` rule             |
| 8.3 | Harden e2e focus assertions      | Complete | 2026-03-02 | Bounded tab loop + rgb↔token comment in `layout-shell-accessibility.spec.ts`    |
| 8.4 | Split and modularize unit tests  | Complete | 2026-03-02 | Replaced monolith with `base-layout`, `nav`, `footer` tests + helper module     |
| 8.5 | Run lint/format/test/build gates | Complete | 2026-03-02 | `pnpm lint`, `pnpm lint:md`, `pnpm format`, `pnpm test`, `pnpm build` all green |

## Progress Log

### 2026-03-02

- Implemented Nav hardening in `src/components/astro/Nav.astro`:
  - `max-w-5xl` → `max-w-content`.
  - `ltr:ml-auto rtl:mr-auto` → `ms-auto`.
  - `ltr:text-left rtl:text-right` → `text-start`.
  - language placeholder `<p>` → `<span>`.
- Updated `src/styles/global.css`:
  - Added `--color-primary-50` and `--color-primary-700`.
  - Removed global `a:hover { @apply underline; }` rule.
- Hardened `tests/e2e/layout-shell-accessibility.spec.ts`:
  - Kept keyboard interaction model while removing brittle second-tab assumption.
  - Added bounded tab loop until footer link focus.
  - Added comment mapping `rgb(37, 99, 235)` to `--color-primary-600`.
- Replaced `tests/unit/sv-index-layout.test.ts` with modular files:
  - `tests/unit/base-layout.test.ts`
  - `tests/unit/nav.test.ts`
  - `tests/unit/footer.test.ts`
  - `tests/unit/helpers/astro-source.ts`
- Reduced repeated reads via module-level source constants in unit tests.
- Ran and passed required gates:
  - `pnpm lint`
  - `pnpm lint:md`
  - `pnpm format`
  - `pnpm test`
  - `pnpm build`
