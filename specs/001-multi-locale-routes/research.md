# Research: Multi-Locale Page Routes

**Branch**: `001-multi-locale-routes` | **Date**: 2026-03-23

## Research Summary

No NEEDS CLARIFICATION items were identified during Technical Context analysis. All technical decisions are clear from the existing codebase and spec. This document records the confirmed decisions and their rationale.

## Decision 1: Page Generation Strategy

**Decision**: Explicit page files per locale (`src/pages/{locale}/`) rather than Astro's built-in `i18n` config or dynamic `[...locale]` catch-all routes.

**Rationale**:

- The project has only 4 route types (directory, detail, comparison, about) — the duplication cost is low (8 new files total).
- Each page file is independently buildable and debuggable.
- No complex dynamic routing logic to maintain.
- Matches the existing `src/pages/sv/` pattern exactly — only the `locale` constant changes.
- Avoids coupling to Astro's `i18n` config which adds unnecessary abstraction for this project size.

**Alternatives considered**:

- Astro `i18n` config option: Rejected — adds config complexity without reducing page file count; project's manual file-based strategy is already working.
- Dynamic `[...locale]` catch-all: Rejected — obscures page structure, harder to debug, and `getStaticPaths()` would need locale-aware enumeration.

## Decision 2: Root Redirect Behavior

**Decision**: Keep the existing `astro.config.ts` redirect (`'/' → '${base}/sv/'`). No changes needed.

**Rationale**:

- Swedish is the default locale per PRD §5.1.
- The redirect is already implemented and generates a static `dist/index.html`.
- Multi-locale page generation does not affect the redirect — adding `/en/` and `/ar/` pages is additive.

**Alternatives considered**:

- Browser language detection redirect: Rejected — requires runtime JS, violates Constitution I (Performance by Default) and VII (Privacy by Design / no external requests).

## Decision 3: SortToggle List ID Per Locale

**Decision**: Use locale-prefixed `listId` values (e.g., `en-preschool-directory-list`, `ar-preschool-directory-list`) to match locale-specific `<ul>` elements.

**Rationale**:

- The Swedish directory page uses `id="sv-preschool-directory-list"` on the `<ul>` and passes `listId="sv-preschool-directory-list"` to `SortToggle`.
- Each locale page will have its own `<ul>` with a locale-prefixed ID to ensure DOM uniqueness.
- The SortToggle already accepts `listId` as a prop — no component changes needed.

**Alternatives considered**:

- Shared ID across locales: Not applicable — each locale renders a separate page, so IDs don't conflict at runtime. However, using consistent locale prefixing follows the existing convention.

## Decision 4: E2e Test URL Constants

**Decision**: Existing Swedish e2e URL constants remain unchanged (per spec assumption). A new e2e test file for multi-locale route verification will use its own locale-specific URLs.

**Rationale**:

- The spec explicitly states: "End-to-end test URL constants are currently hardcoded to Swedish paths. These will need updating in a separate testing step but are not blockers for this feature's core functionality."
- Changing shared constants risks breaking all existing e2e tests.
- A dedicated `multi-locale-routes.spec.ts` test file with its own URL constants is cleaner and lower risk.

**Alternatives considered**:

- Locale-parameterized helper functions: Deferred — useful when all tests need multi-locale support, but premature for this step.

## Decision 5: Post-Build Test Updates

**Decision**: Extend `static-output-verification.test.ts` to assert all three locale directories exist with matching page counts.

**Rationale**:

- The existing test already checks `sv/` pages. Adding `en/` and `ar/` checks follows the same pattern.
- `MIN_HTML_FILE_COUNT` must be updated to account for 3× the locale pages plus the root redirect page.
- The total dist size budget (7000 KB) needs scaling for 3× the pages — approximately 21,000 KB (3 × 7,000 KB).

**Alternatives considered**:

- Separate test file per locale: Rejected — would duplicate test logic. A single test file with a locale loop is more maintainable.
