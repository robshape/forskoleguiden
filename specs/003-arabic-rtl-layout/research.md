# Research: Arabic RTL Layout

**Branch**: `003-arabic-rtl-layout` | **Date**: 2026-03-24

## Research Summary

No additional NEEDS CLARIFICATION items were identified during planning. The spec already resolves the three product questions that materially affect implementation: the comparison layout remains stacked, Arabic keeps Western numerals, and the detail-page back cue is mirrored for RTL. This document records the technical decisions needed to implement those outcomes cleanly in the current codebase.

---

## Decision 1: Prefer Logical Utilities First, `rtl:` Only for Meaningful Reversal

**Decision**: Use logical spacing/alignment utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`) as the default adaptation strategy. Use `rtl:` overrides only when the visual meaning must change, such as mirrored borders, icon rotation, or content order.

**Rationale**:

- Shared components serve Swedish, English, and Arabic. Logical properties reduce the chance that Arabic-specific fixes leak into LTR layouts.
- Several components already partially follow this pattern (`Footer.astro`, parts of `PreschoolCard.astro`), so this extends an existing convention rather than introducing a new styling model.
- Tailwind v4 explicitly supports RTL variants and logical properties, so the required behavior is available without a separate stylesheet.

**Alternatives considered**:

- Duplicate Arabic-only component variants: Rejected — too much markup drift for a presentational adaptation.
- Heavy use of `rtl:flex-row-reverse` and ad hoc overrides everywhere: Rejected — harder to reason about and more likely to regress Swedish/English.

---

## Decision 2: Keep the Existing Stacked Comparison Model

**Decision**: Preserve the current vertically stacked comparison experience and adapt only alignment, ordering, spacing, and directional cues for Arabic.

**Rationale**:

- The current product no longer uses a horizontally scrolling comparison table; the implementation is already a stacked question-by-question experience.
- The clarification session explicitly chose this option, which keeps Step 2 focused on RTL presentation rather than reworking the comparison interaction model.
- Existing responsive tests already enforce the no-horizontal-overflow behavior for the stacked layout; those tests can be extended rather than replaced.

**Alternatives considered**:

- Reintroduce a more table-like RTL comparison layout: Rejected — out of scope and at odds with the current codebase and spec clarification.

---

## Decision 3: Keep Western Numerals in Arabic UI

**Decision**: Continue rendering numeric values and percentages using Western numerals (`0-9`) on Arabic pages.

**Rationale**:

- The clarification session made this an explicit product decision.
- Existing score, percentage, and chart rendering already use plain numbers and `%` output; keeping that invariant avoids introducing formatting divergence across components and tests.
- This reduces risk in areas that already rely on numerical text comparisons in e2e tests and a11y fallbacks.

**Alternatives considered**:

- Convert to Arabic-Indic numerals throughout: Rejected — adds localization and test complexity without being required by the spec.
- Mixed numeral rendering per component: Rejected — inconsistent and harder to explain.

---

## Decision 4: Mirror the Breadcrumb Directional Cue with CSS, Not Alternate Copy

**Decision**: Mirror the existing back-navigation cue visually in RTL rather than replacing it with separate text-only wording or a different icon asset.

**Rationale**:

- `BreadcrumbLink.tsx` already owns the breadcrumb link icon and label. Mirroring the cue there keeps the change localized.
- Reusing the same icon preserves familiarity across locales while still matching Arabic directional expectations.
- Repository memory notes that Tailwind rotate utilities may expose orientation through the computed `rotate` property rather than `transform`, which informs how Playwright should verify the mirrored state.

**Alternatives considered**:

- Use a separate Arabic-only SVG asset: Rejected — unnecessary duplication.
- Remove the directional cue and rely on text only: Rejected — clarification session explicitly chose mirrored direction rather than neutral text-only treatment.

---

## Decision 5: Verification Should Be Contract-Based, Not Screenshot-Led

**Decision**: Validate RTL behavior with focused Playwright geometry/orientation assertions and expanded axe coverage, not just screenshots.

**Rationale**:

- Existing e2e coverage already uses geometry checks and DOM-level assertions for spacing, overflow, and structure. This repo’s testing style is contract-heavy, not screenshot-heavy.
- Screenshots alone are too brittle for confirming mirrored alignment, action order, or interactive state.
- Arabic RTL work needs direct assertions on text alignment, element ordering, tray layout, and icon orientation.

**Alternatives considered**:

- Add only screenshot comparisons: Rejected — too coarse and fragile for this repo’s established testing style.
- Manual-only verification: Rejected — insufficient for preventing regressions in shared components.
