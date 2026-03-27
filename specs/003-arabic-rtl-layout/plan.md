# Implementation Plan: Arabic RTL Layout

**Branch**: `003-arabic-rtl-layout` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-arabic-rtl-layout/spec.md`

## Summary

Adapt the existing Arabic locale pages so they feel intentionally right-to-left without changing product scope, data flow, or the current stacked comparison model. The work is a component-level presentation pass across the shared shell, directory, detail page, and comparison experience. The plan favors logical CSS properties and narrowly scoped `rtl:` overrides over duplicated markup. No new routes, state stores, or data entities are introduced. Verification centers on Arabic interaction and geometry checks plus regression coverage for Swedish and English.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode via `astro/tsconfigs/strict`)
**Primary Dependencies**: Astro 6.0.4 (static output), Preact 10.29.0, nanostores 1.1.1, Tailwind CSS 4.2.1 (via `@tailwindcss/vite`)
**Storage**: Static JSON at build time (`data/malmo/`); existing `sessionStorage` compare state only
**Testing**: Vitest 4.1.0 (unit + post-build), Playwright 1.58.2 (e2e), `@axe-core/playwright` (a11y)
**Target Platform**: Static site on GitHub Pages; mobile-first, primary viewport iPhone 17 (393 px)
**Project Type**: Static web application (Astro MPA with Preact islands)
**Performance Goals**: Lighthouse accessibility ≥ 0.95, performance ≥ 0.90, page weight ≤ 100 KB uncompressed per page
**Constraints**: No new runtime data fetching, no new state model, no new locale routing work, Arabic keeps Western numerals, comparison stays vertically stacked
**Scale/Scope**: Shared shell plus 4 page types across 3 locales, with Arabic-specific adjustments and Swedish/English regression protection

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                  | Status   | Evidence                                                                                                                                     |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Performance by Default  | **PASS** | No new islands or data fetches. Changes are CSS-class and markup-orientation adjustments on existing components.                             |
| II. Accessibility First    | **PASS** | RTL work includes keyboard/accessibility regression checks and extends Arabic page audits rather than treating layout as visual-only polish. |
| III. Data Integrity        | **PASS** | No preschool data, scoring logic, compare-state schema, or locale-routing contracts change.                                                  |
| IV. Testing Standards      | **PASS** | Adds focused Arabic RTL e2e coverage and extends existing accessibility/regression suites.                                                   |
| V. Architecture Discipline | **PASS** | Work stays in shared Astro/Preact components already responsible for shell, directory, detail, and comparison presentation.                  |
| VI. Internationalization   | **PASS** | Directly improves the Arabic locale while keeping routing and translation behavior intact.                                                   |
| VII. Privacy by Design     | **PASS** | No analytics, cookies, or external requests added.                                                                                           |

**Gate result: ALL PASS** — no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-arabic-rtl-layout/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── layouts/
│   └── BaseLayout.astro                        # REVIEW / POSSIBLE MODIFY — root `dir` context and shell container behavior
├── components/
│   ├── astro/
│   │   ├── Nav.astro                           # MODIFY — header spacing/alignment mirroring
│   │   ├── Footer.astro                        # REVIEW / POSSIBLE MODIFY — attribution alignment already partly logical
│   │   ├── Breadcrumb.astro                    # REVIEW — wrapper around client breadcrumb link
│   │   ├── PreschoolCard.astro                 # MODIFY — directory card content, score block, and action balance
│   │   ├── QuestionCard.astro                  # MODIFY — detail card text, chart footer, response alignment
│   │   └── pages/
│   │       ├── DirectoryPage.astro             # MODIFY — directory header/toolbar flow in Arabic
│   │       ├── DetailPage.astro                # MODIFY — metadata row, compare action, section alignment
│   │       ├── ComparisonPage.astro            # REVIEW — page-level shell and heading spacing
│   │       └── AboutPage.astro                 # REVIEW — confirm shell inherits RTL cleanly
│   └── preact/
│       ├── BreadcrumbLink.tsx                  # MODIFY — mirror back-direction cue for RTL
│       ├── SortToggle.tsx                      # MODIFY — Arabic sort-control ordering and alignment
│       ├── CompareButton.tsx                   # MODIFY — icon/label balance in RTL
│       ├── CompareTray.tsx                     # MODIFY — tray text/actions order and alignment in RTL
│       ├── ComparisonView.tsx                  # MODIFY — selected-count block and stacked comparison alignment
│       ├── ComparisonCard.tsx                  # MODIFY — row content and score column alignment in RTL
│       └── ComparisonSummary.tsx               # MODIFY — summary text alignment and list flow in RTL

tests/
├── e2e/
│   ├── helpers.ts                              # MODIFY — add Arabic URL helpers/constants if needed
│   ├── accessibility-axe-core.spec.ts          # MODIFY — include Arabic detail/comparison coverage for this feature
│   ├── responsive-context-adaptation.spec.ts   # MODIFY — extend geometry coverage for Arabic RTL layouts where appropriate
│   └── arabic-rtl-layout.spec.ts               # NEW — focused RTL shell/directory/detail/comparison behavior checks
└── unit/
    └── existing tests                          # UNCHANGED — no new persistent data or utility model introduced
```

**Structure Decision**: Keep the work inside the existing shared components that already own layout and interaction. Do not fork separate Arabic-only components. Prefer logical utility classes and scoped RTL variants so Swedish and English continue to flow through the same component tree.

## Implementation Phases

### Phase 0 — Research and Layout Strategy

1. Confirm which current classes already use logical properties versus physical left/right utilities.
2. Identify where Arabic needs true semantic reversal rather than simple logical alignment.
3. Lock the verification approach for mirrored directional cues, mobile overflow, and Arabic accessibility audits.

### Phase 1 — Component Adaptation Design

1. Shell adaptation
2. Directory adaptation
3. Detail-page adaptation
4. Comparison adaptation
5. Regression and a11y test design

### Phase 2 — Delivery Sequence

1. Update shell and shared page wrappers first so Arabic has a stable baseline.
2. Adapt directory and detail components next because they expose the main directional/UI issues.
3. Adapt comparison components after that, preserving the existing stacked layout.
4. Add and extend e2e coverage.
5. Run the full validation gate.

## Risk Register

| Risk                                                                     | Why it matters                                                    | Mitigation                                                                                             |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| RTL fixes leak into LTR locales                                          | Shared components serve all locales                               | Use logical properties first; keep `rtl:` overrides scoped; re-run Swedish/English regression coverage |
| Back arrow appears visually unchanged in Arabic                          | The icon lives in a hydrated breadcrumb component                 | Use a deterministic mirrored cue and test the rendered orientation explicitly                          |
| Arabic text alignment passes visually but breaks keyboard/a11y semantics | Layout-only changes can accidentally affect focus order or labels | Extend axe coverage and keep focus/interaction tests in Arabic                                         |
| Comparison layout drifts into a redesign                                 | Spec explicitly keeps the current stacked model                   | Limit work to alignment, ordering, spacing, and directional cue changes                                |
| Numeric rendering becomes inconsistent                                   | Arabic spec now explicitly keeps Western numerals                 | Avoid numeral-conversion logic; treat number display as an invariant                                   |

## Open Implementation Notes

- `Footer.astro` already uses logical padding and RTL text alignment; treat it as verification-first rather than guaranteed modification.
- `BreadcrumbLink.tsx` is the likely source of the mirrored back-direction cue and should be tested using computed orientation rather than screenshots alone.
- `ComparisonView.tsx` currently uses a physical left border for the single-selection callout; Arabic likely needs a logical or scoped mirrored treatment there.
- `QuestionCard.astro` and `ComparisonCard.tsx` already expose score/value alignment decisions that are likely to need explicit RTL handling.
