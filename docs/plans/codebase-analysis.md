# Codebase Analysis — Förskoleguiden

Date: 2025-04-07

## High Priority

### 1. Page route files duplicate boilerplate across locales

The three locale directories (`src/pages/sv/`, `src/pages/en/`, `src/pages/ar/`) each contain near-identical route files. For example, all three `forskola/[id].astro` files share the same `getStaticPaths`, props interface, and single-line `<DetailPage>` call — only the `locale` prop differs. The same pattern repeats for `index.astro` and `jamfor/index.astro`.

This means any structural change to a route (new prop, new layout wrapper, new data fetch) must be replicated across three files. As more locales are added, this scales linearly.

**Suggestion:** Astro's [dynamic routing with `[...locale]` rest params](https://docs.astro.build/en/guides/routing/#rest-parameters) or a shared `getStaticPaths` that emits all locale variants could reduce this to a single route file per page type. Alternatively, accept the duplication since the page-shell pattern already centralizes logic — the route files are thin wrappers.

### 2. `src/lib/data.ts` imports a type from `src/features/search/`

`data.ts` imports `SearchablePreschool` from `@/features/search/search` to type the return value of `getSearchablePreschools()`. This creates an upward dependency from the `lib` layer into the `features` layer, breaking the otherwise clean one-directional hierarchy (`lib → features → components`).

**Suggestion:** Move the `SearchablePreschool` type definition to `src/lib/types.ts` (or a new `src/lib/search-types.ts`), since it's a data shape rather than search-domain logic. The search feature module would then import the type from `lib` instead of defining it.

### 3. Two interpolation implementations with subtly different behavior

`src/lib/interpolate.ts` uses `replaceAll()` (replaces every occurrence of a placeholder), while `src/i18n/utils.ts` uses `replace()` with a regex (also replaces every match due to the `/g` flag, but uses a regex capture group). The two functions behave identically for normal inputs but differ in edge cases:

- `interpolate.ts` doesn't validate placeholder key characters (any string key works)
- `interpolateTemplate()` restricts keys to `[a-zA-Z0-9_]+`

The comment in `interpolate.ts` acknowledges this is intentional (runtime vs build-time boundary), but there's no test verifying parity.

**Suggestion:** Add a unit test asserting both functions produce identical output for the same template+params. This prevents silent drift if one implementation changes.

---

## Medium Priority

### 4. Inline SVG icons duplicated across components

SVG icon paths (search magnifying glass, close X, check mark, plus sign, map pin, building, people) are inlined directly in Preact and Astro components. The project already has `src/lib/icons.ts` with two shared icon paths (`CHECK_ICON_PATH`, `CHEVRON_DOWN_ICON_PATH`), but most icons remain as inline JSX/HTML.

Notable duplicates:

- **Search icon** (circle + diagonal line): appears in `SearchPanel.tsx` (twice: trigger button and input icon)
- **Close/X icon** (two diagonal lines): appears in `SearchPanel.tsx`, `ComparisonCard.tsx`
- **Check/Plus icons**: appear in `CompareButton.tsx`, `SearchResultList.tsx`
- **Lock icon**: inline in `CitySelector.astro`, not in `icons.ts`

**Suggestion:** Extract frequently repeated icon paths to `src/lib/icons.ts`. Use a small `<Icon>` helper or export path constants. Low urgency — current approach works but risks inconsistency if an icon path changes.

### 5. `SortToggle` manipulates DOM directly instead of using Preact state

`SortToggle.tsx` and `sort-helpers.ts` reorder server-rendered `<li>` elements by calling `listElement.appendChild()` directly. This breaks Preact's virtual DOM model — Preact doesn't know the DOM was mutated, which could cause issues if Astro's view transitions or other hydration changes are adopted later.

The comment explains this is intentional ("Reorders server-rendered list items in-place"), and it works well for the current Astro MPA architecture. Just be aware this pattern is fragile if the rendering model changes.

**Suggestion:** No immediate action required. Document this as a known constraint if view transitions are ever adopted.

### 6. Large `ComparisonView` labels prop object

`ComparisonView` receives 18 string labels through a single `labels` prop. This object is assembled manually in `ComparisonPage.astro` with 18 `t()` calls. Adding a new label requires changes in three places: the `ComparisonViewLabels` interface, the page shell, and the component usage.

**Suggestion:** Consider a pattern where the component receives `locale` and a thin translation subset, or group labels into sub-objects by concern (e.g. `shareLabels`, `emptyStateLabels`). This is a minor DX issue — the current approach is explicit and type-safe.

### 7. No test coverage thresholds enforced

`vitest.config.ts` has coverage configuration but explicitly notes "Thresholds deliberately not enforced — opt-in collection only." Unit test coverage is not gated in CI.

**Suggestion:** Consider adding minimum coverage thresholds for critical paths (`src/lib/scoring.ts`, `src/lib/share.ts`, `src/features/comparison/`) to prevent regressions. The existing test suite is thorough (24 unit test files, 29 e2e specs), so this is more about formalizing what's already well-covered.

### 8. `compareIds` shared via `window` global

The nanostore singleton is attached to `window.__forskoleguidenCompareStore__` to ensure independently-hydrated Preact islands share state. The comment explains the rationale well. However, this global is typed inline with a type assertion rather than declared in a `d.ts` file.

**Suggestion:** Add a `Window` interface augmentation in `src/env.d.ts` for `__forskoleguidenCompareStore__` to improve type safety and discoverability.

---

## Low Priority

### 9. `lz-string` is mature but old (last release 2019)

The project uses `lz-string@1.5.0` for URL share state compression. The code comment in `share.ts` already acknowledges this: "last release 2019. Functionally stable... Monitor for security advisories; consider lz-ts or fflate as drop-in replacements."

**Suggestion:** No action needed now. The dependency is pinned and the codebase has good test coverage for encoding/decoding. The existing comment is sufficient documentation.

### 10. `DetailsBarChart` is listed as Preact but never hydrated

The island inventory in the project instructions lists `DetailsBarChart` with hydration `(none, static render)`. It's a `.tsx` file that could technically be an Astro component. It works correctly as-is because `QuestionCard.astro` renders it server-side.

**Suggestion:** No action needed. The Preact/JSX syntax is convenient for SVG generation, and there's no runtime cost since it's not hydrated.

### 11. Missing `aria-label` on some interactive `<span>` elements

In `SearchResultList.tsx`, the compare toggle inside each search result is rendered as a `<span>` with `role="presentation"` and `aria-hidden="true"`. This is intentional (avoiding nested interactive elements inside `role="option"`), and accessible alternatives are provided via a separate `sr-only` button group below the listbox. The pattern is sound.

**Suggestion:** No action needed. The accessibility pattern is well-implemented with the dual-rendering approach.

### 12. `data.ts` caches `getSearchablePreschools()` but not other loaders

`getSearchablePreschools()` caches its result in a module-level variable, but `getAllPreschoolSurveys()` and `getPreschoolIndex()` read from disk on every call. Since these run at build time only (Astro static output), the performance impact is negligible — Astro's own caching handles repeated calls efficiently.

**Suggestion:** No action needed. Build-time performance is not a concern at current scale (~100 preschools).

---

## Things That Don't Need Changing

These areas are well-implemented and shouldn't be modified:

- **Architectural consistency**: Clean MPA + islands architecture used consistently. Astro for static content, Preact only for interactivity. No mixed patterns.
- **Separation of concerns**: `lib/` for utilities, `features/` for domain logic, `components/` for UI. Clean one-directional dependency flow (no circular imports).
- **State management**: nanostores + sessionStorage pattern is appropriate for the use case. SSR-safe guards are correctly applied.
- **Error handling**: Appropriate for a static site. `data.ts` throws with context (file path, operation), `share.ts` returns `null` on decode failure, `state.ts` warns and degrades gracefully.
- **CI/CD pipeline**: Comprehensive quality gates (lint, format, typecheck, unit, build, post-build, e2e, Lighthouse). Reusable workflow pattern avoids duplication.
- **Testing**: 24 unit tests, 29 e2e specs, 2 post-build checks, Lighthouse audits, axe-core accessibility tests. BDD-style naming throughout. Shared test helpers avoid duplication.
- **Dependency hygiene**: All exact-pinned, 3-day release age gate, Dependabot with smart retry. No duplicate-purpose libraries.
- **Accessibility**: Pattern fills for color-blind safety, ARIA attributes on all interactive elements, keyboard navigation tested in e2e, `prefers-reduced-motion` respected.
- **i18n**: Clean three-locale setup with enforced key parity (unit tested). RTL support for Arabic. Locale-aware URL routing.
- **Code formatting**: Consistent single-quote, no-semicolon style enforced by Prettier + ESLint with zero-warning policy.
- **Supply chain security**: pnpm no-downgrade policy, minimum release age, explicit version overrides.
