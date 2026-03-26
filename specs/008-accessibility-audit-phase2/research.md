# Research: Accessibility Audit (Phase 2)

**Feature**: 008-accessibility-audit-phase2
**Date**: 2026-03-26

## Decision Log

### 1. Test file organization strategy

**Decision**: Extend existing test files for axe-core and keyboard navigation; create one new file for screen reader labeling assertions.

**Rationale**: The existing `accessibility-axe-core.spec.ts` already covers Swedish and Arabic pages — adding English tests and about-page tests to this file maintains the "fewer, longer tests" principle. Similarly, `keyboard-navigation-focus-ring.spec.ts` already tests Phase 1 keyboard flows — extending it with Phase 2 element tests is natural. Screen reader labeling (ARIA landmarks, live regions, `lang` attributes) is a distinct behavioral concern not covered by either existing file, so a new file `accessibility-phase2-screen-reader.spec.ts` is appropriate.

**Alternatives considered**:
- One monolithic new test file for all Phase 2 accessibility → Rejected: duplicates axe-core scanning patterns already established; violates organize-by-concern principle.
- Separate files per locale → Rejected: creates fragmentation; locale is a parameter, not a concern boundary.

### 2. About page (`/om/`) coverage

**Decision**: Exclude about page from the accessibility audit scope. Add tests for about pages when the routes are implemented.

**Rationale**: The about page routes (`/sv/om/`, `/en/om/`, `/ar/om/`) do not currently exist in the codebase. The `src/pages/` directories for all three locales contain only `index.astro`, `forskola/[id].astro`, and `jamfor/index.astro`. Testing non-existent pages would produce false failures. The spec mentions 4 page types (directory, detail, comparison, about) but the about page is not yet built. The 12-combination matrix reduces to 9 (3 locales × 3 page types).

**Alternatives considered**:
- Block this feature until about pages are built → Rejected: delays valuable accessibility coverage for existing pages.
- Add placeholder skip-tests for about pages → Rejected: skip-tests create noise and maintenance burden; better to add when the routes exist.

### 3. Language switcher keyboard interaction model

**Decision**: Test the `<details>`/`<summary>` disclosure pattern, not direct link Tab navigation.

**Rationale**: The language switcher uses a `<details>` element with a `<summary>` toggle. The links are hidden until the dropdown is opened. Keyboard flow is: Tab to `<summary>` → Enter/Space to open → Tab to locale links → Enter to navigate. This differs from the spec's assumption of "Tab to each link in sequence" — the links are inside a disclosure widget. Tests must open the dropdown first.

**Alternatives considered**:
- Test only the closed state (summary reachable by Tab) → Rejected: doesn't verify link operability.
- Assume flat link list → Rejected: doesn't match the actual DOM structure.

### 4. Queue link "opens in new window" indication

**Decision**: Verify via `target="_blank"` attribute assertion and descriptive link text. No separate `aria-label` needed if the link text is descriptive.

**Rationale**: The queue link renders `t('detail.queueLink', locale)` as link text (e.g., "Anmäl dig till kö" / "Register for queue") with `target="_blank"` and `rel="noopener noreferrer"`. WCAG 2.1 SC 3.2.5 (Changes on Request, AAA) recommends indicating new windows, but this is AAA level. The descriptive link text satisfies the spec's FR-012 requirement. The adjacent queue icon is `aria-hidden="true"`, which is correct.

**Alternatives considered**:
- Add `aria-label` with "(opens in new window)" suffix → Rejected: creates redundant accessible name; the visible text is already descriptive. Can be added later if user testing indicates confusion.

### 5. Share feedback auto-dismiss timing

**Decision**: Accept the existing 2500ms auto-dismiss as meeting the ≥2 second minimum specified in FR-013.

**Rationale**: `ShareFeedback.tsx` uses `AUTO_DISMISS_MS = 2500` (2.5 seconds) for the "copied" state only. This exceeds the spec's 2-second minimum. Warning and error states do NOT auto-dismiss (they require manual closure or persist), which is correct for important feedback. The test should assert the auto-dismiss timing by verifying the feedback is visible for at least 2 seconds.

**Alternatives considered**:
- Increase to 4000ms → Rejected: 2500ms is sufficient for screen reader announcement; longer delays feel sluggish for sighted users.

### 6. Hydration guard strategy for new tests

**Decision**: Reuse existing hydration guard patterns — wait for `aria-pressed` on CompareButton, `data-testid="comparison-scroll"` for ComparisonView, and `data-testid="header-language-toggle"` for the language switcher.

**Rationale**: Consistent with existing test patterns in `accessibility-axe-core.spec.ts` and `keyboard-navigation-focus-ring.spec.ts`. Preact `client:only` islands are not present in the DOM until hydration completes, so waiting for their elements serves as a natural hydration guard.

**Alternatives considered**:
- `page.waitForLoadState('networkidle')` → Rejected: doesn't guarantee island hydration; existing tests don't use this pattern.

### 7. English locale test locators

**Decision**: Use English i18n strings for button/heading locators in English tests (e.g., `{ name: /Compare/ }` instead of `{ name: /Jämför/ }`).

**Rationale**: Locators must match the rendered text, which uses `t(key, 'en')` for English pages. The existing Arabic tests already use Arabic strings for locators (e.g., `{ name: /قارن/ }`). This is consistent with the locale-aware testing pattern.

**Alternatives considered**:
- Use `data-testid` for all locators → Rejected: some elements (like sort buttons) don't have test IDs and are identified by role + name. Mixing approaches is fine as long as each locator is reliable.
