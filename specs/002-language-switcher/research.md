# Research: Language Switcher

**Branch**: `002-language-switcher` | **Date**: 2026-03-23

## Research Summary

No NEEDS CLARIFICATION items were identified during Technical Context analysis. All technical decisions are clear from the existing codebase, the completed clarification session, and the spec. This document records the confirmed decisions and their rationale.

---

## Decision 1: Component Type — Astro vs. Preact Island

**Decision**: Implement `LanguageSwitcher.astro` as a **pure Astro static component**. No Preact island needed.

**Rationale**:

- The language switcher is a set of static anchor links — it has no client-side state, no event handlers, and does not read from `sessionStorage`.
- Astro components fully support all required logic: URL path computation, locale comparison, `aria-current` attribute selection, and conditional rendering — all at build time.
- Using a Preact island would add unnecessary JS (~1.5 KB+ per island) and violate Constitution I (Performance by Default): "Every new island must justify its JS cost. If it can be an Astro component, it must be."
- The existing `Nav.astro` is already an Astro component — keeping the switcher in the same layer avoids hydration complexity.

**Alternatives considered**:

- Preact island with `client:load`: Rejected — no client state required. Would add avoidable JS weight.
- Preact island with `client:only="preact"`: Rejected — there is no `sessionStorage` dependency that would cause SSR/client mismatch.

---

## Decision 2: Reading the Current URL Path

**Decision**: `LanguageSwitcher.astro` reads `Astro.url.pathname` **directly** rather than accepting `currentPath` as a prop from `Nav.astro`.

**Rationale**:

- In Astro, all `.astro` components (including deeply nested ones) have access to `Astro.url` at build time during static generation. `Astro.url.pathname` returns the full path of the page being generated, regardless of where in the component tree the component sits.
- This avoids prop-drilling `currentPath` through every page → `BaseLayout` → `Nav` → `LanguageSwitcher`.
- `Nav.astro` currently only receives `locale: Locale` and this can remain unchanged.

**Alternatives considered**:

- Pass `currentPath` as a prop: Rejected — requires updating every page file and every intermediate component. All pages would need `currentPath={Astro.url.pathname}`. Unnecessary coupling given Astro's built-in URL access.

---

## Decision 3: Flag Icon Implementation

**Decision**: Use **Unicode emoji flags** (`🇸🇪`, `🇬🇧`, `🇸🇦`) rendered as inline text with `aria-hidden="true"`.

**Rationale**:

- Unicode emoji flags require zero dependencies, zero bundle weight, and no CDN. They are standard Unicode characters supported by all modern browsers/OS on the target platforms (iOS, Android, modern desktop browsers).
- Satisfies Constitution principle: "No runtime external APIs, CDNs, or third-party scripts." An SVG icon library or external flag sprite would violate this.
- Marking flags as `aria-hidden="true"` ensures they are purely decorative — the visible text and `lang` attribute on each link carry the accessible meaning (FR-014).
- Flag emoji rendering quality on some Linux terminal/older browsers may be degraded, but on the site's primary targets (iPhone 13 mini = iOS, modern desktop) rendering is high quality.

**Arabic locale flag choice** (`🇸🇦`): Saudi Arabia's flag is used as a stand-in for the Arabic locale. This is a documented placeholder (see Assumptions in spec). A globe emoji (`🌐`) is a widely used neutral alternative for language selectors and can be substituted at implementation time with no spec changes needed.

**Alternatives considered**:

- Third-party flag icon library (e.g., `flag-icons`): Rejected — adds a dependency and CSS payload. Violates no-external-CDN constraint.
- Inline SVG flags: Viable but significantly increases per-component HTML weight for what are purely decorative elements. Emoji is simpler and lighter.
- CSS-only flags (using background images): Rejected — requires image assets or data URIs; not simpler than emoji for this use case.

---

## Decision 4: Mobile Responsive Label Strategy

**Decision**: Use an explicit 375 px cutoff to match FR-014. At `<=375 px`: flag + ISO code (`SV`, `EN`, `AR`). At `>=376 px`: flag + full native name (`Svenska`, `English`, `العربية`).

**Rationale**:

- The site's primary narrow viewport is iPhone 13 mini at 375 px. The nav bar contains the site title, `CityYearSelector`, and the switcher — three full locale names at any of these widths would overflow.
- FR-014 requires ISO labels only on narrow mobile (`<=375 px`) and full labels on wider viewports.
- Tailwind v4 arbitrary variants can express this without modifying theme config (`min-[376px]:hidden`, `min-[376px]:inline`).
- Implementation: each locale option renders two sibling spans, e.g. `<span class="min-[376px]:hidden">SV</span><span class="hidden min-[376px]:inline">Svenska</span>`.

**Alternatives considered**:

- Custom named `xs:` breakpoint in theme: Rejected — unnecessary when Tailwind arbitrary variants already provide an exact 375 px cutoff.
- Always show ISO codes only: Rejected — loses full locale name context on tablet/desktop. FR-014 explicitly requires full names on wider viewports.
- CSS container queries: Rejected — adds complexity; Tailwind viewport breakpoints are sufficient.

---

## Decision 5: URL Path Computation for Locale Switching

**Decision**: Implement a **pure utility function** `buildLocaleSwitchUrl(pathname: string, targetLocale: Locale, basePath: string): string` in a dedicated helper module (`src/lib/locale-switch.ts`). Used by `LanguageSwitcher.astro` at build time.

**Rationale**:

- Isolating the URL computation as a pure function makes it independently unit-testable without spinning up an Astro build.
- Algorithm: `${basePath}/${targetLocale}/${pathTail}` where `pathTail` is everything after the locale segment of the stripped path. Query params are dropped per clarification Q1.
- Example: `/forskoleguiden/sv/forskola/alma-forskola/` → target `en` → `/forskoleguiden/en/forskola/alma-forskola/`
- Fallback: if no locale segment is detected (path doesn't start with basePath + known locale), return `${basePath}/${targetLocale}/` (root directory for that locale).

**Alternatives considered**:

- Inline the replacement logic directly in `LanguageSwitcher.astro`: Rejected — inline logic is not unit-testable and hard to validate against edge cases (missing locale segment, root path, trailing slash variants).
- Regex-based replacement: Viable but fragile. The string-split approach is more readable and explicit.
