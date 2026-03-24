# Quickstart: Arabic RTL Layout

**Branch**: `003-arabic-rtl-layout` | **Date**: 2026-03-24

## Prerequisites

- Node.js ≥ 20.x, pnpm ≥ 9.x
- Workspace dependencies installed with `pnpm install`
- Multi-locale routes and the language switcher already exist and pass validation
- Arabic pages are already generated under `/ar/`

## Development Workflow

```sh
# Start the Astro dev server
pnpm dev

# Type-check Astro + TypeScript
pnpm check

# Run unit + e2e + post-build tests through the full gate
pnpm validate

# If iterating on browser behavior, run e2e tests directly
pnpm test:e2e
```

## Key Files

| File                                              | Action                   | Purpose                                                           |
| ------------------------------------------------- | ------------------------ | ----------------------------------------------------------------- |
| `src/layouts/BaseLayout.astro`                    | REVIEW / POSSIBLE MODIFY | Confirm shell container behavior under `dir="rtl"`                |
| `src/components/astro/Nav.astro`                  | MODIFY                   | Mirror header grouping and alignment where needed                 |
| `src/components/astro/Footer.astro`               | REVIEW / POSSIBLE MODIFY | Confirm attribution layout remains natural in Arabic              |
| `src/components/astro/pages/DirectoryPage.astro`  | MODIFY                   | Directory heading + toolbar flow in Arabic                        |
| `src/components/astro/PreschoolCard.astro`        | MODIFY                   | Directory card alignment, score block, and action placement       |
| `src/components/preact/SortToggle.tsx`            | MODIFY                   | Sort control balance and RTL readability                          |
| `src/components/preact/CompareButton.tsx`         | MODIFY                   | Button icon/label composition in RTL                              |
| `src/components/astro/pages/DetailPage.astro`     | MODIFY                   | Metadata, compare action, and section alignment                   |
| `src/components/preact/BreadcrumbLink.tsx`        | MODIFY                   | Mirror back-direction cue in Arabic                               |
| `src/components/astro/QuestionCard.astro`         | MODIFY                   | Detail card text/value alignment                                  |
| `src/components/astro/pages/ComparisonPage.astro` | REVIEW                   | Confirm page-level shell and heading alignment                    |
| `src/components/preact/ComparisonView.tsx`        | MODIFY                   | Selected-count callout and stacked section alignment              |
| `src/components/preact/ComparisonCard.tsx`        | MODIFY                   | Row content order and score-column alignment                      |
| `src/components/preact/ComparisonSummary.tsx`     | MODIFY                   | Summary list text alignment                                       |
| `src/components/preact/CompareTray.tsx`           | MODIFY                   | Tray action order and RTL layout                                  |
| `tests/e2e/helpers.ts`                            | MODIFY                   | Add Arabic URL helpers/constants if useful                        |
| `tests/e2e/accessibility-axe-core.spec.ts`        | MODIFY                   | Expand Arabic a11y coverage                                       |
| `tests/e2e/responsive-context-adaptation.spec.ts` | MODIFY                   | Extend geometry assertions where Arabic-specific behavior matters |
| `tests/e2e/arabic-rtl-layout.spec.ts`             | CREATE                   | Focused RTL behavior contract tests                               |

## Step-to-Detail Traceability

| Step                                | Primary outcome                                    | Requirement source                                                | Implementation detail source                                                                                                                    |
| ----------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Audit shell directionality       | Stable Arabic RTL shell baseline                   | [spec.md](spec.md#functional-requirements) FR-001, FR-002         | [research.md](research.md#decision-1-prefer-logical-utilities-first-rtl-only-for-meaningful-reversal)                                           |
| 2. Adapt directory components       | Native-feeling Arabic browsing and compare actions | [spec.md](spec.md#functional-requirements) FR-003, FR-004         | [data-model.md](data-model.md#component-behavior-matrix)                                                                                        |
| 3. Adapt detail-page directionality | Mirrored back cue and readable detail sections     | [spec.md](spec.md#functional-requirements) FR-005, FR-006, FR-013 | [research.md](research.md#decision-4-mirror-the-breadcrumb-directional-cue-with-css-not-alternate-copy)                                         |
| 4. Adapt comparison components      | RTL-aligned stacked comparison flow                | [spec.md](spec.md#functional-requirements) FR-007, FR-008, FR-012 | [research.md](research.md#decision-2-keep-the-existing-stacked-comparison-model), [data-model.md](data-model.md#derived-presentation-contracts) |
| 5. Extend Arabic verification       | RTL and a11y coverage with LTR regression safety   | [spec.md](spec.md#success-criteria-mandatory)                     | [research.md](research.md#decision-5-verification-should-be-contract-based-not-screenshot-led)                                                  |

## Implementation Steps (ordered)

### 1. Audit and adapt the shell

- Review `BaseLayout.astro`, `Nav.astro`, `Footer.astro`, and page wrappers.
- Replace any remaining physical left/right assumptions with logical alignment where possible.
- Keep Swedish and English behavior unchanged.

### 2. Fix Arabic directory flow

- Update `DirectoryPage.astro`, `PreschoolCard.astro`, `SortToggle.tsx`, and `CompareButton.tsx`.
- Preserve current directory behavior and sorting semantics.
- Confirm long Arabic names/addresses do not collide with score or compare controls.

### 3. Fix Arabic detail-page directionality

- Update `DetailPage.astro`, `BreadcrumbLink.tsx`, and `QuestionCard.astro`.
- Mirror the back cue for RTL.
- Keep percentages and score values in Western numerals.

### 4. Fix Arabic comparison flow

- Update `ComparisonPage.astro`, `ComparisonView.tsx`, `ComparisonCard.tsx`, `ComparisonSummary.tsx`, and `CompareTray.tsx`.
- Preserve the current stacked comparison layout.
- Align the selected-count block, summary, row content, and tray actions for Arabic reading order.

### 5. Add and update tests

- Create `tests/e2e/arabic-rtl-layout.spec.ts` for focused RTL assertions.
- Extend `tests/e2e/accessibility-axe-core.spec.ts` to include Arabic detail and comparison scans if not already covered.
- Extend or complement `tests/e2e/responsive-context-adaptation.spec.ts` with Arabic geometry checks where directionality matters.

### 6. Run the full quality gate

- Run `pnpm validate`
- Resolve any lint, format, type, e2e, or Lighthouse regressions before closing the feature

## Verification Checklist

After implementation, verify each item before closing the feature:

- [ ] Arabic directory shell reads naturally RTL on mobile and desktop
- [ ] Arabic footer attribution remains aligned and readable
- [ ] Arabic directory cards keep readable text, stable score badges, and clear compare-button states
- [ ] Arabic sort control is visible, operable, and semantically unchanged
- [ ] Arabic detail pages show a mirrored back cue and readable metadata/question sections
- [ ] Arabic percentages still use Western numerals (`0-9`)
- [ ] Arabic comparison stays vertically stacked with no unintended horizontal overflow
- [ ] Arabic compare tray actions remain visible and tappable on narrow mobile
- [ ] Expanded axe-core coverage reports zero new violations on Arabic pages
- [ ] Swedish and English regression coverage still passes
- [ ] `pnpm validate` exits successfully

## Notes

- Treat this as a presentation feature, not a routing or data-model feature.
- Do not introduce Arabic-only component forks unless a shared-component approach proves impossible.
- Geometry and DOM-contract assertions are preferred over screenshot-only approval for RTL verification.
